import React from 'react';
import { useStore } from '../store';
import { Phone } from 'lucide-react';
import type { PhoneNumber } from '../types';

const FIXED_PHONE_NUMBERS: PhoneNumber[] = [
  { id: '1126509993', number: '551126509993@c.us', name: 'Institucional PF' }
];

export const PhoneSelector: React.FC = () => {
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);
  const setSelectedPhoneNumber = useStore((state) => state.setSelectedPhoneNumber);

  React.useEffect(() => {
    if (selectedPhoneNumber == null && FIXED_PHONE_NUMBERS.length > 0) {
      setSelectedPhoneNumber(FIXED_PHONE_NUMBERS[0].number);
    }
  }, [selectedPhoneNumber, setSelectedPhoneNumber]);

  const formatPhoneDisplay = (phone: PhoneNumber) => {
    const numberWithoutSuffix = phone.number.replace('@c.us', '').replace(/^55/, '');
    return phone.name ? `${phone.name} (${numberWithoutSuffix})` : numberWithoutSuffix;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
      <div className="flex items-center space-x-3 mb-2">
        <Phone className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Select Phone Number</h2>
      </div>
      <select
        value={selectedPhoneNumber || ''}
        onChange={(e) => setSelectedPhoneNumber(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a phone number</option>
        {FIXED_PHONE_NUMBERS.map((phone) => (
          <option key={phone.id} value={phone.number}>
            {formatPhoneDisplay(phone)}
          </option>
        ))}
      </select>
    </div>
  );
};