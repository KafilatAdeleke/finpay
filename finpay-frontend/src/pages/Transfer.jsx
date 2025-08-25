import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const [wallets, setWallets] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data.wallets);
      if (res.data.wallets.length > 0) {
        setFromCurrency(res.data.wallets[0].currency);
        setToCurrency(res.data.wallets.length > 1 ? res.data.wallets[1].currency : '');
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/transactions/transfer', {
        fromCurrency,
        toCurrency,
        amount,
        description
      });
      setSuccess(true);
      // Reset form
      setAmount('');
      setDescription('');
      // Refresh wallets
      fetchWallets();
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
          <h1 className="text-2xl font-bold">Transfer Between Wallets</h1>
          <p className="text-gray-600 mt-1">
            Convert money between your wallets with real-time exchange rates
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
              Transfer completed successfully!
            </div>
          ) : null}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Wallet
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.currency}>
                      {wallet.currency} ({wallet.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Wallet
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                >
                  {wallets
                    .filter((wallet) => wallet.currency !== fromCurrency)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.currency}>
                        {wallet.currency} ({wallet.balance})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="e.g., Monthly transfer"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Processing...' : 'Transfer'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
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