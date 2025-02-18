import { io } from 'socket.io-client';
import { useStore } from './store';

const socket = io('https://whatsappapi.barbudas.com');

socket.on('connect', () => {
  useStore.getState().setConnected(true);
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  useStore.getState().setConnected(false);
  console.log('Disconnected from server');
});

socket.on('newMessage', (message) => {
  const store = useStore.getState();
  const selectedPhoneNumber = store.selectedPhoneNumber;

  // Only add the message if it's from the selected phone number
  if (message.from === selectedPhoneNumber || message.to === selectedPhoneNumber) {
    store.addMessage({
      id: Date.now().toString(),
      content: message.body.text,
      timestamp: message.timestamp,
      isUser: false,
      type: message.type,
      options: message.body.options || undefined,
      buttonText: message.body.buttonText || undefined,
      phoneNumber: message.from,
    });
  }
});

socket.on('pong', () => {
  console.log('Received pong from server');
});

export const sendMessage = (message: string) => {
  const store = useStore.getState();
  const selectedPhoneNumber = store.selectedPhoneNumber;

  if (!selectedPhoneNumber) {
    console.error('No phone number selected');
    return;
  }

  const payload = {
    to: selectedPhoneNumber,
    message,
  };

  socket.emit('sendMessage', payload);
  store.addMessage({
    id: Date.now().toString(),
    content: message,
    timestamp: Date.now(),
    isUser: true,
    type: 'text',
    phoneNumber: selectedPhoneNumber,
  });
};

export const checkConnection = () => {
  socket.emit('ping');
};

export default socket;