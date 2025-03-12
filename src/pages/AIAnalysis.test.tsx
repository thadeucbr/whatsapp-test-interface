import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import axios from 'axios';
import { useStore } from '../store';
import AIAnalysis from './AIAnalysis';

// Mock the useStore hook
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

// Mock the ChatPanel component
vi.mock('../components/ChatPanel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat Panel</div>,
}));

describe('AIAnalysis Component', () => {
  const mockUseStore = useStore as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    mockUseStore.mockReturnValue({
      messages: [],
      selectedPhoneNumber: '1234567890',
    });

    render(<AIAnalysis />);

    expect(screen.getByText('AI Conversation Analysis')).toBeInTheDocument();
    expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  test('disables Start Analysis button when no conversation', () => {
    mockUseStore.mockReturnValue({
      messages: [],
      selectedPhoneNumber: '1234567890',
    });

    render(<AIAnalysis />);

    const button = screen.getByText('Start Analysis') as HTMLButtonElement;
    expect(button).toBeDisabled();
  });

  test('starts analysis and displays results on success', async () => {
    const mockConversation = [
      {
        id: '1',
        phoneNumber: '1234567890',
        isUser: true,
        content: 'Hello',
      },
      {
        id: '2',
        phoneNumber: '1234567890',
        isUser: false,
        content: 'Hi there!',
      },
    ];

    const mockAnalysis = {
      ratings: [
        {
          category: 'Ease of Use',
          score: 4,
          justification: 'The interface is intuitive.',
        },
        {
          category: 'Persona Consistency',
          score: 5,
          justification: 'Consistent responses.',
        },
        {
          category: 'Writing Quality',
          score: 4.5,
          justification: 'Well-written messages.',
        },
        {
          category: 'Overall',
          score: 4.5,
          justification: 'Good overall performance.',
        },
      ],
      suggestions: ['Improve response time.', 'Add more interactive options.'],
    };

    mockUseStore.mockReturnValue({
      messages: mockConversation,
      selectedPhoneNumber: '1234567890',
    });

    vi.spyOn(axios, 'post').mockResolvedValue({ data: mockAnalysis });

    render(<AIAnalysis />);

    const button = screen.getByText('Start Analysis');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Analyzing...');

    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Suggestions for Improvement')).toBeInTheDocument();
    });

    // Check ratings
    mockAnalysis.ratings.forEach((rating) => {
      expect(screen.getByText(rating.category)).toBeInTheDocument();
      // Use getAllByText and verify at least one element matches
      const scoreElements = screen.getAllByText(`(${rating.score})`);
      expect(scoreElements.length).toBeGreaterThan(0);
      expect(screen.getByText(rating.justification)).toBeInTheDocument();
    });

    // Check suggestions
    mockAnalysis.suggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Start Analysis');
  });

  test('shows error alert on API failure', async () => {
    const alertMock = vi.fn();
    window.alert = alertMock;

    const mockConversation = [
      {
        id: '1',
        phoneNumber: '1234567890',
        isUser: true,
        content: 'Hello',
      },
    ];

    mockUseStore.mockReturnValue({
      messages: mockConversation,
      selectedPhoneNumber: '1234567890',
    });

    vi.spyOn(axios, 'post').mockRejectedValue(new Error('API Error'));

    // Suppress console.error to avoid cluttering test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AIAnalysis />);

    const button = screen.getByText('Start Analysis');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Analyzing...');

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('An error occurred while analyzing the conversation.');
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Start Analysis');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});