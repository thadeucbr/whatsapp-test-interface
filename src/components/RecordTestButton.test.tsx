import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordTestButton } from './RecordTestButton';
import { vi, Mock } from 'vitest';
import * as store from '../store';
import { TestCase } from '../types';

vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

describe('RecordTestButton Component', () => {
  const mockSetRecordingTestCase = vi.fn();
  const mockAddTestCase = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Mic icon when not recording', () => {
    (store.useStore as unknown as Mock).mockReturnValue({
      recordingTestCase: null,
      setRecordingTestCase: mockSetRecordingTestCase,
      addTestCase: mockAddTestCase,
    });

    render(<RecordTestButton />);

    expect(screen.getByTitle('Gravar novo teste')).toBeInTheDocument();
    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('mic-icon'));
  });

  it('starts recording when clicked and sets a new test case', async () => {
    const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1609459200000); // Mock date to a fixed timestamp

    (store.useStore as unknown as Mock).mockReturnValue({
      recordingTestCase: null,
      setRecordingTestCase: mockSetRecordingTestCase,
      addTestCase: mockAddTestCase,
    });

    render(<RecordTestButton />);

    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });

    expect(mockSetRecordingTestCase).toHaveBeenCalledWith({
      id: '1609459200000',
      name: 'Novo Teste (Gravando)',
      interactions: [],
    });

    mockDateNow.mockRestore();
  });

  it('renders Stop icon when recording', () => {
    (store.useStore as unknown as Mock).mockReturnValue({
      recordingTestCase: {
        id: 'test123',
        name: 'Teste Gravando',
        interactions: [],
      },
      setRecordingTestCase: mockSetRecordingTestCase,
      addTestCase: mockAddTestCase,
    });

    render(<RecordTestButton />);

    expect(screen.getByTitle('Encerrar teste e salvar')).toBeInTheDocument();
    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('stop-icon'));
  });

  it('stops recording and saves the test case when clicked', async () => {
    const recordingTestCase: TestCase = {
      id: 'test123',
      name: 'Teste Gravando',
      interactions: [],
    };

    (store.useStore as unknown as Mock).mockReturnValue({
      recordingTestCase: recordingTestCase,
      setRecordingTestCase: mockSetRecordingTestCase,
      addTestCase: mockAddTestCase,
    });

    render(<RecordTestButton />);

    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });

    expect(mockAddTestCase).toHaveBeenCalledWith(recordingTestCase);
    expect(mockSetRecordingTestCase).toHaveBeenCalledWith(null);
  });
});
