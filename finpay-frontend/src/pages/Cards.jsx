import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/cards');
      setCards(res.data.cards);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeCard = async (cardId) => {
    try {
      await api.post(`/cards/${cardId}/freeze`);
      // Refresh cards
      fetchCards();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleUnfreezeCard = async (cardId) => {
    try {
      await api.post(`/cards/${cardId}/unfreeze`);
      // Refresh cards
      fetchCards();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const getCardStatusClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'frozen': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Virtual Cards</h1>
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
            <h1 className="text-2xl font-bold">Virtual Cards</h1>
            <button
              onClick={() => navigate('/cards/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Card
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
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't have any virtual cards yet</p>
              <button
                onClick={() => navigate('/cards/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Your First Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{card.brand}</h3>
                      <p className="text-gray-600">**** **** **** {card.last4}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCardStatusClass(card.status)}`}>
                      {card.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-medium">{card.expMonth}/{card.expYear}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{card.currency}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {card.status === 'active' ? (
                      <button
                        onClick={() => handleFreezeCard(card.id)}
                        className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                      >
                        Freeze
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnfreezeCard(card.id)}
                        className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
                      >
                        Unfreeze
                      </button>
                    )}
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