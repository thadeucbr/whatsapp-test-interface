import { compareOptions, verifySingleResponse } from './testRunnerUtils';
import { IncomingMessageDTO } from '../types';

interface Message {
  type: string;
  content: string;
  buttonText?: string | null;
  options?: any[];
}

describe('compareOptions', () => {
  describe('button type', () => {
    it('should return error if lengths mismatch', () => {
      const expected = [{ text: 'A' }];
      const received: any[] = [];
      const result = compareOptions(expected, received, 'button');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Expected 1 buttons but received 0');
    });

    it('should return success if options match', () => {
      const expected = [{ text: 'A' }, { text: 'B' }];
      const received = [{ text: 'A' }, { text: 'B' }];
      const result = compareOptions(expected, received, 'button');
      expect(result.success).toBe(true);
      expect(result.details).toBeUndefined();
    });

    it('should return details when texts do not match', () => {
      const expected = [{ text: 'A' }];
      const received = [{ text: 'B' }];
      const result = compareOptions(expected, received, 'button');
      expect(result.success).toBe(false);
      expect(result.details).toEqual([
        { field: 'Button 1 text', expected: 'A', received: 'B' }
      ]);
    });
  });

  describe('list type', () => {
    it('should return error if lengths mismatch', () => {
      const expected = [{ title: 'Title1', description: 'Desc1', buttonText: 'Btn1' }];
      const received: any[] = [];
      const result = compareOptions(expected, received, 'list');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Expected 1 lists but received 0');
    });

    it('should return success if all fields match', () => {
      const expected = [
        { title: 'Title1', description: 'Desc1', buttonText: 'Btn1' },
        { title: 'Title2', description: 'Desc2', buttonText: 'Btn2' }
      ];
      const received = [
        { title: 'Title1', description: 'Desc1', buttonText: 'Btn1' },
        { title: 'Title2', description: 'Desc2', buttonText: 'Btn2' }
      ];
      const result = compareOptions(expected, received, 'list');
      expect(result.success).toBe(true);
      expect(result.details).toBeUndefined();
    });

    it('should return details when title, description or buttonText mismatch', () => {
      const expected = [
        { title: 'Title1', description: 'Desc1', buttonText: 'Btn1' }
      ];
      const received = [
        { title: 'WrongTitle', description: 'WrongDesc', buttonText: 'WrongBtn' }
      ];
      const result = compareOptions(expected, received, 'list');
      expect(result.success).toBe(false);
      expect(result.details).toEqual([
        { field: 'List item 1 title', expected: 'Title1', received: 'WrongTitle' },
        { field: 'List item 1 description', expected: 'Desc1', received: 'WrongDesc' },
        { field: 'List item 1 button text', expected: 'Btn1', received: 'WrongBtn' }
      ]);
    });
  });

  describe('interactive type', () => {
    it('should return error if lengths mismatch', () => {
      const expected = [{ displayText: 'Option1', url: 'url1' }];
      const received: any[] = [];
      const result = compareOptions(expected, received, 'interactive');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Expected 1 interactives but received 0');
    });

    it('should return success if all fields match', () => {
      const expected = [
        { displayText: 'Option1', url: 'url1' },
        { displayText: 'Option2', url: 'url2' }
      ];
      const received = [
        { displayText: 'Option1', url: 'url1' },
        { displayText: 'Option2', url: 'url2' }
      ];
      const result = compareOptions(expected, received, 'interactive');
      expect(result.success).toBe(true);
      expect(result.details).toBeUndefined();
    });

    it('should return details when displayText or url mismatch', () => {
      const expected = [{ displayText: 'Option1', url: 'url1' }];
      const received = [{ displayText: 'WrongOption', url: 'wrongUrl' }];
      const result = compareOptions(expected, received, 'interactive');
      expect(result.success).toBe(false);
      expect(result.details).toEqual([
        { field: 'Interactive option 1 display text', expected: 'Option1', received: 'WrongOption' },
        { field: 'Interactive option 1 URL', expected: 'url1', received: 'wrongUrl' }
      ]);
    });
  });
});

describe('verifySingleResponse', () => {
  it('should return success for matching text messages', () => {
    const expected: IncomingMessageDTO = {
      from: 'user1',
      type: 'text',
      timestamp: 123456789,
      body: {
        text: 'Hello',
        buttonText: null,
        options: null
      }
    };
    const received: Message = {
      type: 'text',
      content: 'Hello'
    };
    const result = verifySingleResponse(expected, received, 0, 0);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return error for type mismatch', () => {
    const expected: IncomingMessageDTO = {
      from: 'user1',
      type: 'text',
      timestamp: 123456789,
      body: {
        text: 'Hello',
        buttonText: null,
        options: null
      }
    };
    const received: Message = {
      type: 'button',
      content: 'Hello'
    };
    const result = verifySingleResponse(expected, received, 0, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Message type mismatch');
    expect(result.details).toEqual([
      { field: 'Message type', expected: 'text', received: 'button' }
    ]);
  });

  it('should return error for content mismatch', () => {
    const expected: IncomingMessageDTO = {
      from: 'user1',
      type: 'text',
      timestamp: 123456789,
      body: {
        text: 'Hello World',
        buttonText: null,
        options: null
      }
    };
    const received: Message = {
      type: 'text',
      content: 'Hi'
    };
    const result = verifySingleResponse(expected, received, 1, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Message content mismatch');
    expect(result.details).toEqual([
      { field: 'Message text', expected: 'Hello World', received: 'Hi' }
    ]);
  });

  it('should return error for list type buttonText mismatch', () => {
    const expected: IncomingMessageDTO = {
      from: 'user1',
      type: 'list',
      timestamp: 123456789,
      body: {
        text: 'List Message',
        buttonText: 'Click Me',
        options: [{ title: 'Row1', description: 'Desc1', buttonText: 'Btn1' }]
      }
    };
    const received: Message = {
      type: 'list',
      content: 'List Message',
      buttonText: 'Do Not Click',
      options: [{ title: 'Row1', description: 'Desc1', buttonText: 'Btn1' }]
    };
    const result = verifySingleResponse(expected, received, 2, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Button text mismatch');
    expect(result.details).toEqual([
      { field: 'Button text', expected: 'Click Me', received: 'Do Not Click' }
    ]);
  });

  it('should return error when options mismatch in non-text message', () => {
    const expected: IncomingMessageDTO = {
      from: 'user1',
      type: 'interactive',
      timestamp: 123456789,
      body: {
        text: 'Interactive Message',
        buttonText: null,
        options: [{ displayText: 'Option1', url: 'url1' }]
      }
    };
    const received: Message = {
      type: 'interactive',
      content: 'Interactive Message',
      options: [{ displayText: 'WrongOption', url: 'url1' }]
    };
    const result = verifySingleResponse(expected, received, 3, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('interactive content mismatch');
    expect(result.details).toEqual([
      { field: 'Interactive option 1 display text', expected: 'Option1', received: 'WrongOption' }
    ]);
  });
});