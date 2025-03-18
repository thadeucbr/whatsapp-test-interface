import { create } from 'zustand';
import { TestCase, Message, PhoneNumber, Folder } from './types';
import { fetchCloudTests, createCloudTest, updateCloudTest, deleteCloudTest } from './api/testApi';

interface Store {
  recordingTestCase: null | TestCase;
  testCases: TestCase[];
  cloudTests: TestCase[];
  folders: Folder[];
  currentTestId: string | null;
  messages: Message[];
  connected: boolean;
  phoneNumbers: PhoneNumber[];
  selectedPhoneNumber: string | null;
  addTestCase: (testCase: TestCase, saveToCloud?: boolean) => Promise<void>;
  updateTestCase: (testCase: TestCase, saveToCloud?: boolean) => Promise<void>;
  deleteTestCase: (id: string, isCloudTest?: boolean) => Promise<void>;
  setCurrentTestId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setConnected: (status: boolean) => void;
  setPhoneNumbers: (numbers: PhoneNumber[]) => void;
  setSelectedPhoneNumber: (number: string | null) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  setRecordingTestCase: (testCase: TestCase | null) => void;
  fetchAndSetCloudTests: () => Promise<void>;
  downloadCloudTest: (test: TestCase) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  testCases: JSON.parse(localStorage.getItem('testCases') || '[]'),
  cloudTests: [],
  folders: JSON.parse(localStorage.getItem('folders') || '[]'),
  currentTestId: null,
  messages: [],
  connected: false,
  phoneNumbers: [],
  selectedPhoneNumber: null,
  recordingTestCase: null,

  fetchAndSetCloudTests: async () => {
    const cloudTests = await fetchCloudTests();
    set({ cloudTests });
  },

  downloadCloudTest: async (test: TestCase) => {
    const { testCases } = get();
    const newTest = { ...test, id: Date.now().toString() };
    const updatedTests = [...testCases, newTest];
    localStorage.setItem('testCases', JSON.stringify(updatedTests));
    set({ testCases: updatedTests });
  },

  setRecordingTestCase: (testCase: TestCase | null) =>
    set({ recordingTestCase: testCase }),

  addTestCase: async (testCase: TestCase, saveToCloud = false) => {
    const { testCases } = get();
    const newTestCases = [...testCases, testCase];
    localStorage.setItem('testCases', JSON.stringify(newTestCases));
    set({ testCases: newTestCases });

    if (saveToCloud) {
      const cloudTest = await createCloudTest(testCase);
      if (cloudTest) {
        set((state) => ({ cloudTests: [...state.cloudTests, cloudTest] }));
      }
    }
  },

  updateTestCase: async (testCase: TestCase, saveToCloud = false) => {
    const { testCases, cloudTests } = get();
    const newTestCases = testCases.map((tc) =>
      tc.id === testCase.id ? testCase : tc
    );
    localStorage.setItem('testCases', JSON.stringify(newTestCases));
    set({ testCases: newTestCases });

    if (saveToCloud) {
      const cloudTest = cloudTests.find((ct) => ct.id === testCase.id);
      if (cloudTest) {
        const updatedCloudTest = await updateCloudTest(cloudTest.id, testCase);
        if (updatedCloudTest) {
          set((state) => ({
            cloudTests: state.cloudTests.map((ct) =>
              ct.id === testCase.id ? updatedCloudTest : ct
            ),
          }));
        }
      }
    }
  },

  deleteTestCase: async (id: string, isCloudTest = false) => {
    if (isCloudTest) {
      const success = await deleteCloudTest(id);
      if (success) {
        set((state) => ({
          cloudTests: state.cloudTests.filter((ct) => ct.id !== id),
        }));
      }
    } else {
      const { testCases } = get();
      const newTestCases = testCases.filter((tc) => tc.id !== id);
      localStorage.setItem('testCases', JSON.stringify(newTestCases));
      set({ testCases: newTestCases });
    }
  },

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