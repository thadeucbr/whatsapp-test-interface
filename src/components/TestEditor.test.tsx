import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestEditor } from './TestEditor';
import { TestCase } from '../types';

const testCaseMock: TestCase = {
  id: '1',
  name: 'Test Case 1',
  interactions: [
    {
      userMessage: 'Hello',
      expectedResponses: [],
    },
  ],
  folderId: 'folder-1',
};

describe('TestEditor', () => {
  it('renders correctly with a given test case', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // Verifica se o input do nome possui o valor passado
    const nameInput = screen.getByDisplayValue('Test Case 1') as HTMLInputElement;
    expect(nameInput.value).to.equal('Test Case 1');
    // Verifica se o título indica que é edição
    expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
    // Verifica se a interação está renderizada com o userMessage 'Hello'
    const interactionInput = screen.getByDisplayValue('Hello') as HTMLTextAreaElement;
    expect(interactionInput.value).to.equal('Hello');
  });

  it('renders correctly for a new test case', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={null} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // Input do nome deve estar vazio
    const nameInput = screen.getByPlaceholderText('Enter test case name') as HTMLInputElement;
    expect(nameInput.value).to.equal('');
    // Título deve indicar "New Test Case"
    expect(screen.getByText('New Test Case')).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // O botão de cancel é o que contém o ícone ArrowLeft.
    // Como esse botão não possui texto, buscamos pelo primeiro botão que não contenha "Save".
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => !btn.textContent?.includes('Save'));
    expect(cancelButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(cancelButton!);
    });
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('adds a new interaction when "Add Interaction" is clicked', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    const addInteractionButton = screen.getByText('Add Interaction');
    await act(async () => {
      fireEvent.click(addInteractionButton);
    });
    // Contamos apenas os headings (h4) que contenham exatamente "Interaction" seguido por um número.
    const interactionHeadings = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'h4' && /^Interaction \d+$/.test(content);
    });
    // Como o testCaseMock possui uma interação e adicionamos uma, esperamos 2 interações.
    expect(interactionHeadings.length).to.equal(2);
  });

  it('updates an interaction user message', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // Buscando a textarea da interação que contém "Hello"
    const interactionInput = screen.getByDisplayValue('Hello') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(interactionInput, { target: { value: 'Hi there' } });
    });
    expect(screen.getByDisplayValue('Hi there')).toBeInTheDocument();
  });

  it('deletes an interaction when the delete button is clicked', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // O botão de deletar da interação contém o ícone Trash2.
    const deleteButtons = screen.getAllByRole('button').filter((btn) =>
      btn.innerHTML.includes('lucide-trash2')
    );
    expect(deleteButtons.length).to.be.greaterThan(0);
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });
    // Após a exclusão, não devem existir headings com "Interaction X"
    const interactionHeadings = screen.queryAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'h4' && /^Interaction \d+$/.test(content);
    });
    expect(interactionHeadings.length).to.equal(0);
  });

  it('adds a new response to an interaction when "Add Response" is clicked', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    const addResponseButton = screen.getByText('Add Response');
    await act(async () => {
      fireEvent.click(addResponseButton);
    });
    // O novo response é renderizado via ResponseEditor; verificamos se o textarea com placeholder "Enter message text" aparece.
    const responseTextArea = await screen.findByPlaceholderText('Enter message text');
    expect(responseTextArea).toBeInTheDocument();
  });

  it('calls onSave with updated test case when Save is clicked', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    render(
      <TestEditor testCase={testCaseMock} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    // Altera o nome do test case
    const nameInput = screen.getByDisplayValue('Test Case 1') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Updated Test Case' } });
    });
    // Clica no botão Save (que contém o texto "Save")
    const saveButton = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveButton);
    });
    // Verifica se a função onSave foi chamada com um objeto contendo o nome atualizado e as interações
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Test Case',
        interactions: expect.any(Array),
      })
    );
  });
});
