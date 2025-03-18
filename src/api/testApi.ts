import axios from 'axios';
import type { TestCase } from '../types';

const API_BASE_URL = 'https://whatsappapi.barbudas.com/api/v1';

export const fetchCloudTests = async (): Promise<TestCase[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/testfiles`);
    return response.data.map((t: any) => ({ ...t.content, id: t._id }));
  } catch (error) {
    console.error('Error fetching cloud tests:', error);
    return [];
  }
};

export const createCloudTest = async (test: TestCase): Promise<TestCase | null> => {
  try {
    const payload = { content: test };
    const response = await axios.post(`${API_BASE_URL}/testfiles`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = response.data;
    return { ...data.content, id: data._id };
  } catch (error) {
    console.error('Error creating cloud test:', error);
    return null;
  }
};

export const updateCloudTest = async (id: string, test: TestCase): Promise<TestCase | null> => {
  try {
    const payload = { content: test };
    const response = await axios.put(`${API_BASE_URL}/testfiles/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = response.data;
    return { ...data.content, id: data._id };
  } catch (error) {
    console.error('Error updating cloud test:', error);
    return null;
  }
};

export const deleteCloudTest = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_BASE_URL}/testfiles/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting cloud test:', error);
    return false;
  }
};