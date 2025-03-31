import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TestManager } from './TestManager';
import { TestCase } from '../types';
import { useStore } from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

let mockStore: {
  testCases: TestCase[];
  currentTestId: string | null;
  deleteTestCase: (...args: string[]) => void;
  setCurrentTestId: (...args: string[]) => void;
  selectedPhoneNumber?: string;
};

beforeEach(() => {
  mockStore = {
    testCases: [],
    currentTestId: null,
    deleteTestCase: vi.fn(),
    setCurrentTestId: vi.fn(),
    selectedPhoneNumber: undefined,
  };
  (useStore as unknown as Mock).mockReturnValue(mockStore);
});

describe('TestManager', () => {
  it('renders header and search input', () => {
    render(
      <MemoryRouter>
        <TestManager />
      </MemoryRouter>
    );
    expect(screen.getByText('Testes Locais')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pesquisar testes...')).toBeInTheDocument();
  });

  it('renders no tests message when testCases array is empty', () => {
    render(
      <MemoryRouter>
        <TestManager />
      </MemoryRouter>
    );
    expect(screen.getByText('Nenhum teste local encontrado')).toBeInTheDocument();
  });

  it('filters test cases based on search term', () => {
    const testCase1: TestCase = {
      id: '1',
      name: 'Alpha',
      interactions: [],
      folderId: undefined,
    };
    const testCase2: TestCase = {
      id: '2',
      name: 'Beta',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase1, testCase2];
    render(
      <MemoryRouter>
        <TestManager />
      </MemoryRouter>
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Pesquisar testes...'), {
      target: { value: 'Alpha' },
    });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Pesquisar testes...'), {
      target: { value: 'Gamma' },
    });
    expect(screen.getByText('Nenhum teste local encontrado')).toBeInTheDocument();
  });

  it('calls setCurrentTestId when a test case is clicked', () => {
    const testCase: TestCase = {
      id: '1',
      name: 'Test One',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase];
    render(
      <MemoryRouter>
        <TestManager />
      </MemoryRouter>
    );
    const testCaseButton = screen.getByText('Test One');
    fireEvent.click(testCaseButton);
    expect(mockStore.setCurrentTestId).toHaveBeenCalledWith('1');
  });

  it('calls deleteTestCase when delete button is clicked', () => {
    const testCase: TestCase = {
      id: '1',
      name: 'Test One',
      interactions: [],
      folderId: undefined,
    };
    mockStore.testCases = [testCase];
    render(
      <MemoryRouter>
        <TestManager />
      </MemoryRouter>
    );
    const deleteButton = screen.getByTitle('Excluir caso de teste');
    fireEvent.click(deleteButton);
    expect(mockStore.deleteTestCase).toHaveBeenCalledWith('1');
  });
});
