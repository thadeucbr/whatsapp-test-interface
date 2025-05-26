import { io } from 'socket.io-client';
import { useStore } from './store';

const socket = io(import.meta.env.VITE_SOCKET_URL);

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

  // Adiciona a mensagem na lista (mantendo o fluxo atual)
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

    // Se estiver gravando, adiciona a resposta do bot à última interação registrada
    if (store.recordingTestCase) {
      const currentTest = store.recordingTestCase;
      if (currentTest.interactions.length > 0) {
        const lastInteraction = currentTest.interactions[currentTest.interactions.length - 1];
        const newExpectedResponse = {
          from: message.from,
          body: {
            text: message.body.text,
            buttonText: message.body.buttonText || null,
            options: message.body.options || null,
          },
          timestamp: message.timestamp,
          type: message.type,
        };
        lastInteraction.expectedResponses.push(newExpectedResponse);
        store.setRecordingTestCase({
          ...currentTest,
        });
      }
    }
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

  // Se estiver gravando um teste, registra a mensagem do usuário como nova interação
  if (store.recordingTestCase) {
    const newInteraction = { userMessage: message, expectedResponses: [] };
    store.setRecordingTestCase({
      ...store.recordingTestCase,
      interactions: [...store.recordingTestCase.interactions, newInteraction],
    });
  }

  const payload = { to: selectedPhoneNumber, message };
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