import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import axios from 'axios';
import { fetchCloudTests, createCloudTest, updateCloudTest, deleteCloudTest } from './testApi';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('API Cloud Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchCloudTests', () => {
    it('should return test cases array', async () => {
      const data = [{ _id: '1', content: { name: 'Test 1' } }];
      mockedAxios.get.mockResolvedValue({ data });
      const results = await fetchCloudTests();
      expect(results).toEqual([{ id: '1', name: 'Test 1' }]);
    });

    it('should return empty array on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('error'));
      const results = await fetchCloudTests();
      expect(results).toEqual([]);
    });
  });

  describe('createCloudTest', () => {
    it('should create a test case', async () => {
      const testCase = { name: 'New Test' };
      const responseData = { _id: '2', content: testCase };
      mockedAxios.post.mockResolvedValue({ data: responseData });
      const result = await createCloudTest(testCase);
      expect(result).toEqual({ id: '2', name: 'New Test' });
    });

    it('should return null on error', async () => {
      const testCase = { name: 'New Test' };
      mockedAxios.post.mockRejectedValue(new Error('error'));
      const result = await createCloudTest(testCase);
      expect(result).toBeNull();
    });
  });

  describe('updateCloudTest', () => {
    it('should update a test case', async () => {
      const testCase = { name: 'Updated Test' };
      const id = '3';
      const responseData = { _id: id, content: testCase };
      mockedAxios.put.mockResolvedValue({ data: responseData });
      const result = await updateCloudTest(id, testCase);
      expect(result).toEqual({ id, name: 'Updated Test' });
    });

    it('should return null on error', async () => {
      const testCase = { name: 'Updated Test' };
      const id = '3';
      mockedAxios.put.mockRejectedValue(new Error('error'));
      const result = await updateCloudTest(id, testCase);
      expect(result).toBeNull();
    });
  });

  describe('deleteCloudTest', () => {
    it('should return true on successful delete', async () => {
      const id = '4';
      mockedAxios.delete.mockResolvedValue({});
      const result = await deleteCloudTest(id);
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const id = '4';
      mockedAxios.delete.mockRejectedValue(new Error('error'));
      const result = await deleteCloudTest(id);
      expect(result).toBe(false);
    });
  });
});