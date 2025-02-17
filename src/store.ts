import { create } from 'zustand';
import { TestCase, Message } from './types';

interface Store {
  testCases: TestCase[];
  currentTestId: string | null;
  messages: Message[];
  connected: boolean;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (testCase: TestCase) => void;
  deleteTestCase: (id: string) => void;
  setCurrentTestId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setConnected: (status: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  testCases: JSON.parse(localStorage.getItem('testCases') || '[]'),
  currentTestId: null,
  messages: [],
  connected: false,
  addTestCase: (testCase) =>
    set((state) => {
      const newTestCases = [...state.testCases, testCase];
      localStorage.setItem('testCases', JSON.stringify(newTestCases));
      return { testCases: newTestCases };
    }),
  updateTestCase: (testCase) =>
    set((state) => {
      const newTestCases = state.testCases.map((tc) =>
        tc.id === testCase.id ? testCase : tc
      );
      localStorage.setItem('testCases', JSON.stringify(newTestCases));
      return { testCases: newTestCases };
    }),
  deleteTestCase: (id) =>
    set((state) => {
      const newTestCases = state.testCases.filter((tc) => tc.id !== id);
      localStorage.setItem('testCases', JSON.stringify(newTestCases));
      return { testCases: newTestCases };
    }),
  setCurrentTestId: (id) => set({ currentTestId: id }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setConnected: (status) => set({ connected: status }),
}));