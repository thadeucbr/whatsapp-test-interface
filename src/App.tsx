import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Bot, TestTube, MessageSquare, Settings } from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { TestManager } from './components/TestManager';
import { TestRunner } from './components/TestRunner';
import { PhoneSelector } from './components/PhoneSelector';
import { AIAnalysis } from './pages/AIAnalysis';
import { DualChatAITesting } from './pages/DualChatAITesting';
import { TestManagement } from './pages/TestManagement';
import './socket';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <TestTube className="w-5 h-5 mr-2" />
                  Test Interface
                </Link>
                <Link
                  to="/ai"
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  AI Analysis
                </Link>
                <Link
                  to="/dual-chat"
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Dual Chat Testing
                </Link>
                <Link
                  to="/test-management"
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Test Management
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <PhoneSelector />
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-4 space-y-8">
                      <TestManager />
                      <TestRunner />
                    </div>
                    <div className="col-span-8">
                      <ChatPanel />
                    </div>
                  </div>
                </>
              }
            />
            <Route path="/ai" element={<AIAnalysis />} />
            <Route path="/dual-chat" element={<DualChatAITesting />} />
            <Route path="/test-management" element={<TestManagement />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;