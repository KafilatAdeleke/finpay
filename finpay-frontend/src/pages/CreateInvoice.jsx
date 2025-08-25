import { useState } from 'react';
import { api } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

export default function CreateInvoice() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    currency: 'USD',
    amount: '',
    description: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newInvoice, setNewInvoice] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setNewInvoice(null);

    try {
      const res = await api.post('/invoices', formData);
      setSuccess(true);
      setNewInvoice(res.data.invoice);
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
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>

        <div className="p-6">
          {success && newInvoice ? (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
                Invoice created successfully!
              </div>
              
              <div className="border rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{newInvoice.customerName}</p>
                    <p className="text-sm text-gray-500">{newInvoice.customerEmail}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">{newInvoice.amount} {newInvoice.currency}</p>
                  </div>
                  
                  {newInvoice.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{newInvoice.description}</p>
                    </div>
                  )}
                  
                  {newInvoice.dueDate && (
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium">{new Date(newInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Payment Link</p>
                    <a
                      href={newInvoice.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {newInvoice.paymentUrl}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/invoices')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View All Invoices
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
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
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    rows="3"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/invoices')}
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