import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TestManagement } from './TestManagement';
import { useStore } from '../store';

vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

vi.mock('../components/ChatPanel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat Panel</div>,
}));

vi.mock('../components/TestPreviewPanel', () => ({
  TestPreviewPanel: ({ test, onSave, onCancel }: any) => (
    <div data-testid="test-preview-panel">
      <span>{test?.name || 'No Test'}</span>
      <button onClick={() => onSave(test)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('../components/FolderItem', () => ({
  FolderItem: (props: any) => (
    <div data-testid="folder-item">
      <span>{props.folder.name}</span>
      <button onClick={() => props.onRename(props.folder.id, 'Renamed')}>Rename</button>
      <button onClick={() => props.onDelete(props.folder.id)}>Delete</button>
      <button onClick={() => props.onAddSubfolder(props.folder.id)}>Add Subfolder</button>
      <button onClick={() => props.onTestMove('test-id', props.folder.id)}>Move Test</button>
      <button onClick={() => props.onTestSelect('test-id')}>Select Test</button>
      <button onClick={() => props.onTestEdit({ id: 'test-id', name: 'Edit Test', interactions: [] })}>
        Edit Test
      </button>
      <button onClick={() => props.onTestDuplicate({ id: 'test-id', name: 'Duplicate Test', interactions: [] })}>
        Duplicate Test
      </button>
      <button onClick={() => props.onTestDelete('test-id')}>Delete Test</button>
    </div>
  ),
}));

vi.mock('../components/RecordTestButton', () => ({
  RecordTestButton: () => <button data-testid="record-test-button">Record Test</button>,
}));

describe('TestManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly and calls fetchAndSetCloudTests on mount', () => {
    const fetchAndSetCloudTests = vi.fn();
    (useStore as any).mockReturnValue({
      testCases: [],
      cloudTests: [],
      folders: [],
      addTestCase: vi.fn(),
      updateTestCase: vi.fn(),
      deleteTestCase: vi.fn(),
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      recordingTestCase: null,
      fetchAndSetCloudTests,
      downloadCloudTest: vi.fn(),
      setRecordingTestCase: vi.fn(),
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);

    expect(screen.getByText('Test Management')).toBeInTheDocument();
    expect(fetchAndSetCloudTests).toHaveBeenCalled();
  });

  test('handles create test button and shows TestPreviewPanel', () => {
    const addTestCase = vi.fn();
    (useStore as any).mockReturnValue({
      testCases: [],
      cloudTests: [],
      folders: [],
      addTestCase,
      updateTestCase: vi.fn(),
      deleteTestCase: vi.fn(),
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      recordingTestCase: null,
      fetchAndSetCloudTests: vi.fn(),
      downloadCloudTest: vi.fn(),
      setRecordingTestCase: vi.fn(),
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);

    fireEvent.click(screen.getByText('Create Test'));
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();
  });

  test('handles record test panel and save recording test', async () => {
    const addTestCase = vi.fn().mockResolvedValue(undefined);
    const setRecordingTestCase = vi.fn();
    (useStore as any).mockReturnValue({
      testCases: [],
      cloudTests: [],
      folders: [],
      addTestCase,
      updateTestCase: vi.fn(),
      deleteTestCase: vi.fn(),
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      recordingTestCase: { id: 'rec1', name: 'Recording Test', interactions: [] },
      fetchAndSetCloudTests: vi.fn(),
      downloadCloudTest: vi.fn(),
      setRecordingTestCase,
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);

    expect(screen.getByText('Recording Test')).toBeInTheDocument();
    const button = screen.getByText('Conclude & Save Test');
    fireEvent.click(button);

    await waitFor(() => {
      expect(addTestCase).toHaveBeenCalledWith(
        { id: 'rec1', name: 'Recording Test', interactions: [] },
        true
      );
      expect(setRecordingTestCase).toHaveBeenCalledWith(null);
    });
  });

  test('renders cloud tests and handles download, edit and delete actions', async () => {
    const downloadCloudTest = vi.fn().mockResolvedValue(undefined);
    const deleteTestCase = vi.fn();
    const updateTestCase = vi.fn();
    const cloudTests = [{ id: 'cloud1', name: 'Cloud Test 1', interactions: [] }];
    (useStore as any).mockReturnValue({
      testCases: [],
      cloudTests,
      folders: [],
      addTestCase: vi.fn(),
      updateTestCase,
      deleteTestCase,
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      recordingTestCase: null,
      fetchAndSetCloudTests: vi.fn(),
      downloadCloudTest,
      setRecordingTestCase: vi.fn(),
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);

    const cloudTestButton = screen.getByText('Cloud Test 1');
    fireEvent.click(cloudTestButton);
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();

    const downloadButton = screen.getByTitle('Download test');
    fireEvent.click(downloadButton);
    await waitFor(() => {
      expect(downloadCloudTest).toHaveBeenCalledWith(cloudTests[0]);
    });

    const editButton = screen.getByTitle('Edit test case');
    fireEvent.click(editButton);
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();

    const deleteButton = screen.getByTitle('Delete test case');
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteTestCase).toHaveBeenCalledWith('cloud1', true);
    });
  });

  test('renders local tests and folder items and handles interactions', () => {
    const updateTestCase = vi.fn();
    const deleteTestCase = vi.fn();
    const updateFolder = vi.fn();
    const deleteFolder = vi.fn();
    const addFolder = vi.fn();
    const localTests = [{ id: 'test-id', name: 'Local Test 1', interactions: [] }];
    const folders = [{ id: 'folder1', name: 'Folder 1', parentId: null }];
    (useStore as any).mockReturnValue({
      testCases: localTests,
      cloudTests: [],
      folders,
      addTestCase: vi.fn(),
      updateTestCase,
      deleteTestCase,
      addFolder,
      updateFolder,
      deleteFolder,
      recordingTestCase: null,
      fetchAndSetCloudTests: vi.fn(),
      downloadCloudTest: vi.fn(),
      setRecordingTestCase: vi.fn(),
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);

    const folderItem = screen.getByTestId('folder-item');
    expect(folderItem).toBeInTheDocument();

    const renameButton = screen.getByText('Rename');
    fireEvent.click(renameButton);
    expect(updateFolder).toHaveBeenCalled();

    const folderDeleteButton = screen.getByText('Delete');
    fireEvent.click(folderDeleteButton);
    expect(deleteFolder).toHaveBeenCalled();

    const addSubfolderButton = screen.getByText('Add Subfolder');
    fireEvent.click(addSubfolderButton);
    expect(addFolder).toHaveBeenCalled();

    const selectTestButton = screen.getByText('Select Test');
    fireEvent.click(selectTestButton);
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();

    const editTestButton = screen.getByText('Edit Test');
    fireEvent.click(editTestButton);
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();

    const duplicateTestButton = screen.getByText('Duplicate Test');
    fireEvent.click(duplicateTestButton);
    expect(screen.getByTestId('test-preview-panel')).toBeInTheDocument();

    const deleteTestButton = screen.getByText('Delete Test');
    fireEvent.click(deleteTestButton);
    expect(deleteTestCase).toHaveBeenCalled();
  });

  test('filters tests based on search term', () => {
    const localTests = [
      { id: 'local1', name: 'Alpha Test', interactions: [] },
      { id: 'local2', name: 'Beta Test', interactions: [] },
    ];
    (useStore as any).mockReturnValue({
      testCases: localTests,
      cloudTests: [],
      folders: [],
      addTestCase: vi.fn(),
      updateTestCase: vi.fn(),
      deleteTestCase: vi.fn(),
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      recordingTestCase: null,
      fetchAndSetCloudTests: vi.fn(),
      downloadCloudTest: vi.fn(),
      setRecordingTestCase: vi.fn(),
      messages: [],
      selectedPhoneNumber: '',
    });

    render(<TestManagement />);
    const searchInput = screen.getByPlaceholderText('Search tests...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    expect(screen.getByText('Alpha Test')).toBeInTheDocument();
    expect(screen.queryByText('Beta Test')).not.toBeInTheDocument();
  });
});