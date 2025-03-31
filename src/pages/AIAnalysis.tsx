import React from 'react';
import { useStore } from '../store';
import { ChatPanel } from '../components/ChatPanel';
import { Star, AlertCircle, Lightbulb, Brain } from 'lucide-react';
import axios from 'axios';

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

  const conversation = React.useMemo(() => {
    return store.messages.filter(
      (msg) => msg.phoneNumber === store.selectedPhoneNumber
    );
  }, [store.messages, store.selectedPhoneNumber]);

  const handleStartAnalysis = async () => {
    if (conversation.length === 0) {
      alert('No conversation found for analysis.');
      return;
    }

    setIsAnalyzing(true);

    const formattedConversation = conversation.map((msg) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content,
    }));

    const messages = [
      {
        role: 'system',
        content: `You should analyze the following conversation and return a JSON with this structure:
{
  "ratings": [
    { "category": "Ease of Use", "score": number(0-5), "justification": string },
    { "category": "Persona Consistency", "score": number(0-5), "justification": string },
    { "category": "Writing Quality", "score": number(0-5), "justification": string },
    { "category": "Overall", "score": number(0-5), "justification": string }
  ],
  "suggestions": string[]
}

Do not return any other information besides the JSON.`,
      },
      ...formattedConversation,
    ];

    try {
      const response = await axios.post('https://whatsappapi.barbudas.com/api/v1/ai', {
        messages: messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      });
      
      const analysisData: Analysis = response.data;
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          AI Conversation Analysis
        </h2>
        <div className="max-w-md">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || conversation.length === 0}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChatPanel />
        </div>
        <div className="lg:col-span-4 space-y-6">
          {analysis && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Analysis Results
                </h3>
                <div className="space-y-6">
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

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
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