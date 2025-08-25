import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function CreateCard() {
  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState('');
  const [brand, setBrand] = useState('Visa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newCard, setNewCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data.wallets);
      if (res.data.wallets.length > 0) {
        setWalletId(res.data.wallets[0].id);
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
    setNewCard(null);

    try {
      const res = await api.post('/cards', {
        walletId,
        brand
      });
      setSuccess(true);
      setNewCard(res.data.card);
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
          <h1 className="text-2xl font-bold">Create Virtual Card</h1>
        </div>

        <div className="p-6">
          {success && newCard ? (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
                Virtual card created successfully!
              </div>
              
              <div className="border rounded-lg p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">{newCard.brand}</h3>
                  <p className="text-xl tracking-widest font-mono mt-2">
                    **** **** **** {newCard.last4}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-medium">{newCard.expMonth}/{newCard.expYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CVV</p>
                    <p className="font-medium">{newCard.cvv}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{newCard.currency}</p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/cards')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View All Cards
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet
                  </label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    required
                  >
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.currency} ({wallet.balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Brand
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    required
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Creating...' : 'Create Card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/cards')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}