import React from 'react';
import { useStore } from '../store';
import { sendMessage } from '../socket';
import { Send, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Message, TestInteraction, Button, Row, InteractiveOption } from '../types';

interface TestResult {
  interactionIndex: number;
  success: boolean;
  error?: string;
  details?: {
    field: string;
    expected: string;
    received: string;
  }[];
}

export const TestRunner: React.FC = () => {
  const [message, setMessage] = React.useState('');
  const [currentInteractionIndex, setCurrentInteractionIndex] = React.useState<number>(-1);
  const [testResults, setTestResults] = React.useState<TestResult[]>([]);
  const { testCases, currentTestId, connected, messages } = useStore();
  const currentTest = testCases.find((tc) => tc.id === currentTestId);
  const lastMessageRef = React.useRef<Message | null>(null);

  const compareOptions = (
    expected: any[],
    received: any[],
    type: 'button' | 'list' | 'interactive'
  ): { success: boolean; error?: string; details?: any[] } => {
    if (expected.length !== received.length) {
      return {
        success: false,
        error: `Expected ${expected.length} ${type}s but received ${received.length}`,
      };
    }

    const details: { field: string; expected: string; received: string }[] = [];

    for (let i = 0; i < expected.length; i++) {
      if (type === 'button') {
        const expectedButton = expected[i] as Button;
        const receivedButton = received[i] as Button;

        if (expectedButton.text !== receivedButton.text) {
          details.push({
            field: `Button ${i + 1} text`,
            expected: expectedButton.text,
            received: receivedButton.text,
          });
        }
      } else if (type === 'list') {
        const expectedRow = expected[i] as Row;
        const receivedRow = received[i] as Row;

        if (expectedRow.title !== receivedRow.title) {
          details.push({
            field: `List item ${i + 1} title`,
            expected: expectedRow.title,
            received: receivedRow.title,
          });
        }

        if (expectedRow.description !== receivedRow.description) {
          details.push({
            field: `List item ${i + 1} description`,
            expected: expectedRow.description,
            received: receivedRow.description,
          });
        }
      } else if (type === 'interactive') {
        const expectedOption = expected[i] as InteractiveOption;
        const receivedOption = received[i] as InteractiveOption;

        if (expectedOption.displayText !== receivedOption.displayText) {
          details.push({
            field: `Interactive option ${i + 1} display text`,
            expected: expectedOption.displayText,
            received: receivedOption.displayText,
          });
        }

        if (expectedOption.url !== receivedOption.url) {
          details.push({
            field: `Interactive option ${i + 1} URL`,
            expected: expectedOption.url,
            received: receivedOption.url,
          });
        }
      }
    }

    return {
      success: details.length === 0,
      error: details.length > 0 ? `${type} content mismatch` : undefined,
      details: details.length > 0 ? details : undefined,
    };
  };

  const verifyResponse = (interaction: TestInteraction, receivedMessage: Message): TestResult => {
    const expected = interaction.expectedResponses[0];
    const result: TestResult = {
      interactionIndex: currentInteractionIndex,
      success: true,
    };

    if (expected.type !== receivedMessage.type) {
      return {
        ...result,
        success: false,
        error: `Message type mismatch`,
        details: [{
          field: 'Message type',
          expected: expected.type,
          received: receivedMessage.type,
        }],
      };
    }

    if (expected.body.text !== receivedMessage.content) {
      return {
        ...result,
        success: false,
        error: 'Message content mismatch',
        details: [{
          field: 'Message text',
          expected: expected.body.text,
          received: receivedMessage.content,
        }],
      };
    }

    if (expected.type !== 'text' && expected.body.options) {
      const optionsComparison = compareOptions(
        expected.body.options,
        receivedMessage.options || [],
        expected.type
      );

      if (!optionsComparison.success) {
        return {
          ...result,
          success: false,
          error: optionsComparison.error,
          details: optionsComparison.details,
        };
      }
    }

    return result;
  };

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
      setTestResults([]);
      const interaction = currentTest.interactions[0];
      sendMessage(interaction.userMessage);
    }
  };

  React.useEffect(() => {
    if (currentInteractionIndex >= 0 && currentTest) {
      const currentMessage = messages[messages.length - 1];
      
      if (currentMessage && currentMessage !== lastMessageRef.current && !currentMessage.isUser) {
        lastMessageRef.current = currentMessage;
        const currentInteraction = currentTest.interactions[currentInteractionIndex];
        const result = verifyResponse(currentInteraction, currentMessage);
        setTestResults(prev => [...prev, result]);

        if (result.success) {
          const timer = setTimeout(() => {
            if (currentInteractionIndex < currentTest.interactions.length - 1) {
              setCurrentInteractionIndex(currentInteractionIndex + 1);
              const nextInteraction = currentTest.interactions[currentInteractionIndex + 1];
              sendMessage(nextInteraction.userMessage);
            } else {
              setCurrentInteractionIndex(-1);
            }
          }, 2000);
          return () => clearTimeout(timer);
        } else {
          setCurrentInteractionIndex(-1);
        }
      }
    }
  }, [currentInteractionIndex, currentTest, messages]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Test Runner</h2>
        <div className="flex items-center mt-2">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      {currentTest ? (
        <div className="space-y-4">
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
          {currentInteractionIndex !== -1 && (
            <div className="text-sm text-gray-600">
              Running interaction {currentInteractionIndex + 1} of{' '}
              {currentTest.interactions.length}...
            </div>
          )}
          {testResults.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-gray-800">Test Results</h4>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-start space-x-3 ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Interaction {result.interactionIndex + 1}:{' '}
                        {result.success ? 'Success' : 'Failed'}
                      </p>
                      {!result.success && result.details && (
                        <div className="mt-2 space-y-3 text-sm text-red-700">
                          <p className="font-medium">{result.error}</p>
                          {result.details.map((detail, i) => (
                            <div key={i} className="space-y-1 pl-4 border-l-2 border-red-200">
                              <p className="font-medium">{detail.field}:</p>
                              <div className="space-y-1">
                                <div>
                                  <span className="font-medium">Expected: </span>
                                  <pre className="inline bg-red-100 px-1 rounded">{detail.expected}</pre>
                                </div>
                                <div>
                                  <span className="font-medium">Received: </span>
                                  <pre className="inline bg-red-100 px-1 rounded">{detail.received}</pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Select a test case to begin testing</p>
      )}
    </div>
  );
};