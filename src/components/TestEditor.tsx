import React from 'react';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { TestCase, TestInteraction } from '../types';
import { ResponseEditor } from './ResponseEditor';

export interface TestEditorProps {
  testCase: TestCase | null;
  onSave: (testCase: TestCase) => void;
  onCancel: () => void;
}

export const TestEditor: React.FC<TestEditorProps> = ({ testCase, onSave, onCancel }) => {
  const [name, setName] = React.useState(testCase?.name || '');
  const [interactions, setInteractions] = React.useState<TestInteraction[]>(
    testCase?.interactions || []
  );

  const handleAddInteraction = () => {
    setInteractions([
      ...interactions,
      {
        userMessage: '',
        expectedResponses: [],
      },
    ]);
  };

  const handleUpdateInteraction = (index: number, updated: TestInteraction) => {
    const newInteractions = [...interactions];
    newInteractions[index] = updated;
    setInteractions(newInteractions);
  };

  const handleDeleteInteraction = (index: number) => {
    setInteractions(interactions.filter((_, i) => i !== index));
  };

  const handleAddResponse = (interactionIndex: number) => {
    const newInteractions = [...interactions];
    newInteractions[interactionIndex].expectedResponses.push({
      from: '551126509993@c.us',
      body: {
        text: '',
        buttonText: null,
        options: null,
      },
      timestamp: Date.now(),
      type: 'text',
    });
    setInteractions(newInteractions);
  };

  const handleSave = () => {
    onSave({
      id: testCase?.id || Date.now().toString(),
      name,
      interactions,
      folderId: testCase?.folderId,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {testCase ? 'Edit Test Case' : 'New Test Case'}
          </h2>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>
      <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Case Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter test case name"
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-800">Interactions</h3>
            <button
              onClick={handleAddInteraction}
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Interaction</span>
            </button>
          </div>
          {interactions.map((interaction, index) => (
            <div key={index} className="space-y-4 p-4 bg-white border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Interaction {index + 1}</h4>
                <button
                  onClick={() => handleDeleteInteraction(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Message</label>
                <textarea
                  value={interaction.userMessage}
                  onChange={(e) =>
                    handleUpdateInteraction(index, {
                      ...interaction,
                      userMessage: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                  placeholder="Enter user message"
                />
              </div>
              <div className="space-y-4">
                {interaction.expectedResponses.map((response, respIndex) => (
                  <ResponseEditor
                    key={respIndex}
                    response={response}
                    onUpdate={(updatedResponse) => {
                      const newInteractions = [...interactions];
                      newInteractions[index].expectedResponses[respIndex] = updatedResponse;
                      setInteractions(newInteractions);
                    }}
                    onDelete={() => {
                      const newInteractions = [...interactions];
                      newInteractions[index].expectedResponses.splice(respIndex, 1);
                      setInteractions(newInteractions);
                    }}
                  />
                ))}
                <button
                  onClick={() => handleAddResponse(index)}
                  className="flex items-center space-x-1 text-green-500 hover:text-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Response</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
