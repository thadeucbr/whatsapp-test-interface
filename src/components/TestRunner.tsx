import React from 'react';
import { useStore } from '../store';
import { sendMessage } from '../socket';
import { Send, Play } from 'lucide-react';
import { Message } from '../types';
import { verifySingleResponse, TestResult as TestResultType } from '../utils/testRunnerUtils';
import { TestResultItem } from './TestResultItem';

export const TestRunner: React.FC = () => {
  const [message, setMessage] = React.useState('');
  const [currentInteractionIndex, setCurrentInteractionIndex] = React.useState<number>(-1);
  const [currentResponseIndex, setCurrentResponseIndex] = React.useState<number>(-1);
  const [testResults, setTestResults] = React.useState<TestResultType[]>([]);
  const { testCases, currentTestId, connected, messages, recordingTestCase } = useStore();
  // Se estiver gravando um teste, utiliza-o; caso contrário, utiliza o teste selecionado
  const currentTest = recordingTestCase || testCases.find((tc) => tc.id === currentTestId);
  const lastMessageRef = React.useRef<Message | null>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  // Ao iniciar a gravação, foca automaticamente no chatbox para digitação
  React.useEffect(() => {
    if (recordingTestCase && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [recordingTestCase]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const runTest = () => {
    if (currentTest && currentTest.interactions.length > 0) {
      setCurrentInteractionIndex(0);
      setCurrentResponseIndex(0);
      setTestResults([]);
      const interaction = currentTest.interactions[0];
      if (interaction.expectedResponses.length > 0) {
        sendMessage(interaction.userMessage);
      }
    }
  };

  React.useEffect(() => {
    if (currentInteractionIndex === -1 || currentResponseIndex === -1 || !currentTest) return;

    const currentMessage = messages[messages.length - 1];

    if (currentMessage && currentMessage !== lastMessageRef.current && !currentMessage.isUser) {
      lastMessageRef.current = currentMessage;
      const currentInteraction = currentTest.interactions[currentInteractionIndex];
      const expectedResponse = currentInteraction.expectedResponses[currentResponseIndex];

      const result = verifySingleResponse(
        expectedResponse,
        currentMessage,
        currentInteractionIndex,
        currentResponseIndex
      );
      setTestResults((prev) => [...prev, result]);

      if (result.success) {
        if (currentResponseIndex < currentInteraction.expectedResponses.length - 1) {
          setCurrentResponseIndex(currentResponseIndex + 1);
        } else {
          if (currentInteractionIndex < currentTest.interactions.length - 1) {
            const nextInteractionIndex = currentInteractionIndex + 1;
            const nextInteraction = currentTest.interactions[nextInteractionIndex];
            setCurrentInteractionIndex(nextInteractionIndex);
            setCurrentResponseIndex(0);
            setTimeout(() => {
              sendMessage(nextInteraction.userMessage);
            }, 2000);
          } else {
            setCurrentInteractionIndex(-1);
            setCurrentResponseIndex(-1);
          }
        }
      } else {
        setCurrentInteractionIndex(-1);
        setCurrentResponseIndex(-1);
      }
    }
  }, [currentInteractionIndex, currentResponseIndex, currentTest, messages]);

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(60vh-12rem)]">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Test Runner</h2>
        <div className="flex items-center mt-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      {currentTest ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{currentTest.name}</h3>
            {currentTest.interactions.length > 0 && (
              <button
                onClick={runTest}
                disabled={!connected || currentInteractionIndex !== -1}
                className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Play className="w-4 h-4" />
                <span>Run Test</span>
              </button>
            )}
          </div>
          <form onSubmit={handleSend} className="flex space-x-2">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              rows={4}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!message.trim() || !connected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {currentInteractionIndex !== -1 && currentResponseIndex !== -1 && (
            <div className="text-sm text-gray-600">
              Running interaction {currentInteractionIndex + 1} of {currentTest.interactions.length}, response{' '}
              {currentResponseIndex + 1} of {currentTest.interactions[currentInteractionIndex].expectedResponses.length}...
            </div>
          )}
          {testResults.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-gray-800">Test Results</h4>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <TestResultItem key={index} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a test case to begin testing</p>
        </div>
      )}
    </div>
  );
};
