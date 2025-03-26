import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.test-interface',
    content: 'This is the Test Interface where you can manage your tests.',
  },
  {
    target: '.ai-analysis',
    content: 'This section provides AI Analysis of your conversations.',
  },
  {
    target: '.dual-chat-testing',
    content: 'Here you can perform Dual Chat Testing.',
  },
  {
    target: '.test-management',
    content: 'Manage your tests in this section.',
  },
  {
    target: '.phone-selector',
    content: 'Select a phone number to start testing.',
  },
  {
    target: '.chat-panel',
    content: 'This is the Chat Panel where you can see the conversation.',
  },
];

const GuidedTour: React.FC = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('isFirstVisit') === null;
    if (isFirstVisit) {
      setRun(true);
      localStorage.setItem('isFirstVisit', 'false');
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
    } else {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
};

export default GuidedTour;
