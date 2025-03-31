import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPanel } from './ChatPanel';
import { vi } from 'vitest';
import * as store from '../store';
import { sendMessage } from '../socket';

vi.mock('../store', () => ({
  useStore: vi.fn()
}));

vi.mock('../socket', () => ({
  sendMessage: vi.fn(),
}));

describe('ChatPanel Component', () => {
  const scrollIntoViewMock = vi.fn();

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  });

  beforeEach(() => {
    (store.useStore as any).mockImplementation((selector: any) => {
      const state = {
        messages: [
          { id: '1', isUser: true, content: 'Test Message', options: [], type: 'button', phoneNumber: '123' },
          { id: '2', isUser: false, content: 'Other Message', options: [], type: 'button', phoneNumber: '456' }
        ],
        selectedPhoneNumber: '123'
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Chat Preview header and only filtered messages', () => {
    render(<ChatPanel />);
    expect(screen.getByText('Pré-visualização do Chat')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.queryByText('Other Message')).not.toBeInTheDocument();
    expect(screen.getByText(/Mostrando mensagens para: 123/)).toBeInTheDocument();
  });

  it('calls scrollIntoView after rendering messages', () => {
    render(<ChatPanel />);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('updates input field and sends message on form submit', () => {
    (store.useStore as any).mockImplementation((selector: any) => {
      const state = {
        messages: [],
        selectedPhoneNumber: '123'
      };
      return selector(state);
    });
    render(<ChatPanel />);
    const input = screen.getByPlaceholderText('Digite uma mensagem...');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input).toHaveValue('Hello World');
    fireEvent.submit(input.closest('form')!);
    expect(sendMessage).toHaveBeenCalledWith('Hello World');
    expect(input).toHaveValue('');
  });
});
