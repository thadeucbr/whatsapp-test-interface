import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Bot, TestTube } from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { TestManager } from './components/TestManager';
import { TestRunner } from './components/TestRunner';
import { PhoneSelector } from './components/PhoneSelector';
import { AIAnalysis } from './pages/AIAnalysis';
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;