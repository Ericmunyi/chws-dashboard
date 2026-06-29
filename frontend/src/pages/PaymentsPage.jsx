import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw, Wallet, CreditCard, Plus, X, TrendingUp, Calendar } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, paymentsData] = await Promise.all([
        paymentsAPI.summary(),
        paymentsAPI.list({ limit: 50, payment_method: filterMethod || undefined }),
      ]);
      setSummary(summaryData);
      setPayments(paymentsData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filterMethod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
        <p className="text-gray-900 font-medium mb-2">Failed to load payments</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track cash and M-Pesa payments received
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="input text-sm w-40"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
          </select>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Record Payment
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">Cash Received</p>
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <p className="stat-value text-green-600">
              KES {summary.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">M-Pesa Received</p>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <p className="stat-value text-blue-600">
              KES {summary.mpesaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">Total Received</p>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <p className="stat-value text-primary-600">
              KES {summary.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {summary.paymentCount} payment{summary.paymentCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-medium text-gray-700">Payment History</h3>
        </div>
        <div className="card-body p-0">
          {payments.length === 0 ? (
            <p className="text-gray-500 text-sm p-6">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-4 py-2 text-gray-500 font-medium">Date</th>
                    <th className="px-4 py-2 text-gray-500 font-medium">Patient</th>
                    <th className="px-4 py-2 text-gray-500 font-medium">CHW</th>
                    <th className="px-4 py-2 text-gray-500 font-medium">Method</th>
                    <th className="px-4 py-2 text-gray-500 font-medium">Description</th>
                    <th className="px-4 py-2 text-gray-500 font-medium text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-medium">{p.patient_name || '\u2014'}</td>
                      <td className="px-4 py-2 text-gray-600">{p.chw_name || '\u2014'}</td>
                      <td className="px-4 py-2">
                        <span className={`badge ${p.payment_method === 'cash' ? 'badge-success' : 'badge-info'}`}>
                          {p.payment_method === 'cash' ? 'Cash' : 'M-Pesa'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{p.description || '\u2014'}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RecordPaymentModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'cash',
    description: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await paymentsAPI.create({
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        description: form.description,
        payment_date: form.payment_date,
      });
      toast.success('Payment recorded successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className="input"
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
              className="input"
            >
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input"
              rows="2"
              placeholder="Optional notes..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
