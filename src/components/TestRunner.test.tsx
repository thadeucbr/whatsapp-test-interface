import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { TestRunner } from './TestRunner';
import { sendMessage } from '../socket';
import { Message, TestCase } from '../types';

// Define a mutable mockStore
let mockStore: {
  testCases: TestCase[];
  currentTestId: string;
  connected: boolean;
  messages: Message[];
  recordingTestCase: boolean | null;
  selectedPhoneNumber: string; // Added selectedPhoneNumber
  addMessage: Mock;
  setTestCases: Mock;
  setCurrentTestId: Mock;
  setConnected: Mock;
  setMessages: Mock;
  setRecordingTestCase: Mock;
};

// Initialize default test case
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

// Mock the useStore hook with a dynamic implementation
vi.mock('../store', () => ({
  useStore: () => mockStore,
}));

// Mock sendMessage
vi.mock('../socket', () => ({
  sendMessage: vi.fn(),
}));

describe('TestRunner Component', () => {
  const mockSendMessage = sendMessage as unknown as Mock;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize the mock store state
    mockStore = {
      testCases: [defaultTestCase],
      currentTestId: 'test1',
      connected: true,
      messages: [],
      selectedPhoneNumber: '1234567890', // Set a valid phone number
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
    expect(screen.getByText('Test Runner')).toBeInTheDocument();
    expect(screen.getByText('Sample Test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run test/i })).toBeInTheDocument();
  });

  it('disables Run Test button when not connected', () => {
    // Update the mock store to be disconnected
    act(() => {
      mockStore.connected = false;
    });

    render(<TestRunner />);
    const runButton = screen.getByRole('button', {
      name: /run test/i,
    }) as HTMLButtonElement;
    expect(runButton).toBeDisabled();
  });

  it('handles sending a message', () => {
    const { container } = render(<TestRunner />);
    const textarea = screen.getByPlaceholderText(
      'Type a message...'
    ) as HTMLTextAreaElement;
    const sendButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(sendButton).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    expect(textarea.value).toBe('Test message');

    fireEvent.click(sendButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    expect(textarea.value).toBe('');
  });

  it('prevents sending empty messages', () => {
    const { container } = render(<TestRunner />);
    const sendButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(sendButton).toBeDisabled();
  });

  it('runs a test and sends the first interaction message', () => {
    render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    expect(
      screen.getByText(/Running interaction 1 of 1, response 1 of 1\.\.\./i)
    ).toBeInTheDocument();
  });

  it('displays test results after receiving messages', async () => {
    const { rerender } = render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');

    // Simulate receiving a new message
    const newMessage: Message = {
      id: 'msg1',
      content: 'Hi there!',
      timestamp: Date.now(),
      isUser: false,
      type: 'text',
      phoneNumber: '1234567890',
    };

    // Update the mock store with the new message within act
    await act(async () => {
      mockStore.setMessages([newMessage]);
    });

    rerender(<TestRunner />);

    await waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument();
      expect(screen.getByText(/Success/i)).toBeInTheDocument();
    });
  });

  it('handles multiple interactions', async () => {
    const multiTestCase = {
      id: 'test2',
      name: 'Multi Interaction Test',
      interactions: [
        {
          userMessage: 'Hello',
          expectedResponses: [{ type: 'text', body: { text: 'Hi there!' } }],
        },
        {
          userMessage: 'Choose an option',
          expectedResponses: [
            {
              type: 'button',
              body: { text: 'Choose an option', buttonText: 'Option 1' },
            },
          ],
        },
      ],
    };

    // Initialize the mock store with the multi interaction test case
    await act(async () => {
      mockStore.setTestCases([multiTestCase]);
      mockStore.setCurrentTestId('test2');
    });

    const { rerender } = render(<TestRunner />);
    const runButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.click(runButton);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');

    // Simulate first response
    const firstMessage: Message = {
      id: 'msg1',
      content: 'Hi there!',
      timestamp: Date.now(),
      isUser: false,
      type: 'text',
      phoneNumber: '1234567890',
    };

    // Update the mock store with the first message within act
    await act(async () => {
      mockStore.setMessages([firstMessage]);
    });

    rerender(<TestRunner />);

    // Simulate second response
    const secondMessage: Message = {
      id: 'msg2',
      content: 'Choose an option',
      timestamp: Date.now(),
      isUser: false,
      type: 'button',
      buttonText: 'Option 1',
      phoneNumber: '1234567890',
    };

    // Update the mock store with the second message within act
    await act(async () => {
      mockStore.setMessages([firstMessage, secondMessage]);
    });

    rerender(<TestRunner />);

    await waitFor(() => {
      expect(screen.getByText(/Test Results/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Success/i)).toHaveLength(2);
    });
  });
});
