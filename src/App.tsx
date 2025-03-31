import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Bot, TestTube, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { TestManager } from './components/TestManager';
import { TestRunner } from './components/TestRunner';
import { PhoneSelector } from './components/PhoneSelector';
import { AIAnalysis } from './pages/AIAnalysis';
import { DualChatAITesting } from './pages/DualChatAITesting';
import { TestManagement } from './pages/TestManagement';
import './socket';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-1 flex items-center justify-between">
                {/* Mobile menu button */}
                <button
                  onClick={toggleMenu}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>

                {/* Desktop navigation */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <TestTube className="w-5 h-5 mr-2" />
                    <span>Interface de Teste</span>
                  </Link>
                  <Link
                    to="/ai"
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    <span>Análise de IA</span>
                  </Link>
                  {/* <Link
                    to="/dual-chat"
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Dual Chat Testing</span>
                  </Link> */}
                  <Link
                    to="/test-management"
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Gerenciamento de Testes</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <TestTube className="w-5 h-5 mr-2" />
                <span>Interface de Teste</span>
              </Link>
              <Link
                to="/ai"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <Bot className="w-5 h-5 mr-2" />
                <span>Análise de IA</span>
              </Link>
              <Link
                to="/dual-chat"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                <span>Dual Chat Testing</span>
              </Link>
              <Link
                to="/test-management"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span>Gerenciamento de Testes</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <PhoneSelector />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                      <TestManager />
                      <TestRunner />
                    </div>
                    <div className="lg:col-span-8">
                      <ChatPanel />
                    </div>
                  </div>
                </div>
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
