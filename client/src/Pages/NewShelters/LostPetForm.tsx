import React from 'react';
import { useNavigate } from 'react-router-dom';

const LostPetForm: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Report Lost Pet</h1>
        <button 
          onClick={handleBack}
          className="mb-6 text-blue-500 hover:text-blue-600"
        >
          ← Back to Main Page
        </button>
      </div>
      <div className="space-y-2 text-center">
        <label htmlFor="address" className="block text-sm font-medium">
          Where did your pet get lost?
        </label>
        <p className="text-sm text-gray-500">Please provide a specific street address. We will never share your exact location.</p>
        <input
          type="text"
          id="address"
          name="address"
          className="w-full max-w-md mx-auto p-2 border rounded-lg"
          required
        />
      </div>
    </div>
  );
};

export default LostPetForm;