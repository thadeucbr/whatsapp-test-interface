import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestResultItem } from './TestResultItem';
import { TestResult } from '../utils/testRunnerUtils';

describe('TestResultItem', () => {
  it('renders correctly when the result is a success', () => {
    const testResult: TestResult = {
      success: true,
      interactionIndex: 0,
      responseIndex: 1,
    };
    const { container } = render(<TestResultItem result={testResult} />);

    // The top-level div should have 'bg-green-50'
    const topDiv = container.querySelector('div.bg-green-50');
    expect(topDiv).toBeInTheDocument();

    // Check for the success icon
    const successIcon = topDiv?.querySelector('svg.text-green-500');
    expect(successIcon).toBeInTheDocument();

    // Ensure the success text is present
    expect(screen.getByText('Interaction 1, Response 2: Success')).toBeInTheDocument();
  });

  it('renders correctly when the result is a failure', () => {
    const testResult: TestResult = {
      success: false,
      interactionIndex: 1,
      responseIndex: 0,
      error: 'Some error occurred',
      details: [
        {
          field: 'username',
          expected: 'user123',
          received: 'user456',
        },
      ],
    };
    const { container } = render(<TestResultItem result={testResult} />);

    // The top-level div should have 'bg-red-50'
    const topDiv = container.querySelector('div.bg-red-50');
    expect(topDiv).toBeInTheDocument();

    // Check for the failure icon
    const failureIcon = topDiv?.querySelector('svg.text-red-500');
    expect(failureIcon).toBeInTheDocument();

    // Ensure the failure text is present
    expect(screen.getByText('Interaction 2, Response 1: Failed')).toBeInTheDocument();

    // Check for the error message
    expect(screen.getByText('Some error occurred')).toBeInTheDocument();

    // Check for the detail fields and values
    expect(screen.getByText('username:')).toBeInTheDocument();
    expect(screen.getByText('Expected:')).toBeInTheDocument();
    expect(screen.getByText('user123')).toBeInTheDocument();
    expect(screen.getByText('Received:')).toBeInTheDocument();
    expect(screen.getByText('user456')).toBeInTheDocument();
  });

  it('does not render error details when the result is a success', () => {
    const testResult: TestResult = {
      success: true,
      interactionIndex: 0,
      responseIndex: 0,
    };
    render(<TestResultItem result={testResult} />);

    // Ensure that error-related texts are not present
    expect(screen.queryByText('Expected:')).not.toBeInTheDocument();
    expect(screen.queryByText('Received:')).not.toBeInTheDocument();
    expect(screen.queryByText('error')).not.toBeInTheDocument();
    expect(screen.queryByText('Unknown error')).not.toBeInTheDocument();
  });

  it('handles multiple details in a failed result', () => {
    const testResult: TestResult = {
      success: false,
      interactionIndex: 2,
      responseIndex: 3,
      error: 'Multiple errors occurred',
      details: [
        {
          field: 'email',
          expected: 'test@example.com',
          received: 'test@wrong.com',
        },
        {
          field: 'password',
          expected: '****',
          received: '1234',
        },
      ],
    };
    render(<TestResultItem result={testResult} />);

    // Check for each detail's field and values
    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText('password:')).toBeInTheDocument();

    // Using getAllByText to handle multiple 'Expected:' and 'Received:' texts
    const expectedElements = screen.getAllByText('Expected:');
    const receivedElements = screen.getAllByText('Received:');

    expect(expectedElements).toHaveLength(2);
    expect(receivedElements).toHaveLength(2);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('test@wrong.com')).toBeInTheDocument();
    expect(screen.getByText('****')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders without details when details are undefined in a failed result', () => {
    const testResult: TestResult = {
      success: false,
      interactionIndex: 3,
      responseIndex: 2,
      error: 'Unknown error',
      details: undefined,
    };
    const { container } = render(<TestResultItem result={testResult} />);

    // The top-level div should have 'bg-red-50'
    const topDiv = container.querySelector('div.bg-red-50');
    expect(topDiv).toBeInTheDocument();

    // Ensure that the error message is present using a function matcher
    expect(
      screen.getByText((content, element) => {
        return content.includes('Unknown error') && element?.tagName.toLowerCase() === 'p';
      })
    ).toBeInTheDocument();

    // Ensure that error-related detail texts are not present
    expect(screen.queryByText('Expected:')).not.toBeInTheDocument();
    expect(screen.queryByText('Received:')).not.toBeInTheDocument();
  });
});