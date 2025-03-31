import React from 'react';
import { useStore } from '../store';
import { sendMessage } from '../socket';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { Message } from '../types';
import { verifySingleResponse, TestResult as TestResultType } from '../utils/testRunnerUtils';
import { TestResultItem } from './TestResultItem';

export const TestRunner: React.FC = () => {
  const [currentInteractionIndex, setCurrentInteractionIndex] = React.useState<number>(-1);
  const [currentResponseIndex, setCurrentResponseIndex] = React.useState<number>(-1);
  const [testResults, setTestResults] = React.useState<TestResultType[]>([]);
  const [isBusy, setIsBusy] = React.useState(false);
  const { testCases, currentTestId, connected, messages } = useStore();
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);
  const currentTest = testCases.find((tc) => tc.id === currentTestId);
  const lastMessageRef = React.useRef<Message | null>(null);

  const runTest = () => {
    if (currentTest && currentTest.interactions.length > 0) {
      setIsBusy(true);
      setCurrentInteractionIndex(0);
      setCurrentResponseIndex(0);
      setTestResults([]);
      const interaction = currentTest.interactions[0];
      if (interaction.expectedResponses.length > 0) {
        sendMessage(interaction.userMessage);
      }
    }
  };

  const handleResetContext = async () => {
    if (!selectedPhoneNumber) return;
    setIsBusy(true);
    const payload = {
      phone: '5518981851760@c.us',
      router: selectedPhoneNumber
    };
    await fetch('https://whatsappapi.barbudas.com/api/v1/blip/context/reset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsBusy(false);
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

  React.useEffect(() => {
    if (
      isBusy &&
      currentInteractionIndex === -1 &&
      currentResponseIndex === -1 &&
      testResults.length > 0
    ) {
      setIsBusy(false);
    }
  }, [currentInteractionIndex, currentResponseIndex, testResults, isBusy]);

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(60vh-12rem)]">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">Executor de Testes</h2>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">{connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          {currentTest && currentTest.interactions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResetContext}
                disabled={!connected || isBusy || !selectedPhoneNumber}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                title="Redefinir contexto da conversa"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Redefinir</span>
              </button>
              <button
                onClick={runTest}
                disabled={!connected || isBusy || currentInteractionIndex !== -1}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                title="Iniciar execução do teste"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Executar</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {currentTest ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">{currentTest.name}</h3>
          </div>
          {currentInteractionIndex !== -1 && currentResponseIndex !== -1 && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center text-sm text-blue-700">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                Executando interação {currentInteractionIndex + 1} de {currentTest.interactions.length}, resposta{' '}
                {currentResponseIndex + 1} de {currentTest.interactions[currentInteractionIndex].expectedResponses.length}...
              </div>
            </div>
          )}
          {testResults.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-gray-800">Resultados do Teste</h4>
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
          <p className="text-gray-500">Selecione um caso de teste para começar a testar</p>
        </div>
      )}
    </div>
  );
};
