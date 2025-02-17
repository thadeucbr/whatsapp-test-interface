import { io } from 'socket.io-client';
import { useStore } from './store';

const socket = io('http://192.168.1.239:3001');

socket.on('connect', () => {
  useStore.getState().setConnected(true);
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  useStore.getState().setConnected(false);
  console.log('Disconnected from server');
});

socket.on('newMessage', (message) => {
  useStore.getState().addMessage({
    id: Date.now().toString(),
    content: message.body.text,
    timestamp: message.timestamp,
    isUser: false,
    type: message.type,
    options: message.body.options || undefined,
    buttonText: message.body.buttonText || undefined,
  });
});

socket.on('pong', () => {
  console.log('Received pong from server');
});

export const sendMessage = (message: string) => {
  const payload = {
    to: '551126509993@c.us',
    message,
  };
  socket.emit('sendMessage', payload);
  useStore.getState().addMessage({
    id: Date.now().toString(),
    content: message,
    timestamp: Date.now(),
    isUser: true,
    type: 'text',
  });
};

export const checkConnection = () => {
  socket.emit('ping');
};

export default socket;