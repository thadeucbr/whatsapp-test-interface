import React from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  FolderPlus, 
  Search, 
  Mic, 
  Copy, 
  Edit2, 
  Trash2, 
  Cloud, 
  Download, 
  Computer 
} from 'lucide-react';
import { TestPreviewPanel } from '../components/TestPreviewPanel';
import { FolderItem } from '../components/FolderItem';
import { ChatPanel } from '../components/ChatPanel';
import { TestCase, Folder } from '../types';
import { RecordTestButton } from '../components/RecordTestButton';

export const TestManagement: React.FC = () => {
  const {
    testCases,
    cloudTests,
    folders,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    addFolder,
    updateFolder,
    deleteFolder,
    recordingTestCase,
    fetchAndSetCloudTests,
    downloadCloudTest,
    setRecordingTestCase
  } = useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTest, setSelectedTest] = React.useState<TestCase | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isCloudTest, setIsCloudTest] = React.useState(false);

  React.useEffect(() => {
    fetchAndSetCloudTests();
  }, [fetchAndSetCloudTests]);

  const handleCreateTest = () => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      name: 'New Test Case',
      interactions: [],
    };
    setSelectedTest(newTest);
    setIsCreating(true);
    setIsCloudTest(false);
  };

  const handleSaveTest = async (test: TestCase) => {
    if (isCreating) {
      await addTestCase(test, true);
    } else {
      await updateTestCase(test, isCloudTest);
    }
    setSelectedTest(null);
    setIsCreating(false);
    setIsCloudTest(false);
  };

  const handleSaveRecordingTest = async () => {
    if (recordingTestCase) {
      await addTestCase(recordingTestCase, true);
      setRecordingTestCase(null);
    }
  };

  const handleAddFolder = (parentId: string | null = null) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: 'New Folder',
      parentId: parentId || null,
    };
    addFolder(newFolder);
  };

  const handleTestMove = (testId: string, folderId?: string) => {
    const test = testCases.find(t => t.id === testId);
    if (test) {
      updateTestCase({ ...test, folderId });
    }
  };

  const handleDuplicateTest = (test: TestCase) => {
    const newTest = {
      ...test,
      id: Date.now().toString(),
      name: `${test.name} (Copy)`,
    };
    addTestCase(newTest);
  };

  const handleDownloadCloudTest = async (test: TestCase) => {
    await downloadCloudTest(test);
  };

  const filteredLocalTests = React.useMemo(() => {
    return testCases.filter(test =>
      test && test.name && test.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testCases, searchTerm]);

  const filteredCloudTests = React.useMemo(() => {
    return cloudTests.filter(test =>
      test && test.name && test.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cloudTests, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
        <div className="flex items-center space-x-4">
          <RecordTestButton />
          <button
            onClick={() => handleAddFolder()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <FolderPlus className="w-5 h-5" />
            <span>New Folder</span>
          </button>
          <button
            onClick={handleCreateTest}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>Create Test</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 bg-white rounded-lg shadow-lg p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Cloud className="w-4 h-4 mr-2" />
                Cloud Tests
              </h3>
              <div className="space-y-2">
                {filteredCloudTests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                      selectedTest?.id === test.id && isCloudTest
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button 
                      className="flex-1 text-left" 
                      onClick={() => {
                        setSelectedTest(test);
                        setIsCloudTest(true);
                      }}
                    >
                      {test.name}
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadCloudTest(test)}
                        className="text-gray-400 hover:text-blue-500"
                        title="Download test"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setIsCloudTest(true);
                        }}
                        className="text-gray-400 hover:text-blue-500"
                        title="Edit test case"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTestCase(test.id, true)}
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

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Computer className="w-4 h-4 mr-2" />
                Local Tests
              </h3>
              <div className="space-y-2">
                {folders
                  .filter((folder) => !folder.parentId)
                  .map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      testCases={filteredLocalTests}
                      folders={folders}
                      onRename={(id, name) => updateFolder({ ...folders.find(f => f.id === id)!, name })}
                      onDelete={deleteFolder}
                      onAddSubfolder={handleAddFolder}
                      onTestMove={handleTestMove}
                      onTestSelect={(id) => {
                        const test = testCases.find(t => t.id === id);
                        if (test) {
                          setSelectedTest(test);
                          setIsCloudTest(false);
                        }
                      }}
                      onTestEdit={(test) => {
                        setSelectedTest(test);
                        setIsCloudTest(false);
                      }}
                      onTestDuplicate={handleDuplicateTest}
                      onTestDelete={(id) => deleteTestCase(id, false)}
                      currentTestId={selectedTest?.id || null}
                    />
                  ))}
                {filteredLocalTests
                  .filter((tc) => !tc.folderId)
                  .map((test) => (
                    <div
                      key={test.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                        selectedTest?.id === test.id && !isCloudTest
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', test.id);
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                    >
                      <button 
                        className="flex-1 text-left" 
                        onClick={() => {
                          setSelectedTest(test);
                          setIsCloudTest(false);
                        }}
                      >
                        {test.name}
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDuplicateTest(test)}
                          className="text-gray-400 hover:text-blue-500"
                          title="Duplicate test case"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setIsCloudTest(false);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                          title="Edit test case"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTestCase(test.id, false)}
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
        </div>

        <div className="col-span-8">
          {selectedTest ? (
            <TestPreviewPanel
              test={selectedTest}
              onSave={handleSaveTest}
              onCancel={() => {
                setSelectedTest(null);
                setIsCreating(false);
                setIsCloudTest(false);
              }}
            />
          ) : recordingTestCase ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recording Test</h2>
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Recording in progress...</span>
                </div>
              </div>
              <ChatPanel />
              <div className="mt-4">
                <button
                  onClick={handleSaveRecordingTest}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Conclude &amp; Save Test
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No Test Selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a test from the list or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};