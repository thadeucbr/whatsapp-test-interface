import React from 'react';
import { useStore } from '../store';
import { Message as MessageType } from '../types';
import { MessageCircle, User } from 'lucide-react';

const Message: React.FC<{ message: MessageType }> = ({ message }) => {
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex items-start max-w-[70%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
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
          <p className="text-sm">{message.content}</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatPanel: React.FC = () => {
  const messages = useStore((state) => state.messages);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Chat Preview</h2>
      </div>
      <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 150px)' }}>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
  
  
};