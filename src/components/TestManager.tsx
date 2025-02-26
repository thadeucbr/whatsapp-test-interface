import React from 'react';
import { useStore } from '../store';
import { TestCase, Folder } from '../types';
import { Trash2, Download, Upload, Edit2, Copy, FolderPlus, Plus } from 'lucide-react';
import { TestEditor } from './TestEditor';
import { FolderItem } from './FolderItem';
import { RecordTestButton } from './RecordTestButton';

export const TestManager: React.FC = () => {
  const {
    testCases,
    folders,
    currentTestId,
    addTestCase,
    deleteTestCase,
    setCurrentTestId,
    updateTestCase,
    addFolder,
    updateFolder,
    deleteFolder,
  } = useStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingTest, setEditingTest] = React.useState<TestCase | null>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          imported.forEach((testCase: TestCase) => {
            addTestCase(testCase);
          });
        } catch (error) {
          console.error('Error importing test cases:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(testCases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'whatsapp-test-cases.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTest(testCase);
    setIsEditing(true);
  };

  const handleDuplicate = (testCase: TestCase) => {
    const newTest = {
      ...testCase,
      id: Date.now().toString(),
      name: `${testCase.name} (Copy)`,
    };
    addTestCase(newTest);
  };

  const handleSave = (updatedTest: TestCase) => {
    updateTestCase(updatedTest);
    setIsEditing(false);
    setEditingTest(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTest(null);
  };

  const handleAddFolder = (parentId: string | null = null) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: 'New Folder',
      parentId: parentId || null,
    };
    addFolder(newFolder);
  };

  const handleRenameFolder = (id: string, name: string) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      updateFolder({ ...folder, name });
    }
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
  };

  const handleTestMove = (testId: string, folderId?: string) => {
    const testCase = testCases.find((tc) => tc.id === testId);
    if (testCase) {
      updateTestCase({ ...testCase, folderId });
    }
  };

  const openFolders = React.useRef<Set<string>>(new Set());

  const handleAddTest = () => {
    let folderId: string | undefined;
    if (openFolders.current.size > 0) {
      folderId = Array.from(openFolders.current)[
        Array.from(openFolders.current).length - 1
      ];
    }
    const newTest = {
      id: Date.now().toString(),
      name: `Test Case ${testCases.length + 1}`,
      interactions: [],
      folderId,
    };
    addTestCase(newTest);
    handleEdit(newTest);
  };

  if (isEditing) {
    return (
      <TestEditor testCase={editingTest} onSave={handleSave} onCancel={handleCancel} />
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(40vh-8rem)]">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Test Cases</h2>
          <div className="flex space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleImport}
              />
              <Upload className="w-5 h-5 text-gray-600 hover:text-gray-800" />
            </label>
            <button onClick={handleExport}>
              <Download className="w-5 h-5 text-gray-600 hover:text-gray-800" />
            </button>
            <button onClick={() => handleAddFolder()} title="Add Folder">
              <FolderPlus className="w-5 h-5 text-gray-600 hover:text-gray-800" />
            </button>
            {/* Botão para gravar novo teste */}
            <RecordTestButton />
            <button onClick={handleAddTest}>
              <Plus className="w-5 h-5 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        </div>
        <div className="max-h-[calc(50vh-12rem)] overflow-y-auto space-y-2">
          {folders
            .filter((folder) => !folder.parentId)
            .map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                testCases={testCases}
                folders={folders}
                onRename={handleRenameFolder}
                onDelete={handleDeleteFolder}
                onAddSubfolder={handleAddFolder}
                onTestMove={handleTestMove}
                onTestSelect={setCurrentTestId}
                onTestEdit={handleEdit}
                onTestDuplicate={handleDuplicate}
                onTestDelete={deleteTestCase}
                currentTestId={currentTestId}
              />
            ))}
          {testCases
            .filter((tc) => !tc.folderId)
            .map((testCase) => (
              <div
                key={testCase.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  currentTestId === testCase.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', testCase.id)}>
                <button
                  className="flex-1 text-left"
                  onClick={() => setCurrentTestId(testCase.id)}>
                  {testCase.name}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDuplicate(testCase)}
                    className="text-gray-400 hover:text-blue-500"
                    title="Duplicate test case">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(testCase)}
                    className="text-gray-400 hover:text-blue-500"
                    title="Edit test case">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTestCase(testCase.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete test case">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
