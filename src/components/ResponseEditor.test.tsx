import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ResponseEditor } from './ResponseEditor';
import { IncomingMessageDTO } from '../types';

const initialTextResponse: IncomingMessageDTO = {
  id: '1',
  type: 'text',
  body: { text: 'Texto inicial' },
  timestamp: 0,
};

describe('ResponseEditor', () => {
  it('renderiza com os valores iniciais', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={initialTextResponse}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const textArea = screen.getByPlaceholderText('Enter message text') as HTMLTextAreaElement;
    expect(textArea.value).to.equal('Texto inicial');

    const select = screen.getByLabelText('Response Type') as HTMLSelectElement;
    expect(select.value).to.equal('text');
  });

  it('chama onUpdate ao alterar o texto da mensagem', async () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={initialTextResponse}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const textArea = screen.getByPlaceholderText('Enter message text') as HTMLTextAreaElement;
    await act(async () => {
      userEvent.clear(textArea);
      await userEvent.type(textArea, 'Texto atualizado');
    });

    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.body.text).to.equal('Texto atualizado');
    });
  });

  it('chama onDelete ao clicar no botão de deletar', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={initialTextResponse}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTitle('Delete response');
    act(() => {
      fireEvent.click(deleteButton);
    });
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('adiciona, atualiza e deleta uma opção quando o tipo é "button"', async () => {
    const responseButton: IncomingMessageDTO = {
      id: '2',
      type: 'button',
      body: { text: 'Texto do botão', options: [] },
      timestamp: 0,
    };

    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={responseButton}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    await act(async () => {
      const addOptionButton = screen.getByTitle('Add option');
      fireEvent.click(addOptionButton);
    });

    const optionInput = await screen.findByPlaceholderText('Button text');
    expect(optionInput).to.exist;

    await act(async () => {
      userEvent.clear(optionInput);
      await userEvent.type(optionInput, 'Opção 1');
    });

    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.body.options).to.have.lengthOf(1);
      expect(lastCall.body.options[0].text).to.equal('Opção 1');
    });

    await act(async () => {
      const deleteOptionButton = screen.getByTitle('Delete option');
      fireEvent.click(deleteOptionButton);
    });

    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.body.options).to.be.null;
    });
  });

  it('exibe input de "button text" e atualiza seu valor quando o tipo é "list"', async () => {
    const responseList: IncomingMessageDTO = {
      id: '3',
      type: 'list',
      body: { text: 'Texto da lista', buttonText: '', options: [] },
      timestamp: 0,
    };

    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={responseList}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const select = screen.getByLabelText('Response Type') as HTMLSelectElement;
    expect(select.value).to.equal('list');

    const buttonTextInput = screen.getByPlaceholderText('Enter button text') as HTMLInputElement;
    expect(buttonTextInput).to.exist;

    await act(async () => {
      userEvent.clear(buttonTextInput);
      await userEvent.type(buttonTextInput, 'Texto Botão Lista');
    });

    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.body.buttonText).to.equal('Texto Botão Lista');
    });
  });

  it('adiciona e atualiza uma opção interativa quando o tipo é "interactive"', async () => {
    const responseInteractive: IncomingMessageDTO = {
      id: '4',
      type: 'interactive',
      body: { text: 'Texto interativo', options: [] },
      timestamp: 0,
    };

    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <ResponseEditor
        response={responseInteractive}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    await act(async () => {
      const addOptionButton = screen.getByTitle('Add option');
      fireEvent.click(addOptionButton);
    });

    const nameInput = await screen.findByPlaceholderText('Name');
    const displayTextInput = screen.getByPlaceholderText('Display Text');
    const urlInput = screen.getByPlaceholderText('URL');

    await act(async () => {
      userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Nome da Opção');

      userEvent.clear(displayTextInput);
      await userEvent.type(displayTextInput, 'Texto de Exibição');

      userEvent.clear(urlInput);
      await userEvent.type(urlInput, 'http://exemplo.com');
    });

    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.body.options).to.have.lengthOf(1);
      const option = lastCall.body.options[0];
      expect(option.name).to.equal('Nome da Opção');
      expect(option.displayText).to.equal('Texto de Exibição');
      expect(option.url).to.equal('http://exemplo.com');
    });
  });
});
