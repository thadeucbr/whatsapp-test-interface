import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneSelector } from './PhoneSelector';
import { vi } from 'vitest';
import * as store from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn()
}));

describe('PhoneSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and select element with formatted option', () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    (store.useStore as any).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: '551126509993@c.us',
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        phoneNumbers: [],
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        setPhoneNumbers: vi.fn(),
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
    expect(screen.getByText('Institucional PF (1126509993)')).toBeInTheDocument();
  });

  it('sets default phone number when none is selected', async () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    (store.useStore as any).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: null,
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        phoneNumbers: [],
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        setPhoneNumbers: vi.fn(),
        addFolder: vi.fn(),
        updateFolder: vi.fn(),
        deleteFolder: vi.fn(),
      };
      return selector(state);
    });

    render(<PhoneSelector />);

    await waitFor(() => {
      expect(mockSetSelectedPhoneNumber).toHaveBeenCalledWith('551126509993@c.us');
    });
  });

  it('calls setSelectedPhoneNumber on select change', async () => {
    const mockSetSelectedPhoneNumber = vi.fn();
    (store.useStore as any).mockImplementation((selector: any) => {
      const state = {
        selectedPhoneNumber: '551126509993@c.us',
        setSelectedPhoneNumber: mockSetSelectedPhoneNumber,
        testCases: [],
        folders: [],
        currentTestId: null,
        messages: [],
        connected: false,
        phoneNumbers: [],
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        deleteTestCase: vi.fn(),
        setCurrentTestId: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setConnected: vi.fn(),
        setPhoneNumbers: vi.fn(),
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