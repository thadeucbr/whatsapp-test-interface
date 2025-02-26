import React from 'react';
import { useStore } from '../store';
import { TestCase } from '../types';
import { Mic, StopCircle } from 'lucide-react';

export const RecordTestButton: React.FC = () => {
  const { recordingTestCase, setRecordingTestCase, addTestCase } = useStore();

  const handleToggleRecording = () => {
    if (recordingTestCase) {
      // Encerra a gravação: salva o test case e limpa o estado de gravação
      addTestCase(recordingTestCase);
      setRecordingTestCase(null);
    } else {
      // Inicia a gravação: cria um novo test case vazio
      const newTestCase: TestCase = {
        id: Date.now().toString(),
        name: `Novo Teste (Gravando)`,
        interactions: [],
      };
      setRecordingTestCase(newTestCase);
    }
  };

  return (
    <button onClick={handleToggleRecording} title={recordingTestCase ? 'Encerrar teste e salvar' : 'Gravar novo teste'}>
      {recordingTestCase ? (
        <StopCircle className="w-5 h-5 text-red-600 hover:text-red-800" />
      ) : (
        <Mic className="w-5 h-5 text-green-600 hover:text-green-800" />
      )}
    </button>
  );
};
