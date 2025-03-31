import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, Mock } from 'vitest';
import { TestPreviewPanel } from './TestPreviewPanel';
import { TestCase, IncomingMessageDTO, TestInteraction } from '../types';
import { useStore } from '../store';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

let mockStore: {
  selectedPhoneNumber: string;
};

beforeEach(() => {
  mockStore = {
    selectedPhoneNumber: '551126509993@c.us',
  };
  (useStore as unknown as Mock).mockReturnValue(mockStore);
});

describe('TestPreviewPanel', () => {
  it('renders test name input, Save Test and Cancel buttons', () => {
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByPlaceholderText('Digite o nome do teste...')).toBeInTheDocument();
    expect(screen.getByText('Salvar Teste')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('updates test name and calls onSave with updated test', () => {
    const test: TestCase = { id: '1', name: 'Initial Name', interactions: [], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const nameInput = screen.getByPlaceholderText('Digite o nome do teste...');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    const saveButton = screen.getByText('Salvar Teste');
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }));
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  it('adds a new interaction when typing a user message and pressing Enter', () => {
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const input = screen.getByPlaceholderText('Digite a mensagem do usuário...');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('edits an existing user message', () => {
    const interaction: TestInteraction = { userMessage: 'Original Message', expectedResponses: [] };
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [interaction], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const userMessageElement = screen.getByText('Original Message');
    const groupContainer = userMessageElement.closest('div.group');
    fireEvent.mouseOver(groupContainer!);
    const editButton = groupContainer!.querySelector('button > svg.lucide-pen')?.closest('button');
    expect(editButton).toBeDefined();
    fireEvent.click(editButton!);
    const userInput = screen.getByPlaceholderText('Editar mensagem do usuário...');
    fireEvent.change(userInput, { target: { value: 'Edited Message' } });
    fireEvent.keyDown(userInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(screen.getByText('Edited Message')).toBeInTheDocument();
  });

  it('deletes a user interaction when delete button is clicked', () => {
    const interaction: TestInteraction = { userMessage: 'To be deleted', expectedResponses: [] };
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [interaction], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const userMessageElement = screen.getByText('To be deleted');
    const groupContainer = userMessageElement.closest('div.group');
    fireEvent.mouseOver(groupContainer!);
    const deleteButton = groupContainer!.querySelector('button > svg.lucide-trash2')?.closest('button');
    expect(deleteButton).toBeDefined();
    fireEvent.click(deleteButton!);
    expect(screen.queryByText('To be deleted')).not.toBeInTheDocument();
  });

  it('toggles response editor and adds a response to an interaction', () => {
    const interaction: TestInteraction = { userMessage: 'Message with response', expectedResponses: [] };
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [interaction], folderId: undefined };
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(<TestPreviewPanel test={test} onSave={onSave} onCancel={onCancel} />);
    const settingsButton = container.querySelector('button > svg.lucide-settings')?.parentElement;
    expect(settingsButton).toBeDefined();
    fireEvent.click(settingsButton!);
    const responseEditor = container.querySelector('.mt-4');
    expect(responseEditor).toBeInTheDocument();
    const plusButton = within(responseEditor!).getAllByRole('button', { hidden: true })[0];
    fireEvent.click(plusButton);
    const previewMessages = container.querySelectorAll('p.text-sm.whitespace-pre-wrap');
    expect(previewMessages.length).toBe(2);
  });

  it('updates a response in an interaction via the ResponseEditor', () => {
    const response: IncomingMessageDTO = {
      from: '551126509993@c.us',
      body: { text: '', buttonText: null, options: null },
      timestamp: Date.now(),
      type: 'text',
    };
    const interaction: TestInteraction = { userMessage: 'Message for response update', expectedResponses: [response] };
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [interaction], folderId: undefined };
    const { container } = render(<TestPreviewPanel test={test} onSave={vi.fn()} onCancel={vi.fn()} />);
    const settingsButton = container.querySelector('button > svg.lucide-settings')?.parentElement;
    expect(settingsButton).toBeDefined();
    fireEvent.click(settingsButton!);
    const textarea = screen.getByPlaceholderText('Enter response text...');
    fireEvent.change(textarea, { target: { value: 'Updated Response' } });
    fireEvent.blur(textarea);
    const previewText = screen.getAllByText('Updated Response', { selector: 'p' });
    expect(previewText.length).toBeGreaterThan(0);
  });

  it('deletes a response from an interaction via the ResponseEditor', () => {
    const response: IncomingMessageDTO = {
      from: '551126509993@c.us',
      body: { text: 'Response to delete', buttonText: null, options: null },
      timestamp: Date.now(),
      type: 'text',
    };
    const interaction: TestInteraction = { userMessage: 'Message for response deletion', expectedResponses: [response] };
    const test: TestCase = { id: '1', name: 'Test Name', interactions: [interaction], folderId: undefined };
    const { container } = render(<TestPreviewPanel test={test} onSave={vi.fn()} onCancel={vi.fn()} />);
    const settingsButton = container.querySelector('button > svg.lucide-settings')?.parentElement;
    expect(settingsButton).toBeDefined();
    fireEvent.click(settingsButton!);
    const responseEditor = container.querySelector('div.mt-4');
    expect(responseEditor).toBeInTheDocument();
    const deleteButton = responseEditor?.querySelector('button > svg.lucide-trash2')?.closest('button');
    expect(deleteButton).toBeDefined();
    fireEvent.click(deleteButton!);
    expect(screen.queryByText('Response to delete')).not.toBeInTheDocument();
  });
});
