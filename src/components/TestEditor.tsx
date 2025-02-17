import React from 'react';
import { TestCase, TestInteraction, Button, Row } from '../types';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

interface TestEditorProps {
  testCase: TestCase | null;
  onSave: (testCase: TestCase) => void;
  onCancel: () => void;
}

interface ResponseEditorProps {
  interaction: TestInteraction;
  onUpdate: (updated: TestInteraction) => void;
  onDelete: () => void;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({
  interaction,
  onUpdate,
  onDelete,
}) => {
  const [type, setType] = React.useState(interaction.expectedResponses[0]?.type || 'text');
  const [text, setText] = React.useState(interaction.expectedResponses[0]?.body.text || '');
  const [buttonText, setButtonText] = React.useState(
    interaction.expectedResponses[0]?.body.buttonText || ''
  );
  const [options, setOptions] = React.useState<Array<Button | Row>>(
    interaction.expectedResponses[0]?.body.options || []
  );

  const handleUpdate = () => {
    const response = {
      from: '551126509993@c.us',
      body: {
        text,
        // Changed condition: buttonText should only be set when type is 'list'
        buttonText: type === 'list' ? buttonText : null,
        options: type !== 'text' ? options : null,
      },
      timestamp: Date.now(),
      type: type as 'text' | 'button' | 'list',
    };

    onUpdate({
      ...interaction,
      expectedResponses: [response],
    });
  };

  const handleOptionAdd = () => {
    if (type === 'button') {
      setOptions([...options, { id: Date.now().toString(), text: '' }]);
    } else if (type === 'list') {
      setOptions([
        ...options,
        {
          rowId: Date.now().toString(),
          title: '',
          description: '',
        },
      ]);
    }
  };

  const handleOptionUpdate = (index: number, updatedOption: Button | Row) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    setOptions(newOptions);
  };

  const handleOptionDelete = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    handleUpdate();
  }, [type, text, buttonText, options]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Expected Response</h4>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="button">Button</option>
            <option value="list">List</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
            placeholder="Enter message text"
          />
        </div>
        {/* Show Button Text only for 'list' type */}
        {type === 'list' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter button text"
            />
          </div>
        )}
        {(type === 'button' || type === 'list') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                {type === 'button' ? 'Buttons' : 'List Options'}
              </label>
              <button onClick={handleOptionAdd} className="text-blue-500 hover:text-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex space-x-2">
                  {type === 'button' ? (
                    <input
                      type="text"
                      value={(option as Button).text}
                      onChange={(e) =>
                        handleOptionUpdate(index, {
                          id: (option as Button).id,
                          text: e.target.value,
                        })
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Button text"
                    />
                  ) : (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={(option as Row).title}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...(option as Row),
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Title"
                      />
                      <textarea
                        value={(option as Row).description}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...(option as Row),
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Description"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleOptionDelete(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
        expectedResponses: [
          {
            from: '551126509993@c.us',
            body: {
              text: '',
              buttonText: null,
              options: null,
            },
            timestamp: Date.now(),
            type: 'text',
          },
        ],
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

  const handleSave = () => {
    onSave({
      id: testCase?.id || Date.now().toString(),
      name,
      interactions,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
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
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Case Name
          </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Message
                </label>
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
              <ResponseEditor
                interaction={interaction}
                onUpdate={(updated) => handleUpdateInteraction(index, updated)}
                onDelete={() => handleDeleteInteraction(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
