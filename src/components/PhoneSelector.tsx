import React from 'react';
import { useStore } from '../store';
import { Phone } from 'lucide-react';

export const PhoneSelector: React.FC = () => {
  const phoneNumbers = useStore((state) => state.phoneNumbers);
  const selectedPhoneNumber = useStore((state) => state.selectedPhoneNumber);
  const setPhoneNumbers = useStore((state) => state.setPhoneNumbers);
  const setSelectedPhoneNumber = useStore((state) => state.setSelectedPhoneNumber);

  React.useEffect(() => {
    const fixedNumbers = [
      { id: '551126509993', number: '551126509993@c.us', name: 'Institucional PF' }
    ];
    setPhoneNumbers(fixedNumbers);
    if (!selectedPhoneNumber && fixedNumbers.length > 0) {
      setSelectedPhoneNumber(fixedNumbers[0].number);
    }
  }, [selectedPhoneNumber, setPhoneNumbers, setSelectedPhoneNumber]);

  const formatPhoneDisplay = (phone: { number: string; name?: string }) => {
    const numberWithoutSuffix = phone.number.replace('@c.us', '');
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
        {phoneNumbers.map((phone) => (
          <option key={phone.id} value={phone.number}>
            {formatPhoneDisplay(phone)}
          </option>
        ))}
      </select>
    </div>
  );
};
