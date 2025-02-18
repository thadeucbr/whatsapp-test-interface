import axios from 'axios';
import type { PhoneNumber } from './types';

const API_BASE_URL = 'https://whatsappapi.barbudas.com';

export const fetchPhoneNumbers = async (): Promise<PhoneNumber[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/phones`);
    return response.data.map((phone: any) => ({
      id: phone.number.replace('@c.us', ''),
      number: phone.number,
      name: phone.name ?? ''
    }));
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return [];
  }
};