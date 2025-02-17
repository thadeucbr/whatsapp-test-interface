import React from 'react';
import { ChatPanel } from './components/ChatPanel';
import { TestManager } from './components/TestManager';
import { TestRunner } from './components/TestRunner';
import './socket';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          WhatsApp Chatbot Test Interface
        </h1>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4 space-y-8">
            <TestManager />
            <TestRunner />
          </div>
          <div className="col-span-8">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;