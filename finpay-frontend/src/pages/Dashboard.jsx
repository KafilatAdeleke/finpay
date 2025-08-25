import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">FinPay Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallets Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Your Wallets</h2>
            <button
              onClick={() => navigate('/wallets')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage Wallets →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wallets.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow border text-center">
                <p className="text-gray-500 mb-4">No wallets yet</p>
                <button
                  onClick={() => navigate('/wallets/create')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create your first wallet
                </button>
              </div>
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
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/transfer')}
              className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition"
            >
              <h3 className="font-medium">Transfer Money</h3>
              <p className="text-sm text-gray-600 mt-1">Between your wallets</p>
            </button>
            <button
              onClick={() => navigate('/send')}
              className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition"
            >
              <h3 className="font-medium">Send Payment</h3>
              <p className="text-sm text-gray-600 mt-1">To other users</p>
            </button>
            <button
              onClick={() => navigate('/cards')}
              className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition"
            >
              <h3 className="font-medium">Virtual Cards</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your cards</p>
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition"
            >
              <h3 className="font-medium">Invoices</h3>
              <p className="text-sm text-gray-600 mt-1">Create and manage</p>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 text-center text-gray-500">
              <p>Transaction history will appear here</p>
              <button
                onClick={() => navigate('/transactions')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                View transaction history
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}