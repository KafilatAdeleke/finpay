import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/wallets');
      setWallets(res.data.wallets);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = () => {
    navigate('/wallets/create');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Wallets</h1>
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Wallets</h1>
            <button
              onClick={handleCreateWallet}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Wallet
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {error}
            </div>
          </div>
        )}

        <div className="p-6">
          {wallets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't have any wallets yet</p>
              <button
                onClick={handleCreateWallet}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Your First Wallet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{wallet.currency}</h3>
                      <p className="text-2xl font-bold mt-2">{wallet.balance}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Wallet ID: {wallet.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}