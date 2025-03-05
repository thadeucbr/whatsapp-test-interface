import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestManager } from './TestManager';
import { TestCase } from '../types';
import { useStore } from '../store';

// Faz o mock do hook useStore para controlarmos o estado da store
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

let mockStore: {
  testCases: TestCase[];
  folders: any[];
  currentTestId: string | null;
  addTestCase: (...args: any[]) => void;
  deleteTestCase: (...args: any[]) => void;
  setCurrentTestId: (...args: any[]) => void;
  updateTestCase: (...args: any[]) => void;
  addFolder: (...args: any[]) => void;
  updateFolder: (...args: any[]) => void;
  deleteFolder: (...args: any[]) => void;
};

beforeEach(() => {
  mockStore = {
    testCases: [],
    folders: [],
    currentTestId: null,
    addTestCase: vi.fn(),
    deleteTestCase: vi.fn(),
    setCurrentTestId: vi.fn(),
    updateTestCase: vi.fn(),
    addFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn(),
  };
  (useStore as any).mockReturnValue(mockStore);
});

describe('TestManager', () => {
  it('renders header and action buttons', () => {
    render(<TestManager />);
    // Verifica se o cabeçalho "Test Cases" é exibido
    expect(screen.getByText('Test Cases')).to.exist;
    // Verifica se o botão "Add Folder" (pelo title) está presente
    expect(screen.getByTitle('Add Folder')).to.exist;
    // Verifica se o input do tipo file está presente (mesmo que escondido)
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).to.exist;
  });

  it('calls export logic when export button is clicked', () => {
    // Espia as chamadas de document.createElement
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(<TestManager />);
    const buttons = screen.getAllByRole('button');
    // Considerando que a ordem dos ícones seja:
    // [Download, Add Folder, RecordTestButton, Add Test]
    const exportButton = buttons[0];
    act(() => {
      fireEvent.click(exportButton);
    });
    // Verifica se houve pelo menos uma chamada para criar um elemento "a"
    const aCalls = createElementSpy.mock.calls.filter((call) => call[0] === 'a');
    expect(aCalls.length).toBeGreaterThan(0);
    createElementSpy.mockRestore();
  });

  it('calls addFolder when "Add Folder" button is clicked', () => {
    render(<TestManager />);
    const addFolderButton = screen.getByTitle('Add Folder');
    act(() => {
      fireEvent.click(addFolderButton);
    });
    expect(mockStore.addFolder).toHaveBeenCalled();
  });

  it('adds a new test and opens TestEditor when "Add Test" button is clicked', async () => {
    render(<TestManager />);
    // Localiza o grupo de ícones na header
    const headerIcons = screen
      .getByText('Test Cases')
      .parentElement?.querySelector('div.flex.space-x-2');
    expect(headerIcons).to.exist;
    const iconButtons = headerIcons ? Array.from(headerIcons.querySelectorAll('button')) : [];
    // O último botão é o de adicionar teste
    const addTestBtn = iconButtons[iconButtons.length - 1];
    await act(async () => {
      fireEvent.click(addTestBtn);
    });
    expect(mockStore.addTestCase).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter test case name')).to.exist;
    });
  });

  it('opens TestEditor when "Edit test case" button is clicked', async () => {
    const testCase: TestCase = {
      id: '123',
      name: 'Test Case 123',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase];
    render(<TestManager />);
    const editButton = screen.getByTitle('Edit test case');
    await act(async () => {
      fireEvent.click(editButton);
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter test case name')).to.exist;
    });
  });

  it('duplicates a test case when "Duplicate test case" button is clicked', async () => {
    const testCase: TestCase = {
      id: '123',
      name: 'Test Case 123',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase];
    render(<TestManager />);
    const duplicateButton = screen.getByTitle('Duplicate test case');
    await act(async () => {
      fireEvent.click(duplicateButton);
    });
    expect(mockStore.addTestCase).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Case 123 (Copy)',
      })
    );
  });

  it('deletes a test case when "Delete test case" button is clicked', async () => {
    const testCase: TestCase = {
      id: '123',
      name: 'Test Case 123',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase];
    render(<TestManager />);
    const deleteButton = screen.getByTitle('Delete test case');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    expect(mockStore.deleteTestCase).toHaveBeenCalledWith('123');
  });

  it('imports test cases from a JSON file', async () => {
    render(<TestManager />);
    const fileContent = JSON.stringify([
      {
        id: '1',
        name: 'Imported Test 1',
        interactions: [],
        folderId: undefined,
      },
      {
        id: '2',
        name: 'Imported Test 2',
        interactions: [],
        folderId: undefined,
      },
    ]);
    const file = new File([fileContent], 'tests.json', { type: 'application/json' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(mockStore.addTestCase).toHaveBeenCalledTimes(2);
    });
  });
});