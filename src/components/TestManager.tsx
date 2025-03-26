import React from 'react';
import { useStore } from '../store';
import { TestCase } from '../types';
import { Computer, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TestManager: React.FC = () => {
  const {
    testCases,
    currentTestId,
    deleteTestCase,
    setCurrentTestId,
    selectedPhoneNumber
  } = useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const navigate = useNavigate();

  const filteredTests = React.useMemo(() => {
    return testCases.filter(test =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedPhoneNumber
        ? test.interactions?.some(interaction =>
            interaction.expectedResponses?.some(resp => resp.from === selectedPhoneNumber)
          )
        : true)
    );
  }, [testCases, searchTerm, selectedPhoneNumber]);

  const handleEdit = (test: TestCase) => {
    navigate('/test-management', { state: { selectedTest: test, isCloudTest: false } });
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(40vh-8rem)]">
      <div className="p-4 bg-gray-50 border-b flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Computer className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Local Tests</h2>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredTests.map((testCase: TestCase) => (
            <div
              key={testCase.id}
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
          {filteredTests.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No local tests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};