import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userRes = await api.get('/users/me');
        setUser(userRes.data.user);

        const walletRes = await api.get('/wallets');
        setWallets(walletRes.data.wallets);
      } catch (err) {
        console.error(err);
        // Redirect to login if unauthorized
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-6">
        <h1 className="text-xl font-semibold">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-medium mb-4">Your Wallets</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wallets.length === 0 ? (
            <p>No wallets yet. Start by creating one.</p>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <h3 className="text-sm text-gray-500">{wallet.currency}</h3>
                <p className="text-2xl font-bold mt-1">{wallet.balance}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Wallet ID: {wallet.id.slice(-6)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <a
            href="/transactions"
            className="text-blue-600 hover:underline text-sm"
          >
            View all transactions →
          </a>
        </div>
      </div>
    </div>
  );
}