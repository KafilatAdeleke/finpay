import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function SendMoney() {
  const [wallets, setWallets] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
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
        setCurrency(res.data.wallets[0].currency);
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
      await api.post('/transactions/send', {
        recipientEmail,
        currency,
        amount,
        description
      });
      setSuccess(true);
      // Reset form
      setRecipientEmail('');
      setAmount('');
      setDescription('');
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
          <h1 className="text-2xl font-bold">Send Money</h1>
          <p className="text-gray-600 mt-1">
            Send money to other FinPay users instantly
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
              Payment sent successfully!
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
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="recipient@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
                placeholder="e.g., Dinner payment"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Sending...' : 'Send Payment'}
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