import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { TestResult } from '../utils/testRunnerUtils';

interface TestResultItemProps {
  result: TestResult;
}

export const TestResultItem: React.FC<TestResultItemProps> = ({ result }) => {
  return (
    <div
      className={`p-3 rounded-lg flex items-start space-x-3 ${
        result.success ? 'bg-green-50' : 'bg-red-50'
      }`}
    >
      {result.success ? (
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          Interação {result.interactionIndex + 1}, Resposta {result.responseIndex + 1}:{' '}
          {result.success ? 'Sucesso' : 'Falhou'}
        </p>
        {!result.success && (
          <div className="mt-2 space-y-3 text-sm text-red-700">
            <p className="font-medium">{result.error}</p>
            {result.details && result.details.map((detail, i) => (
              <div key={i} className="space-y-1 pl-4 border-l-2 border-red-200">
                <p className="font-medium">{detail.field}:</p>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Esperado: </span>
                    <pre className="inline bg-red-100 px-1 rounded">{detail.expected}</pre>
                  </div>
                  <div>
                    <span className="font-medium">Recebido: </span>
                    <pre className="inline bg-red-100 px-1 rounded">{detail.received}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
