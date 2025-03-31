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

    expect(screen.getByText('Análise de Conversa de IA')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Análise')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  test('disables Start Analysis button when no conversation', () => {
    mockUseStore.mockReturnValue({
      messages: [],
      selectedPhoneNumber: '1234567890',
    });

    render(<AIAnalysis />);

    const button = screen.getByText('Iniciar Análise') as HTMLButtonElement;
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
          category: 'Facilidade de Uso',
          score: 4,
          justification: 'The interface is intuitive.',
        },
        {
          category: 'Consistência da Persona',
          score: 5,
          justification: 'Consistent responses.',
        },
        {
          category: 'Qualidade da Escrita',
          score: 4.5,
          justification: 'Well-written messages.',
        },
        {
          category: 'Geral',
          score: 4.5,
          justification: 'Bom desempenho geral.',
        },
      ],
      suggestions: ['Melhorar o tempo de resposta.', 'Adicionar mais opções interativas.'],
    };

    mockUseStore.mockReturnValue({
      messages: mockConversation,
      selectedPhoneNumber: '1234567890',
    });

    vi.spyOn(axios, 'post').mockResolvedValue({ data: mockAnalysis });

    render(<AIAnalysis />);

    const button = screen.getByText('Iniciar Análise');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Analisando...');

    await waitFor(() => {
      expect(screen.getByText('Resultados da Análise')).toBeInTheDocument();
      expect(screen.getByText('Sugestões para Melhoria')).toBeInTheDocument();
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
    expect(button).toHaveTextContent('Iniciar Análise');
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

    const button = screen.getByText('Iniciar Análise');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Analisando...');

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Ocorreu um erro ao analisar a conversa.');
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Iniciar Análise');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
