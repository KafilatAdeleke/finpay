import { useState } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function TwoFactorAuth() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get tempToken from localStorage (set during login)
  const tempToken = localStorage.getItem('tempToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/2fa/verify-login', { token, tempToken });
      const { token: finalToken, user } = res.data;

      // Save final token and user data
      localStorage.setItem('token', finalToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Remove temp token
      localStorage.removeItem('tempToken');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear tokens and go to login
    localStorage.removeItem('tempToken');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!tempToken) {
    // If no temp token, redirect to login
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Two-Factor Authentication</h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter the 6-digit code from your authenticator app
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Authentication Code</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="123456"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button
          onClick={handleCancel}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 rounded border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}