/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { IncomingMessageDTO } from '../types';

export interface ResponseEditorProps {
  response: IncomingMessageDTO;
  onUpdate: (updatedResponse: IncomingMessageDTO) => void;
  onDelete: () => void;
}

export const ResponseEditor: React.FC<ResponseEditorProps> = ({ response, onUpdate, onDelete }) => {
  const [type, setType] = React.useState<'text' | 'button' | 'list' | 'interactive'>(response.type);
  const [text, setText] = React.useState(response.body.text);
  const [buttonText, setButtonText] = React.useState(response.body.buttonText || '');
  const [options, setOptions] = React.useState<Array<any>>(response.body.options || []);

  const handleUpdate = () => {
    const updatedBody: any = {
      text: text.trim(),
    };

    if (type === 'list') {
      updatedBody.buttonText = buttonText.trim() || null;
    }

    if (type !== 'text') {
      updatedBody.options = options.length > 0 ? options : null;
    } else {
      updatedBody.options = null;
    }

    const updatedResponse: IncomingMessageDTO = {
      ...response,
      type,
      body: updatedBody,
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

  const handleOptionUpdate = (index: number, updatedOption: { id?: string; text?: string; rowId?: string; title?: string; description?: string; name?: string; displayText?: string; url?: string }) => {
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
        <button onClick={onDelete} className="text-red-500 hover:text-red-700" title="Delete response">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="response-type" className="block text-sm font-medium text-gray-700 mb-1">
            Response Type
          </label>
          <select
            id="response-type"
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
          <label htmlFor="message-text" className="block text-sm font-medium text-gray-700 mb-1">
            Message Text
          </label>
          <textarea
            id="message-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
            placeholder="Enter message text"
          />
        </div>
        {type === 'list' && (
          <div>
            <label htmlFor="button-text" className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              id="button-text"
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter button text"
            />
          </div>
        )}
        {(type === 'button' || type === 'list' || type === 'interactive') && (
          <fieldset className="space-y-2">
            <div className="flex justify-between items-center">
              <legend className="block text-sm font-medium text-gray-700">
                {type === 'button' ? 'Buttons' : type === 'list' ? 'List Options' : 'Interactive Options'}
              </legend>
              <button onClick={handleOptionAdd} className="text-blue-500 hover:text-blue-700" title="Add option">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <div key={index} className="flex space-x-2 items-start">
                  {type === 'button' ? (
                    <>
                      <label htmlFor={`button-text-${index}`} className="sr-only">
                        Button Text
                      </label>
                      <input
                        id={`button-text-${index}`}
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            text: e.target.value,
                          })
                        }
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Button text"
                      />
                    </>
                  ) : type === 'list' ? (
                    <div className="flex-1 space-y-2">
                      <label htmlFor={`list-title-${index}`} className="sr-only">
                        Title
                      </label>
                      <input
                        id={`list-title-${index}`}
                        type="text"
                        value={option.title}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Title"
                      />
                      <label htmlFor={`list-description-${index}`} className="sr-only">
                        Description
                      </label>
                      <textarea
                        id={`list-description-${index}`}
                        value={option.description}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 space-y-2">
                      <label htmlFor={`interactive-name-${index}`} className="sr-only">
                        Name
                      </label>
                      <input
                        id={`interactive-name-${index}`}
                        type="text"
                        value={option.name}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Name"
                      />
                      <label htmlFor={`interactive-displayText-${index}`} className="sr-only">
                        Display Text
                      </label>
                      <input
                        id={`interactive-displayText-${index}`}
                        type="text"
                        value={option.displayText}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            displayText: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Display Text"
                      />
                      <label htmlFor={`interactive-url-${index}`} className="sr-only">
                        URL
                      </label>
                      <input
                        id={`interactive-url-${index}`}
                        type="url"
                        value={option.url}
                        onChange={(e) =>
                          handleOptionUpdate(index, {
                            ...option,
                            url: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="URL"
                      />
                    </div>
                  )}
                  <button onClick={() => handleOptionDelete(index)} className="mt-1 text-red-500 hover:text-red-700" title="Delete option">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
};