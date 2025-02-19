import React from 'react';
import { useStore } from '../store';
import { TestCase, Folder } from '../types';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Edit2,
  Copy,
  Folder as FolderIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { TestEditor } from './TestEditor';

interface FolderItemProps {
  folder: Folder;
  testCases: TestCase[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onTestMove: (testId: string, folderId?: string) => void;
  onTestSelect: (id: string) => void;
  onTestEdit: (test: TestCase) => void;
  onTestDuplicate: (test: TestCase) => void;
  onTestDelete: (id: string) => void;
  onFolderSelect: (folderId: string) => void; // NOVO: para notificar a seleção da pasta
  currentTestId: string | null;
}

interface FolderItemProps {
  folder: Folder;
  testCases: TestCase[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onTestMove: (testId: string, folderId?: string) => void;
  onTestSelect: (id: string) => void;
  onTestEdit: (test: TestCase) => void;
  onTestDuplicate: (test: TestCase) => void;
  onTestDelete: (id: string) => void;
  onFolderSelect: (folderId: string | null) => void; // Permitir null para deselecionar
  currentTestId: string | null;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  testCases,
  onRename,
  onDelete,
  onTestMove,
  onTestSelect,
  onTestEdit,
  onTestDuplicate,
  onTestDelete,
  onFolderSelect,
  currentTestId,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(folder.name);

  const folderTests = testCases.filter((test) => test.folderId === folder.id);

  const handleRename = () => {
    if (name.trim()) {
      onRename(folder.id, name.trim());
      setIsEditing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const testId = e.dataTransfer.getData("testId");
    if (testId) {
      onTestMove(testId, folder.id);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="flex items-center space-x-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <button
          onClick={() => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            // Se estiver abrindo, seleciona a pasta; se estiver fechando, deseleciona
            onFolderSelect(newIsOpen ? folder.id : null);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <FolderIcon className="w-4 h-4 text-gray-500" />
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 px-2 py-1 text-sm border rounded"
            autoFocus
          />
        ) : (
          <button
            onClick={() => onFolderSelect(folder.id)}
            onDoubleClick={() => setIsEditing(true)} // duplo clique para editar
            className="flex-1 text-left hover:text-blue-600"
          >
            {folder.name}
          </button>
        )}
        <button
          onClick={() => onDelete(folder.id)}
          className="text-gray-400 hover:text-red-500"
          title="Delete folder"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {isOpen && (
        <div className="pl-6 space-y-2">
          {folderTests.map((test) => (
            <div
              key={test.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("testId", test.id)}
              className={`flex items-center justify-between p-2 rounded-lg border ${
                currentTestId === test.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                className="flex-1 text-left"
                onClick={() => onTestSelect(test.id)}
              >
                {test.name}
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => onTestDuplicate(test)}
                  className="text-gray-400 hover:text-blue-500"
                  title="Duplicate test case"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onTestEdit(test)}
                  className="text-gray-400 hover:text-blue-500"
                  title="Edit test case"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onTestMove(test.id)}
                  className="text-gray-400 hover:text-blue-500"
                  title="Move to root"
                >
                  <FolderIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onTestDelete(test.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete test case"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderItem;



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
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  // Função para deletar pasta e limpar selectedFolderId se necessário
  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  };

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

  const handleAddFolder = () => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: 'New Folder',
      testCaseIds: [],
    };
    addFolder(newFolder);
  };

  const handleRenameFolder = (id: string, name: string) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      updateFolder({ ...folder, name });
    }
  };

  const handleMoveTest = (testId: string, folderId?: string) => {
    const test = testCases.find((t) => t.id === testId);
    if (test) {
      updateTestCase({ ...test, folderId });
    }
  };

  const rootTests = testCases.filter((test) => !test.folderId);

  if (isEditing) {
    return (
      <TestEditor
        testCase={editingTest}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
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
          <button onClick={handleAddFolder}>
            <FolderIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
          <button
            onClick={() => {
              const newTest: TestCase = {
                id: Date.now().toString(),
                name: `Test Case ${testCases.length + 1}`,
                interactions: [],
                folderId: selectedFolderId ? selectedFolderId : undefined,
              };
              addTestCase(newTest);
              handleEdit(newTest);
            }}
          >
            <Plus className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>
      </div>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto space-y-4">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            testCases={testCases}
            onRename={handleRenameFolder}
            onDelete={handleDeleteFolder} // Usa o handler encapsulado
            onTestMove={handleMoveTest}
            onTestSelect={setCurrentTestId}
            onTestEdit={handleEdit}
            onTestDuplicate={handleDuplicate}
            onTestDelete={deleteTestCase}
            onFolderSelect={setSelectedFolderId}
            currentTestId={currentTestId}
          />
        ))}
        <div className="space-y-2">
          {rootTests.map((testCase) => (
            <div
              key={testCase.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("testId", testCase.id)}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                currentTestId === testCase.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                className="flex-1 text-left"
                onClick={() => setCurrentTestId(testCase.id)}
              >
                {testCase.name}
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDuplicate(testCase)}
                  className="text-gray-400 hover:text-blue-500"
                  title="Duplicate test case"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(testCase)}
                  className="text-gray-400 hover:text-blue-500"
                  title="Edit test case"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTestCase(testCase.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete test case"
                >
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
