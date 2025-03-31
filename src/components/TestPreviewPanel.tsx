import React from 'react';
import { Message as MessageType, TestCase, TestInteraction, IncomingMessageDTO } from '../types';
import { MessageCircle, User, ExternalLink, Plus, Save, X, Settings, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store';

interface TestPreviewPanelProps {
  test: TestCase;
  onSave: (test: TestCase) => void;
  onCancel: () => void;
}

const Message: React.FC<{ 
  message: MessageType & { interactionIndex: number; responseIndex?: number };
  onDelete?: () => void;
  onEdit?: () => void;
}> = ({ message, onDelete, onEdit }) => {
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex items-start max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500 ml-2' : 'bg-gray-500 mr-2'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <MessageCircle className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1">
          <div
            className={`rounded-lg p-3 ${
              isUser
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.options && (
              <div className="mt-2 space-y-2">
                {message.type === 'button' &&
                  message.options.map((option: any) => (
                    <button
                      key={option.id}
                      className="w-full px-4 py-2 text-sm text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50"
                    >
                      {option.text}
                    </button>
                  ))}
                {message.type === 'list' &&
                  message.options.map((option: any) => (
                    <div
                      key={option.rowId}
                      className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium">{option.title}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  ))}
                {message.type === 'interactive' &&
                  message.options.map((option: any) => (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50"
                    >
                      <span>{option.displayText}</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  ))}
              </div>
            )}
          </div>
          {(onDelete || onEdit) && (
            <div className="flex justify-end space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ResponseEditorProps {
  response: IncomingMessageDTO;
  onUpdate: (updated: IncomingMessageDTO) => void;
  onDelete: () => void;
}

const ResponseEditor: React.FC<ResponseEditorProps> = ({ response, onUpdate, onDelete }) => {
  const handleTypeChange = (type: 'text' | 'button' | 'list' | 'interactive') => {
    const updatedResponse = {
      ...response,
      type,
      body: {
        ...response.body,
        options: type === 'text' ? null : (response.body.options || []),
      },
    };
    onUpdate(updatedResponse);
  };

  const handleAddOption = () => {
    const newOption =
      response.type === 'button'
        ? { id: Date.now().toString(), text: '' }
        : response.type === 'list'
        ? { rowId: Date.now().toString(), title: '', description: '' }
        : { name: '', displayText: '', url: '' };

    onUpdate({
      ...response,
      body: {
        ...response.body,
        options: [...(response.body.options || []), newOption],
      },
    });
  };

  const handleUpdateOption = (index: number, updatedOption: any) => {
    const newOptions = [...(response.body.options || [])];
    newOptions[index] = updatedOption;
    onUpdate({
      ...response,
      body: {
        ...response.body,
        options: newOptions,
      },
    });
  };

  const handleDeleteOption = (index: number) => {
    onUpdate({
      ...response,
      body: {
        ...response.body,
        options: (response.body.options || []).filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={response.type}
            onChange={(e) =>
              handleTypeChange(e.target.value as 'text' | 'button' | 'list' | 'interactive')
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Texto</option>
            <option value="button">Botão</option>
            <option value="list">Lista</option>
            <option value="interactive">Interativo</option>
          </select>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <textarea
        value={response.body.text}
        onChange={(e) =>
          onUpdate({
            ...response,
            body: { ...response.body, text: e.target.value },
          })
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        rows={2}
        placeholder="Digite o texto da mensagem..."
      />
      {response.type === 'list' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto do Botão
          </label>
          <input
            type="text"
            value={response.body.buttonText || ''}
            onChange={(e) =>
              onUpdate({
                ...response,
                body: { ...response.body, buttonText: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o texto do botão..."
          />
        </div>
      )}
      {response.type !== 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {response.type === 'button'
                ? 'Botões'
                : response.type === 'list'
                ? 'Opções da Lista'
                : 'Opções Interativas'}
            </span>
            <button
              onClick={handleAddOption}
              className="text-blue-500 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {(response.body.options || []).map((option: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1 space-y-2">
                  {response.type === 'button' && (
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleUpdateOption(index, { ...option, text: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Texto do botão"
                    />
                  )}
                  {response.type === 'list' && (
                    <>
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) =>
                          handleUpdateOption(index, { ...option, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Título"
                      />
                      <input
                        type="text"
                        value={option.description}
                        onChange={(e) =>
                          handleUpdateOption(index, {
                            ...option,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Descrição"
                      />
                    </>
                  )}
                  {response.type === 'interactive' && (
                    <>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) =>
                          handleUpdateOption(index, { ...option, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Nome"
                      />
                      <input
                        type="text"
                        value={option.displayText}
                        onChange={(e) =>
                          handleUpdateOption(index, { ...option, displayText: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Texto de Exibição"
                      />
                      <input
                        type="url"
                        value={option.url}
                        onChange={(e) =>
                          handleUpdateOption(index, { ...option, url: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="URL"
                      />
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteOption(index)}
                  className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TestPreviewPanel: React.FC<TestPreviewPanelProps> = ({
  test,
  onSave,
  onCancel,
}) => {
  const [currentTest, setCurrentTest] = React.useState(test);
  const [userMessage, setUserMessage] = React.useState('');
  const [showResponseEditor, setShowResponseEditor] = React.useState(false);
  const [editingMessage, setEditingMessage] = React.useState<{
    interactionIndex: number;
    responseIndex?: number;
  } | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);

  React.useEffect(() => {
    setCurrentTest(test);
    setUserMessage('');
    setEditingMessage(null);
    setShowResponseEditor(false);
  }, [test]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTest.interactions]);

  const handleAddInteraction = () => {
    if (!userMessage.trim()) return;

    const newInteraction: TestInteraction = {
      userMessage: userMessage.trim(),
      expectedResponses: [],
    };

    setCurrentTest({
      ...currentTest,
      interactions: [...currentTest.interactions, newInteraction],
    });
    setUserMessage('');
    setShowResponseEditor(true);
  };

  const handleDeleteInteraction = (index: number) => {
    const newInteractions = [...currentTest.interactions];
    newInteractions.splice(index, 1);
    setCurrentTest({
      ...currentTest,
      interactions: newInteractions,
    });
  };

  const handleEditUserMessage = (index: number) => {
    setEditingMessage({ interactionIndex: index });
    setUserMessage(currentTest.interactions[index].userMessage);
  };

  const handleUpdateUserMessage = () => {
    if (!editingMessage || !userMessage.trim()) return;

    const newInteractions = [...currentTest.interactions];
    newInteractions[editingMessage.interactionIndex].userMessage = userMessage.trim();
    setCurrentTest({
      ...currentTest,
      interactions: newInteractions,
    });
    setEditingMessage(null);
    setUserMessage('');
  };

  const handleAddResponse = (interactionIndex: number) => {
    const newResponse = {
      from: selectedPhoneNumber || '551126509993@c.us',
      body: {
        text: '',
        buttonText: null,
        options: null,
      },
      timestamp: Date.now(),
      type: 'text',
    };
    const newInteractions = currentTest.interactions.map((interaction, index) =>
      index === interactionIndex
        ? { ...interaction, expectedResponses: [...interaction.expectedResponses, newResponse] }
        : interaction
    );
    setCurrentTest({
      ...currentTest,
      interactions: newInteractions,
    });
  };

  const handleUpdateResponse = (
    interactionIndex: number,
    responseIndex: number,
    updatedResponse: IncomingMessageDTO
  ) => {
    const newInteractions = currentTest.interactions.map((interaction, index) =>
      index === interactionIndex
        ? {
            ...interaction,
            expectedResponses: interaction.expectedResponses.map((response, rIndex) =>
              rIndex === responseIndex ? updatedResponse : response
            ),
          }
        : interaction
    );
    setCurrentTest({
      ...currentTest,
      interactions: newInteractions,
    });
  };

  const handleDeleteResponse = (interactionIndex: number, responseIndex: number) => {
    const newInteractions = currentTest.interactions.map((interaction, index) =>
      index === interactionIndex
        ? {
            ...interaction,
            expectedResponses: interaction.expectedResponses.filter((_, i) => i !== responseIndex),
          }
        : interaction
    );
    setCurrentTest({
      ...currentTest,
      interactions: newInteractions,
    });
  };

  const getPreviewMessages = (): (MessageType & { interactionIndex: number; responseIndex?: number })[] => {
    const messages: (MessageType & { interactionIndex: number; responseIndex?: number })[] = [];
    currentTest.interactions.forEach((interaction, interactionIndex) => {
      messages.push({
        id: `user-${interactionIndex}`,
        content: interaction.userMessage,
        timestamp: Date.now(),
        isUser: true,
        type: 'text',
        interactionIndex,
      });
      interaction.expectedResponses.forEach((response, responseIndex) => {
        messages.push({
          id: `response-${interactionIndex}-${responseIndex}`,
          content: response.body.text,
          timestamp: response.timestamp,
          isUser: false,
          type: response.type,
          options: response.body.options || undefined,
          buttonText: response.body.buttonText,
          interactionIndex,
          responseIndex,
        });
      });
    });
    return messages;
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={currentTest.name}
            onChange={(e) =>
              setCurrentTest({
                ...currentTest,
                name: e.target.value,
              })
            }
            className="text-lg font-semibold bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
            placeholder="Digite o nome do teste..."
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSave(currentTest)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Teste</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {getPreviewMessages().map((message) => (
          <Message
            key={message.id}
            message={message}
            onDelete={() =>
              message.isUser
                ? handleDeleteInteraction(message.interactionIndex)
                : handleDeleteResponse(
                    message.interactionIndex,
                    message.responseIndex!
                  )
            }
            onEdit={() =>
              message.isUser
                ? handleEditUserMessage(message.interactionIndex)
                : setEditingMessage({
                    interactionIndex: message.interactionIndex,
                    responseIndex: message.responseIndex,
                  })
            }
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t max-h-60 overflow-y-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                editingMessage ? handleUpdateUserMessage() : handleAddInteraction();
              }
            }}
            placeholder={
              editingMessage
                ? 'Editar mensagem do usuário...'
                : 'Digite a mensagem do usuário...'
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={editingMessage ? handleUpdateUserMessage : handleAddInteraction}
            disabled={!userMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingMessage ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowResponseEditor(!showResponseEditor)}
            className="px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {showResponseEditor && currentTest.interactions.length > 0 && (
          <div className="mt-4">
            {(() => {
              const editingIndex = editingMessage ? editingMessage.interactionIndex : currentTest.interactions.length - 1;
              const interaction = currentTest.interactions[editingIndex];
              return (
                <div key={editingIndex} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">
                      Interação {editingIndex + 1}
                    </h3>
                    <button
                      onClick={() => handleAddResponse(editingIndex)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Usuário: "{interaction.userMessage}"
                  </p>
                  <div className="space-y-4">
                    {interaction.expectedResponses.map((response, responseIndex) => (
                      <ResponseEditor
                        key={responseIndex}
                        response={response}
                        onUpdate={(updated) =>
                          handleUpdateResponse(editingIndex, responseIndex, updated)
                        }
                        onDelete={() =>
                          handleDeleteResponse(editingIndex, responseIndex)
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
