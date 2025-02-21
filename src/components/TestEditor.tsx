import React from 'react';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { TestCase, TestInteraction, IncomingMessageDTO } from '../types';

interface TestEditorProps {
  testCase: TestCase | null;
  onSave: (testCase: TestCase) => void;
  onCancel: () => void;
}

interface ResponseEditorProps {
  response: IncomingMessageDTO;
  onUpdate: (updatedResponse: IncomingMessageDTO) => void;
  onDelete: () => void;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({ response, onUpdate, onDelete }) => {
  const [type, setType] = React.useState<'text' | 'button' | 'list' | 'interactive'>(response.type);
  const [text, setText] = React.useState(response.body.text);
  const [buttonText, setButtonText] = React.useState(response.body.buttonText || '');
  const [options, setOptions] = React.useState<Array<any>>(response.body.options || []);

  const handleUpdate = () => {
    const updatedResponse: IncomingMessageDTO = {
      ...response,
      type,
      body: {
        text: text.trim(),
        buttonText: type === 'list' ? buttonText.trim() : null,
        options: type !== 'text' ? options : null,
      },
      timestamp: Date.now(),
    };
    onUpdate(updatedResponse);
  };

  const handleOptionAdd = () => {
    if (type === 'button') {
      setOptions([...options, { id: Date.now().toString(), text: '' }]);
    } else if (type === 'list') {
      setOptions([...options, { rowId: Date.now().toString(), title: '', description: '' }]);
    } else if (type === 'interactive') {
      setOptions([...options, { name: '', displayText: '', url: '' }]);
    }
  };

  const handleOptionUpdate = (index: number, updatedOption: any) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    setOptions(newOptions);
  };

  const handleOptionDelete = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    handleUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <label className="block text-sm font-medium text-gray-700 mb-1"> Response Type </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'text' | 'button' | 'list' | 'interactive')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="button">Button</option>
            <option value="list">List</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1"> Message Text </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
            placeholder="Enter message text"
          />
        </div>
        {type === 'list' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"> Button Text </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter button text"
            />
          </div>
        )}
        {(type === 'button' || type === 'list' || type === 'interactive') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                {type === 'button' ? 'Buttons' : type === 'list' ? 'List Options' : 'Interactive Options'}
              </label>
              <button onClick={handleOptionAdd} className="text-blue-500 hover:text-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <div key={index} className="flex space-x-2">
                  {type === 'button' ? (
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionUpdate(index, {
                          ...option,
                          text: e.target.value.trim(),
                        })
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Button text"
                    />
                  ) : type === 'list' ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            title: e.target.value.trim(),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Title"
                      />
                      <textarea
                        value={option.description}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            description: e.target.value.trim(),
                          })
                        }
                        rows={2}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            name: e.target.value.trim(),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={option.displayText}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            displayText: e.target.value.trim(),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Display Text"
                      />
                      <input
                        type="url"
                        value={option.url}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            url: e.target.value.trim(),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="URL"
                      />
                    </div>
                  )}
                  <button onClick={() => handleOptionDelete(index)} className="text-red-500 hover:text-red-700">
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
          <label className="block text-sm font-medium text-gray-700 mb-1"> Test Case Name </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1"> User Message </label>
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