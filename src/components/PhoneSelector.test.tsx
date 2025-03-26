/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneSelector } from './PhoneSelector';
import { vi, Mock } from 'vitest';
import { useStore } from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn()
}));

const MOCK_PHONES = [
  { name: 'Beta Institucional PF', number: '551126509993@c.us' },
  { name: 'Beta PJ', number: '551126509977@c.us' },
];

describe('PhoneSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and select element with formatted options', () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    (useStore as Mock).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: '551126509993@c.us',
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        phoneNumbers: MOCK_PHONES,
        setPhoneNumbers: vi.fn(),
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        addFolder: vi.fn(),
        updateFolder: vi.fn(),
        deleteFolder: vi.fn(),
      };
      return selector(state);
    });

    render(<PhoneSelector />);
    expect(screen.getByText('Select Phone Number')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('551126509993@c.us');
    expect(screen.getByText('Beta Institucional PF (1126509993)')).toBeInTheDocument();
    expect(screen.getByText('Beta PJ (1126509977)')).toBeInTheDocument();
  });

  it('sets default phone number when none is selected', async () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    const mockSetPhoneNumbers = vi.fn();
    (useStore as Mock).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: null,
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        phoneNumbers: [],
        setPhoneNumbers: mockSetPhoneNumbers,
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        addFolder: vi.fn(),
        updateFolder: vi.fn(),
        deleteFolder: vi.fn(),
      };
      return selector(state);
    });

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => MOCK_PHONES,
    } as Response);

    render(<PhoneSelector />);

    await waitFor(() => {
      expect(mockSetPhoneNumbers).toHaveBeenCalledWith(MOCK_PHONES);
      expect(mockSetSelectedPhoneNumber).toHaveBeenCalledWith('551126509993@c.us');
    });

    fetchMock.mockRestore();
  });

  it('calls setSelectedPhoneNumber on select change', async () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    (useStore as Mock).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: '551126509993@c.us',
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        phoneNumbers: MOCK_PHONES,
        setPhoneNumbers: vi.fn(),
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        addFolder: vi.fn(),
        updateFolder: vi.fn(),
        deleteFolder: vi.fn(),
      };
      return selector(state);
    });

    render(<PhoneSelector />);
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '');
    expect(mockSetSelectedPhoneNumber).toHaveBeenCalledWith('');
  });
});