import { create } from 'zustand';
import { TestCase, Message, PhoneNumber, Folder } from './types';

interface Store {
  testCases: TestCase[];
  folders: Folder[];
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
  addFolder: (folder: Folder) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  testCases: JSON.parse(localStorage.getItem('testCases') || '[]'),
  folders: JSON.parse(localStorage.getItem('folders') || '[]'),
  currentTestId: null,
  messages: [],
  connected: false,
  phoneNumbers: [],
  selectedPhoneNumber: null,
  recordingTestCase: null,
  setRecordingTestCase: (testCase: TestCase | null) =>
    set({ recordingTestCase: testCase }),
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
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setConnected: (status) => set({ connected: status }),
  setPhoneNumbers: (numbers) => set({ phoneNumbers: numbers }),
  setSelectedPhoneNumber: (number) => set({ selectedPhoneNumber: number }),
  addFolder: (folder) =>
    set((state) => {
      const newFolders = [...state.folders, folder];
      localStorage.setItem('folders', JSON.stringify(newFolders));
      return { folders: newFolders };
    }),
  updateFolder: (folder) =>
    set((state) => {
      const newFolders = state.folders.map((f) => (f.id === folder.id ? folder : f));
      localStorage.setItem('folders', JSON.stringify(newFolders));
      return { folders: newFolders };
    }),
  deleteFolder: (id) =>
    set((state) => {
      const newFolders = state.folders.filter((f) => f.id !== id);
      localStorage.setItem('folders', JSON.stringify(newFolders));
      const updatedTestCases = state.testCases.map((tc) =>
        tc.folderId === id ? { ...tc, folderId: undefined } : tc
      );
      localStorage.setItem('testCases', JSON.stringify(updatedTestCases));
      return { folders: newFolders, testCases: updatedTestCases };
    }),
}));
