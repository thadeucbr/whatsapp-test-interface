import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { TestRunner } from './TestRunner';
import { sendMessage } from '../socket';
import { Message, TestCase } from '../types';

let mockStore: {
  testCases: TestCase[];
  currentTestId: string;
  connected: boolean;
  messages: Message[];
  recordingTestCase: boolean | null;
  selectedPhoneNumber: string;
  addMessage: Mock;
  setTestCases: Mock;
  setCurrentTestId: Mock;
  setConnected: Mock;
  setMessages: Mock;
  setRecordingTestCase: Mock;
};

const defaultTestCase: TestCase = {
  id: 'test1',
  name: 'Sample Test',
  interactions: [
    {
      userMessage: 'Hello',
      expectedResponses: [
        {
          type: 'text',
          body: {
            text: 'Hi there!',
            buttonText: null,
            options: null,
          },
          from: 'bot',
          timestamp: Date.now(),
        },
      ],
    },
  ],
};

vi.mock('../store', () => ({
  useStore: () => mockStore,
}));

vi.mock('../socket', () => ({
  sendMessage: vi.fn(),
}));

describe('TestRunner Component', () => {
  const mockSendMessage = sendMessage as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      testCases: [defaultTestCase],
      currentTestId: 'test1',
      connected: true,
      messages: [],
      selectedPhoneNumber: '1234567890',
      recordingTestCase: null,
      addMessage: vi.fn(),
      setTestCases: vi.fn((newTestCases) => {
        mockStore.testCases = newTestCases;
      }),
      setCurrentTestId: vi.fn((id) => {
        mockStore.currentTestId = id;
      }),
      setConnected: vi.fn((status) => {
        mockStore.connected = status;
      }),
      setMessages: vi.fn((newMessages) => {
        mockStore.messages = newMessages;
      }),
      setRecordingTestCase: vi.fn((testCase) => {
        mockStore.recordingTestCase = testCase;
      }),
    };
  });

  it('renders TestRunner component', () => {
    render(<TestRunner />);
    expect(screen.getByText('Executor de Testes')).toBeInTheDocument();
    expect(screen.getByText('Sample Test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /executar/i })).toBeInTheDocument();
  });

  it('disables Executar button when not connected', () => {
    act(() => {
      mockStore.connected = false;
    });
    render(<TestRunner />);
    const runButton = screen.getByRole('button', {
      name: /executar/i,
    }) as HTMLButtonElement;
    expect(runButton).toBeDisabled();
  });

  it('runs a test and sends the first interaction message', () => {
    render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /executar/i });
    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    expect(
      screen.getByText(/Executando interação 1 de 1, resposta 1 de 1\.\.\./i)
    ).toBeInTheDocument();
  });

  it('displays test results after receiving messages', async () => {
    const { rerender } = render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /executar/i });
    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');

    const newMessage: Message = {
      id: 'msg1',
      content: 'Hi there!',
      timestamp: Date.now(),
      isUser: false,
      type: 'text',
      phoneNumber: '1234567890',
    };

    await act(async () => {
      mockStore.setMessages([newMessage]);
    });

    rerender(<TestRunner />);
    await waitFor(() => {
      expect(screen.getByText('Resultados do Teste')).toBeInTheDocument();
      expect(screen.getByText(/Sucesso/i)).toBeInTheDocument();
    });
  });

  it('handles multiple interactions', async () => {
    const multiTestCase = {
      id: 'test2',
      name: 'Multi Interaction Test',
      interactions: [
        {
          userMessage: 'Hello',
          expectedResponses: [
            { type: 'text', body: { text: 'Hi there!', buttonText: null, options: null }, from: 'bot', timestamp: Date.now() }
          ],
        },
        {
          userMessage: 'Choose an option',
          expectedResponses: [
            { type: 'button', body: { text: 'Choose an option', buttonText: 'Option 1', options: null }, from: 'bot', timestamp: Date.now() }
          ],
        },
      ],
    };

    await act(async () => {
      mockStore.setTestCases([multiTestCase]);
      mockStore.setCurrentTestId('test2');
    });

    const { rerender } = render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /executar/i });
    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');

    const firstMessage: Message = {
      id: 'msg1',
      content: 'Hi there!',
      timestamp: Date.now(),
      isUser: false,
      type: 'text',
      phoneNumber: '1234567890',
    };

    await act(async () => {
      mockStore.setMessages([firstMessage]);
    });

    rerender(<TestRunner />);

    const secondMessage: Message = {
      id: 'msg2',
      content: 'Choose an option',
      timestamp: Date.now(),
      isUser: false,
      type: 'button',
      buttonText: 'Option 1',
      phoneNumber: '1234567890',
    };

    await act(async () => {
      mockStore.setMessages([firstMessage, secondMessage]);
    });

    rerender(<TestRunner />);
    await waitFor(() => {
      expect(screen.getByText(/Resultados do Teste/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Sucesso/i)).toHaveLength(2);
    });
  });
});
