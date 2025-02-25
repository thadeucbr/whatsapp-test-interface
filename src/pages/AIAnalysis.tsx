import React from 'react';
import { useStore } from '../store';
import { ChatPanel } from '../components/ChatPanel';
import { Star, AlertCircle, Lightbulb, Brain } from 'lucide-react';

interface Rating {
  category: string;
  score: number;
  justification: string;
}

interface Analysis {
  ratings: Rating[];
  suggestions: string[];
}

export const AIAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const store = useStore();

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    // Converte a conversa para o formato esperado pelo endpoint oficial
    const conversation = store.messages
      .filter((msg) => msg.phoneNumber === store.selectedPhoneNumber)
      .map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      }));

    // Instrução de sistema que orienta o GPT-4 a retornar a análise desejada
    const messages = [
      {
        role: 'system',
        content: `Você deve analisar a conversa a seguir e retornar um JSON com a seguinte estrutura:
{
  "ratings": [
    { "category": "Ease of Use", "score": number, "justification": string },
    { "category": "Persona Consistency", "score": number, "justification": string },
    { "category": "Writing Quality", "score": number, "justification": string },
    { "category": "Overall", "score": number, "justification": string }
  ],
  "suggestions": string[]
}

Não retorne nenhuma outra informação além do JSON.`,
      },
      ...conversation,
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const data = await response.json();
      const outputText = data.choices[0].message.content;
      // Tenta converter a resposta para JSON
      const analysisData: Analysis = JSON.parse(outputText);
      setAnalysis(analysisData);
    } catch (error) {
      console.error(error);
      alert('An error occurred while analyzing the conversation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(score)
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
    <div className="space-y-8">
      {/* Seção de Ação para Iniciar a Análise */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          AI Conversation Analysis
        </h2>
        <div className="max-w-md">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Painel de Conversa */}
        <div className="col-span-8">
          <ChatPanel />
        </div>
        {/* Painel de Resultados da Análise */}
        <div className="col-span-4 space-y-8">
          {analysis && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Analysis Results
                </h3>
                <div className="space-y-6">
                  {analysis.ratings.map((rating) => (
                    <div key={rating.category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
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

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Suggestions for Improvement
                </h3>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
