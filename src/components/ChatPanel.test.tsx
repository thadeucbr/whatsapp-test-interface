import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatPanel } from './ChatPanel';
import { vi } from 'vitest';
import * as store from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn()
}));

describe('ChatPanel Component', () => {
  const scrollIntoViewMock = vi.fn();

  beforeAll(() => {
    // Define scrollIntoView para os elementos
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  });

  beforeEach(() => {
    // Simula o estado da store com duas mensagens e um telefone selecionado
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

    expect(screen.getByText('Chat Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    // A mensagem com telefone diferente não deve aparecer
    expect(screen.queryByText('Other Message')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing messages for: 123/)).toBeInTheDocument();
  });

  it('calls scrollIntoView after rendering messages', () => {
    render(<ChatPanel />);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
