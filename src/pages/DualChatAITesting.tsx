import React from 'react';
import { useStore } from '../store';
import { ChatPanel } from '../components/ChatPanel';
import { PhoneSelector } from '../components/PhoneSelector';
import { Star, AlertCircle, Lightbulb, Brain, Send, Play } from 'lucide-react';
import socket from '../socket';

interface Rating {
  category: string;
  score: number;
  justification: string;
}

interface Analysis {
  ratings: Rating[];
  suggestions: string[];
}

interface GPTMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export const DualChatAITesting: React.FC = () => {
  const [gptMessages, setGptMessages] = React.useState<GPTMessage[]>([]);
  const [userInput, setUserInput] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [testStarted, setTestStarted] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gptMessages]);

  React.useEffect(() => {
    const handleAIAnswer = (message: string) => {
      setGptMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: message,
        isUser: false,
        timestamp: Date.now()
      }]);
    };

    socket.on('ai-answer', handleAIAnswer);

    return () => {
      socket.off('ai-answer', handleAIAnswer);
    };
  }, []);

  const handleStartTest = () => {
    if (!selectedPhoneNumber) {
      alert('Por favor, selecione um número de telefone primeiro');
      return;
    }

    setTestStarted(true);
    setIsAnalyzing(true);
    setGptMessages([{
      id: Date.now().toString(),
      content: "Olá! Vou testar esta interface do WhatsApp. Com o que você gostaria de ajuda hoje?",
      isUser: false,
      timestamp: Date.now()
    }]);

    socket.emit('start-ai-test', { phoneNumber: selectedPhoneNumber });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !testStarted) return;

    const newMessage = {
      id: Date.now().toString(),
      content: userInput,
      isUser: true,
      timestamp: Date.now()
    };

    setGptMessages(prev => [...prev, newMessage]);
    socket.emit('user-ai-response', { message: userInput });
    setUserInput('');

    if (gptMessages.length > 6 && !analysis) {
      setTimeout(() => {
        setAnalysis({
          ratings: [
            {
              category: 'Facilidade de Uso',
              score: 4.5,
              justification:
                'O fluxo da conversa foi intuitivo e as opções foram claramente apresentadas. A navegação entre os tópicos foi suave.',
            },
            {
              category: 'Consistência da Persona',
              score: 4.0,
              justification:
                'O bot manteve um tom profissional consistente durante toda a conversa, embora houvesse pequenas variações na formalidade.',
            },
            {
              category: 'Qualidade da Escrita',
              score: 4.2,
              justification:
                'As mensagens foram bem estruturadas e claras. A gramática e a pontuação estavam consistentemente corretas.',
            },
            {
              category: 'Geral',
              score: 4.2,
              justification:
                'O chatbot apresenta um bom desempenho em todas as métricas, proporcionando uma experiência confiável e amigável ao usuário.',
            },
          ],
          suggestions: [
            'Considere adicionar respostas mais contextuais para consultas complexas',
            'Implemente perguntas de acompanhamento para esclarecer a intenção do usuário quando necessário',
            'Adicione mais elementos personalizados com base no histórico do usuário',
            'Considere expandir a gama de opções interativas nas respostas',
          ],
        });
        setIsAnalyzing(false);
      }, 3000);
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= score
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({score})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Teste de IA de Chat Duplo</h2>
          <button
            onClick={handleStartTest}
            disabled={!selectedPhoneNumber || testStarted}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Play className="w-4 h-4" />
            <span>Iniciar Teste</span>
          </button>
        </div>
        <div className="mt-4">
          <PhoneSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-purple-50 border-b">
              <h2 className="text-lg font-semibold text-purple-800">Interação GPT</h2>
              <p className="text-sm text-purple-600 mt-1">
                Converse com o GPT para testar a interface do WhatsApp
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-purple-50">
              {gptMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`flex items-start max-w-[90%] sm:max-w-[70%] ${
                      message.isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser ? 'bg-purple-500 ml-2' : 'bg-indigo-500 mr-2'
                      }`}
                    >
                      {message.isUser ? (
                        <span className="text-white text-sm">Você</span>
                      ) : (
                        <span className="text-white text-sm">GPT</span>
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-purple-500 text-white rounded-tr-none'
                          : 'bg-indigo-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={!testStarted}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || !testStarted}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-[600px] flex flex-col">
            <ChatPanel />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-12">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Análise GPT
              {isAnalyzing && <span className="ml-2 text-sm text-gray-500">(Analisando...)</span>}
            </h3>
            
            {analysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-700">Avaliações</h4>
                    {analysis.ratings.map((rating) => (
                      <div key={rating.category}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                          <span className="font-medium text-gray-700 mb-1 sm:mb-0">
                            {rating.category}
                          </span>
                          {renderStars(rating.score)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {rating.justification}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Sugestões para Melhoria
                    </h4>
                    <ul className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <AlertCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                {testStarted 
                  ? "A análise aparecerá aqui assim que o teste for concluído..." 
                  : "Inicie um teste para ver a análise"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
