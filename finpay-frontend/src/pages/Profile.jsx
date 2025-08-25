import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [setupStep, setSetupStep] = useState(0); // 0: not started, 1: show QR, 2: verify
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.user);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await api.get('/2fa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setSetupStep(1);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    try {
      await api.post('/2fa/verify', { token });
      // Refresh user data
      fetchProfile();
      setSetupStep(0);
      setToken('');
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDisable2FA = async () => {
    try {
      // For simplicity, we're not implementing token verification here
      // In a real app, you'd want to verify the token before disabling
      await api.post('/2fa/disable', { token: '' });
      // Refresh user data
      fetchProfile();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Security</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    {user?.twoFactorEnabled 
                      ? '2FA is enabled on your account' 
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <div>
                  {user?.twoFactorEnabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={handleSetup2FA}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>

              {/* 2FA Setup Steps */}
              {setupStep === 1 && (
                <div className="mt-6 p-4 bg-white border rounded-lg">
                  <h4 className="font-medium mb-2">Step 1: Scan QR Code</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Or enter this secret key manually: <code className="bg-gray-100 p-1 rounded">{secret}</code>
                  </p>
                  <button
                    onClick={() => setSetupStep(2)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Next: Verify
                  </button>
                </div>
              )}

              {setupStep === 2 && (
                <div className="mt-6 p-4 bg-white border rounded-lg">
                  <h4 className="font-medium mb-2">Step 2: Verify</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <form onSubmit={handleVerify2FA}>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-4"
                      placeholder="123456"
                      maxLength="6"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => setSetupStep(1)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}