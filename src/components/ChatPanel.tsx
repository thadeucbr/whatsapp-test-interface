import React from 'react';
import { useStore } from '../store';
import { sendMessage } from '../socket';
import { Message as MessageType } from '../types';
import { MessageCircle, User, ExternalLink, Send } from 'lucide-react';

const Message: React.FC<{ message: MessageType }> = ({ message }) => {
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
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
      </div>
    </div>
  );
};

export const ChatPanel: React.FC = () => {
  const messages = useStore((state) => state.messages);
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = React.useMemo(() => {
    if (!selectedPhoneNumber) return [];
    return messages.filter((msg) => msg.phoneNumber === selectedPhoneNumber);
  }, [messages, selectedPhoneNumber]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(91vh-11rem)]">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Chat Preview</h2>
        {selectedPhoneNumber && (
          <p className="text-sm text-gray-600 mt-1">
            Showing messages for: {selectedPhoneNumber}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!message.trim() || !selectedPhoneNumber}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};