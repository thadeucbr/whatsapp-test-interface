import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestManagement } from './TestManagement';
import { useStore } from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

vi.mock('../components/TestPreviewPanel', () => ({
  TestPreviewPanel: ({ test, onSave, onCancel }: any) => (
    <div>
      <span>Test Preview Panel: {test.name}</span>
      <button onClick={() => onSave(test)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('../components/RecordTestButton', () => ({
  RecordTestButton: () => <button>Record Test</button>,
}));

vi.mock('../components/PhoneSelector', () => ({
  PhoneSelector: () => <div>Phone Selector</div>,
}));

vi.mock('../components/FolderItem', () => ({
  FolderItem: ({
    folder,
    onRename,
    onDelete,
    onAddSubfolder,
    onTestMove,
    onTestSelect,
    onTestEdit,
    onTestDuplicate,
    onTestDelete,
    currentTestId,
  }: any) => <div data-testid="folder-item">{folder.name}</div>,
}));

vi.mock('../components/ChatPanel', () => ({
  ChatPanel: () => <div>Chat Panel</div>,
}));

const defaultStore = {
  testCases: [],
  cloudTests: [],
  folders: [],
  addTestCase: vi.fn().mockResolvedValue(null),
  updateTestCase: vi.fn().mockResolvedValue(null),
  deleteTestCase: vi.fn().mockResolvedValue(null),
  addFolder: vi.fn(),
  updateFolder: vi.fn(),
  deleteFolder: vi.fn(),
  recordingTestCase: null,
  fetchAndSetCloudTests: vi.fn(),
  downloadCloudTest: vi.fn().mockResolvedValue(null),
  setRecordingTestCase: vi.fn(),
  selectedPhoneNumber: null,
  setCurrentTestId: vi.fn(),
};

beforeEach(() => {
  (useStore as unknown as vi.Mock).mockImplementation((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultStore);
    }
    return defaultStore;
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TestManagement Component', () => {
  it('renders header, control buttons and phone selector', () => {
    render(<TestManagement />);
    expect(screen.getByText('Test Management')).toBeDefined();
    expect(screen.getByText('New Folder')).toBeDefined();
    expect(screen.getByText('Create Test')).toBeDefined();
    expect(screen.getByText('Record Test')).toBeDefined();
    expect(screen.getByText('Phone Selector')).toBeDefined();
  });

  it('shows "No Test Selected" when no test is selected and not recording', () => {
    render(<TestManagement />);
    expect(screen.getByText('No Test Selected')).toBeDefined();
    expect(
      screen.getByText(
        'Select a test from the list or create a new one to get started'
      )
    ).toBeDefined();
  });

  it('handles create test action and save new test', async () => {
    render(<TestManagement />);
    fireEvent.click(screen.getByText('Create Test'));
    await waitFor(() => {
      expect(
        screen.getByText(/Test Preview Panel: New Test Case/)
      ).toBeDefined();
    });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(defaultStore.addTestCase).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Test Case' }),
        true
      );
    });
    expect(screen.getByText('No Test Selected')).toBeDefined();
  });

  it('handles cancel action in preview panel', async () => {
    render(<TestManagement />);
    fireEvent.click(screen.getByText('Create Test'));
    await waitFor(() => {
      expect(
        screen.getByText(/Test Preview Panel: New Test Case/)
      ).toBeDefined();
    });
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.getByText('No Test Selected')).toBeDefined();
    });
  });

  it('handles add folder action', () => {
    render(<TestManagement />);
    fireEvent.click(screen.getByText('New Folder'));
    expect(defaultStore.addFolder).toHaveBeenCalled();
  });

  it('filters cloud tests based on search term', () => {
    defaultStore.cloudTests = [
      { id: '1', name: 'Cloud Test One', interactions: [] },
      { id: '2', name: 'Another Cloud Test', interactions: [] },
    ];
    render(<TestManagement />);
    const searchInput = screen.getByPlaceholderText('Search tests...');
    fireEvent.change(searchInput, { target: { value: 'one' } });
    expect(screen.getByText('Cloud Test One')).toBeDefined();
    expect(screen.queryByText('Another Cloud Test')).toBeNull();
  });

  it('handles cloud test actions: download, edit, delete', async () => {
    defaultStore.cloudTests = [
      { id: '1', name: 'Cloud Test One', interactions: [] },
    ];
    render(<TestManagement />);
    fireEvent.click(screen.getByText('Cloud Test One'));
    const downloadButton = screen.getByTitle('Download test');
    fireEvent.click(downloadButton);
    await waitFor(() => {
      expect(defaultStore.downloadCloudTest).toHaveBeenCalledWith(
        defaultStore.cloudTests[0]
      );
    });
    // Directly get the first edit button as there's only one cloud test
    const cloudEditButton = screen.getAllByTitle('Edit test case')[0];
    fireEvent.click(cloudEditButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Test Preview Panel: Cloud Test One/)
      ).toBeDefined();
    });
    const deleteButton = screen.getByTitle('Delete test case');
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(defaultStore.deleteTestCase).toHaveBeenCalledWith('1', true);
    });
  });

  it('handles local test actions: duplicate and delete', async () => {
    defaultStore.testCases = [
      { id: '10', name: 'Local Test', interactions: [] },
    ];
    defaultStore.folders = [];
    defaultStore.cloudTests = [];
    render(<TestManagement />);
    fireEvent.click(screen.getByText('Local Test'));
    const duplicateButton = screen.getByTitle('Duplicate test case');
    fireEvent.click(duplicateButton);
    await waitFor(() => {
      expect(defaultStore.addTestCase).toHaveBeenCalled();
    });
    const deleteButtons = screen.getAllByTitle('Delete test case');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(defaultStore.deleteTestCase).toHaveBeenCalledWith('10', false);
    });
  });

  it('handles drag and drop events on local test item', async () => {
    defaultStore.testCases = [
      { id: '20', name: 'Draggable Test', interactions: [] },
    ];
    defaultStore.folders = [];
    defaultStore.cloudTests = [];
    render(<TestManagement />);
    const testItem = screen.getByText('Draggable Test').parentElement!;
    const dataTransfer = { setData: vi.fn() };
    fireEvent.dragStart(testItem, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '20');
    expect(testItem.classList.contains('opacity-50')).toBe(true);
    fireEvent.dragEnd(testItem);
    expect(testItem.classList.contains('opacity-50')).toBe(false);
  });

  it('handles editing an existing test using preview panel save (local test)', async () => {
    defaultStore.testCases = [
      { id: '30', name: 'Existing Local Test', interactions: [] },
    ];
    defaultStore.folders = [];
    defaultStore.cloudTests = [];
    render(<TestManagement />);
    const localTestElement = screen.getByText('Existing Local Test');
    const localTestContainer = localTestElement.parentElement;
    if (!localTestContainer) throw new Error('Local test container not found');
    const editButton = localTestContainer.querySelector('button[title="Edit test case"]');
    if (!editButton) throw new Error('Edit button not found');
    fireEvent.click(editButton);
    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          element?.tagName.toLowerCase() === 'span' &&
          content.includes('Test Preview Panel: Existing Local Test')
        )
      ).toBeDefined();
    });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(defaultStore.updateTestCase).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Existing Local Test' }),
        false
      );
    });
  });

  it('handles recording test save action', async () => {
    defaultStore.recordingTestCase = {
      id: '99',
      name: 'Recording Test',
      interactions: [],
    };
    render(<TestManagement />);
    expect(screen.getByText('Recording Test')).toBeDefined();
    expect(screen.getByText('Recording in progress...')).toBeDefined();
    const concludeButton = screen.getByText('Conclude & Save Test');
    fireEvent.click(concludeButton);
    await waitFor(() => {
      expect(defaultStore.addTestCase).toHaveBeenCalledWith(
        defaultStore.recordingTestCase,
        true
      );
      expect(defaultStore.setRecordingTestCase).toHaveBeenCalledWith(null);
    });
  });
});