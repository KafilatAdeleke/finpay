import { useState } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function CreateWallet() {
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'NGN'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/wallets', { currency });
      setSuccess(true);
      // Redirect to wallets page after a short delay
      setTimeout(() => {
        navigate('/wallets');
      }, 1500);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Create Wallet</h1>
        </div>

        <div className="p-6">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
              Wallet created successfully! Redirecting...
            </div>
          ) : null}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                required
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Supported currencies: {SUPPORTED_CURRENCIES.join(', ')}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Creating...' : 'Create Wallet'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/wallets')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}