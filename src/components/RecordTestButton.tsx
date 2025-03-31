import React from 'react';
import { useStore } from '../store';
import { TestCase } from '../types';
import { Mic, StopCircle } from 'lucide-react';

export const RecordTestButton: React.FC = () => {
  const { recordingTestCase, setRecordingTestCase, addTestCase } = useStore();

  const handleToggleRecording = () => {
    if (recordingTestCase) {
      // End recording: save the test case and clear recording state
      addTestCase(recordingTestCase);
      setRecordingTestCase(null);
    } else {
      // Start recording: create a new empty test case
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
        <StopCircle data-testid="stop-icon" className="w-5 h-5 text-red-600 hover:text-red-800" />
      ) : (
        <Mic data-testid="mic-icon" className="w-5 h-5 text-green-600 hover:text-green-800" />
      )}
    </button>
  );
};
