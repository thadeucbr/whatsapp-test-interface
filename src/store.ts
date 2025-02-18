import { create } from 'zustand';
import { TestCase, Message, PhoneNumber } from './types';

interface Store {
  testCases: TestCase[];
  currentTestId: string | null;
  messages: Message[];
  connected: boolean;
  phoneNumbers: PhoneNumber[];
  selectedPhoneNumber: string | null;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (testCase: TestCase) => void;
  deleteTestCase: (id: string) => void;
  setCurrentTestId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setConnected: (status: boolean) => void;
  setPhoneNumbers: (numbers: PhoneNumber[]) => void;
  setSelectedPhoneNumber: (number: string | null) => void;
}

// Create store with plain objects and functions
export const useStore = create<Store>()((set) => ({
  testCases: JSON.parse(localStorage.getItem('testCases') || '[]'),
  currentTestId: null,
  messages: [],
  connected: false,
  phoneNumbers: [],
  selectedPhoneNumber: null,
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
  setPhoneNumbers: (numbers) => set({ phoneNumbers: numbers }),
  setSelectedPhoneNumber: (number) => set({ selectedPhoneNumber: number }),
}));