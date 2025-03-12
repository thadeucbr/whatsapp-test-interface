import { Message, IncomingMessageDTO } from '../types';

export interface TestResult {
  interactionIndex: number;
  responseIndex: number;
  success: boolean;
  error?: string;
  details?: {
    field: string;
    expected: string;
    received: string;
  }[];
}

export const compareOptions = (
  expected: any[],
  received: any[],
  type: 'button' | 'list' | 'interactive'
): { success: boolean; error?: string; details?: { field: string; expected: string; received: string }[] } => {
  if (expected.length !== received.length) {
    return {
      success: false,
      error: `Expected ${expected.length} ${type}s but received ${received.length}`,
    };
  }

  const details: { field: string; expected: string; received: string }[] = [];

  for (let i = 0; i < expected.length; i++) {
    if (type === 'button') {
      const expectedButton = expected[i] as { text: string };
      const receivedButton = received[i] as { text: string };
      if (expectedButton.text !== receivedButton.text) {
        details.push({
          field: `Button ${i + 1} text`,
          expected: expectedButton.text,
          received: receivedButton.text,
        });
      }
    } else if (type === 'list') {
      const expectedRow = expected[i] as { title: string; description: string };
      const receivedRow = received[i] as { title: string; description: string };
      const expectedButtonText = (expectedRow as any).buttonText;
      const receivedButtonText = (receivedRow as any).buttonText;

      if (expectedRow.title !== receivedRow.title) {
        details.push({
          field: `List item ${i + 1} title`,
          expected: expectedRow.title,
          received: receivedRow.title,
        });
      }
      if (expectedRow.description !== receivedRow.description) {
        details.push({
          field: `List item ${i + 1} description`,
          expected: expectedRow.description,
          received: receivedRow.description,
        });
      }
      if (expectedButtonText !== receivedButtonText) {
        details.push({
          field: `List item ${i + 1} button text`,
          expected: expectedButtonText || 'null',
          received: receivedButtonText || 'null',
        });
      }
    } else if (type === 'interactive') {
      const expectedOption = expected[i] as { displayText: string; url: string };
      const receivedOption = received[i] as { displayText: string; url: string };
      if (expectedOption.displayText !== receivedOption.displayText) {
        details.push({
          field: `Interactive option ${i + 1} display text`,
          expected: expectedOption.displayText,
          received: receivedOption.displayText,
        });
      }
      if (expectedOption.url !== receivedOption.url) {
        details.push({
          field: `Interactive option ${i + 1} URL`,
          expected: expectedOption.url,
          received: receivedOption.url,
        });
      }
    }
  }

  return {
    success: details.length === 0,
    error: details.length > 0 ? `${type} content mismatch` : undefined,
    details: details.length > 0 ? details : undefined,
  };
};

export const verifySingleResponse = (
  expected: IncomingMessageDTO,
  receivedMessage: Message,
  currentInteractionIndex: number,
  currentResponseIndex: number
): TestResult => {
  const result: TestResult = {
    interactionIndex: currentInteractionIndex,
    responseIndex: currentResponseIndex,
    success: true,
  };

  if (expected.type !== receivedMessage.type) {
    return {
      ...result,
      success: false,
      error: `Message type mismatch`,
      details: [
        {
          field: 'Message type',
          expected: expected.type,
          received: receivedMessage.type,
        },
      ],
    };
  }

  if (expected.body.text !== receivedMessage.content) {
    return {
      ...result,
      success: false,
      error: 'Message content mismatch',
      details: [
        {
          field: 'Message text',
          expected: expected.body.text,
          received: receivedMessage.content,
        },
      ],
    };
  }

  if (expected.type === 'list') {
    if (expected.body.buttonText !== receivedMessage.buttonText) {
      return {
        ...result,
        success: false,
        error: 'Button text mismatch',
        details: [
          {
            field: 'Button text',
            expected: expected.body.buttonText || 'null',
            received: receivedMessage.buttonText || 'null',
          },
        ],
      };
    }
  }

  if (expected.type !== 'text' && expected.body.options) {
    const optionsComparison = compareOptions(expected.body.options, receivedMessage.options || [], expected.type);
    if (!optionsComparison.success) {
      return {
        ...result,
        success: false,
        error: optionsComparison.error,
        details: optionsComparison.details,
      };
    }
  }

  return result;
};
