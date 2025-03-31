import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderItem } from './FolderItem';
import { vi } from 'vitest';

describe('FolderItem Component', () => {
  const folder = { id: 'folder1', name: 'My Folder', parentId: null };
  const testCases = [{ id: 'test1', name: 'Test Case 1', folderId: 'folder1' }];
  const folders: any[] = []; // Sem pastas aninhadas para estes testes

  // Funções simuladas (mocks)
  const onRename = vi.fn();
  const onDelete = vi.fn();
  const onAddSubfolder = vi.fn();
  const onTestMove = vi.fn();
  const onTestSelect = vi.fn();
  const onTestEdit = vi.fn();
  const onTestDuplicate = vi.fn();
  const onTestDelete = vi.fn();
  const currentTestId = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders folder name and test case', () => {
    render(
      <FolderItem
        folder={folder}
        testCases={testCases}
        folders={folders}
        onRename={onRename}
        onDelete={onDelete}
        onAddSubfolder={onAddSubfolder}
        onTestMove={onTestMove}
        onTestSelect={onTestSelect}
        onTestEdit={onTestEdit}
        onTestDuplicate={onTestDuplicate}
        onTestDelete={onTestDelete}
        currentTestId={currentTestId}
      />
    );

    expect(screen.getByText('My Folder')).toBeInTheDocument();
    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
  });

  it('allows renaming the folder', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={[]}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    const renameButton = screen.getByTitle('Renomear pasta');
    await act(async () => {
      await userEvent.click(renameButton);
    });

    // Aguarda que o input apareça com o valor "My Folder"
    const input = await screen.findByDisplayValue('My Folder');
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, 'New Folder{enter}');
    });

    expect(onRename).toHaveBeenCalledWith('folder1', 'New Folder');
  });

  it('calls onAddSubfolder when clicking Adicionar Subpasta button', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={[]}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    const addSubfolderButton = screen.getByTitle('Adicionar Subpasta');
    await act(async () => {
      await userEvent.click(addSubfolderButton);
    });
    expect(onAddSubfolder).toHaveBeenCalledWith('folder1');
  });

  it('calls onDelete when clicking Delete folder button', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={[]}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    const deleteButton = screen.getByTitle('Delete folder');
    await act(async () => {
      await userEvent.click(deleteButton);
    });
    expect(onDelete).toHaveBeenCalledWith('folder1');
  });

  it('calls onTestSelect when clicking a test case', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={testCases}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    const testCaseButton = screen.getByText('Test Case 1');
    await act(async () => {
      await userEvent.click(testCaseButton);
    });
    expect(onTestSelect).toHaveBeenCalledWith('test1');
  });

  it('handles drag and drop on folder container', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={testCases}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    const folderContainer = screen.getByText('My Folder').closest('div');
    fireEvent.dragOver(folderContainer!);
    const dataTransfer = {
      getData: vi.fn().mockReturnValue('test1'),
    };
    fireEvent.drop(folderContainer!, { dataTransfer });
    expect(onTestMove).toHaveBeenCalledWith('test1', 'folder1');
  });

  it('executes test case actions: duplicate, edit and delete', async () => {
    await act(async () => {
      render(
        <FolderItem
          folder={folder}
          testCases={testCases}
          folders={[]}
          onRename={onRename}
          onDelete={onDelete}
          onAddSubfolder={onAddSubfolder}
          onTestMove={onTestMove}
          onTestSelect={onTestSelect}
          onTestEdit={onTestEdit}
          onTestDuplicate={onTestDuplicate}
          onTestDelete={onTestDelete}
          currentTestId={currentTestId}
        />
      );
    });

    // Duplicate
    const duplicateButton = screen.getByTitle('Duplicate test case');
    await act(async () => {
      await userEvent.click(duplicateButton);
    });
    expect(onTestDuplicate).toHaveBeenCalledWith(testCases[0]);

    // Edit
    const editButton = screen.getByTitle('Edit test case');
    await act(async () => {
      await userEvent.click(editButton);
    });
    expect(onTestEdit).toHaveBeenCalledWith(testCases[0]);

    // Delete
    const deleteButton = screen.getByTitle('Delete test case');
    await act(async () => {
      await userEvent.click(deleteButton);
    });
    expect(onTestDelete).toHaveBeenCalledWith('test1');
  });
});
