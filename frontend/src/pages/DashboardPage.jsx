import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, Plus, X, CheckCircle } from 'lucide-react';
import {
  Users, Home, Activity, CalendarCheck, UserCheck,
  AlertTriangle, Clock, Stethoscope, Ambulance, Smartphone, Send
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { referralsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import SyncStatusPanel from '../components/SyncStatusPanel';
import CHWActivityChart from '../components/CHWActivityChart';
import SystemHealthPanel from '../components/SystemHealthPanel';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const {
    summary,
    syncStatus,
    chwActivity,
    health,
    patientStats,
    referrals,
    loading,
    error,
    refresh,
  } = useDashboardData();
  const [showReferralModal, setShowReferralModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
        <p className="text-gray-900 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={refresh} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total Patients',
      value: summary?.totalPatients?.toLocaleString(),
      icon: Users,
      color: 'blue',
      subtitle: `${patientStats?.total || 0} registered`,
    },
    {
      label: 'Active Households',
      value: summary?.totalHouseholds?.toLocaleString(),
      icon: Home,
      color: 'green',
    },
    {
      label: 'Active CHWs',
      value: summary?.totalCHWs?.toLocaleString(),
      icon: UserCheck,
      color: 'purple',
    },
    {
      label: 'Encounters',
      value: summary?.totalEncounters?.toLocaleString(),
      icon: Stethoscope,
      color: 'indigo',
    },
    {
      label: 'Referrals',
      value: summary?.totalReferrals?.toLocaleString(),
      icon: Ambulance,
      color: 'orange',
    },
    {
      label: 'Sync Success Rate',
      value: summary ? `${summary.syncSuccessRate}%` : '\u2014',
      icon: Activity,
      color: summary?.syncSuccessRate >= 80 ? 'green' : 'yellow',
    },
    {
      label: 'Pending Syncs',
      value: summary?.pendingSyncs?.toLocaleString(),
      icon: Clock,
      color: summary?.pendingSyncs > 0 ? 'yellow' : 'green',
    },
    {
      label: 'Failed Syncs',
      value: summary?.failedSyncs?.toLocaleString(),
      icon: AlertTriangle,
      color: summary?.failedSyncs > 0 ? 'red' : 'green',
    },
    {
      label: 'Visits This Month',
      value: summary?.activeVisitsThisMonth?.toLocaleString(),
      icon: CalendarCheck,
      color: 'green',
    },
  ];

  const patientBreakdown = patientStats?.byGender || [];
  const malePatients = patientBreakdown.find((g) => g.gender === 'Male');
  const femalePatients = patientBreakdown.find((g) => g.gender === 'Female');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Dashboard</h1>
          <p className="text-blue-500 text-sm mt-1">
            CHWS Integration Overview \u2014 eCHIS & OpenMRS
          </p>
        </div>
        <button onClick={refresh} className="btn-primary text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-6">
          <h3 className="text-sm font-bold text-primary-700 mb-3">Patient Demographics</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {femalePatients ? parseInt(femalePatients.count) : 0}
              </p>
              <p className="text-xs text-blue-500">Female</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">
                {malePatients ? parseInt(malePatients.count) : 0}
              </p>
              <p className="text-xs text-blue-500">Male</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-800">
                {patientStats?.total || 0}
              </p>
              <p className="text-xs text-blue-500">Total</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-primary-700 mb-3">Age Distribution</h3>
          <div className="grid grid-cols-3 gap-2">
            {(patientStats?.byAgeGroup || []).map((group) => (
              <div key={group.age_group} className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-primary-800">{parseInt(group.count)}</p>
                <p className="text-xs text-blue-500 capitalize">
                  {group.age_group.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary-700">Recent Referrals</h3>
          {hasRole('admin', 'manager', 'chw') && (
            <button onClick={() => setShowReferralModal(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-1" />
              New Referral
            </button>
          )}
        </div>
        {referrals.length === 0 ? (
          <p className="text-gray-500 text-sm">No referrals yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50">
                  <th className="text-left px-4 py-2 text-blue-700 font-medium">Patient</th>
                  <th className="text-left px-4 py-2 text-blue-700 font-medium">Referred To</th>
                  <th className="text-left px-4 py-2 text-blue-700 font-medium">Reason</th>
                  <th className="text-left px-4 py-2 text-blue-700 font-medium">CHW</th>
                  <th className="text-left px-4 py-2 text-blue-700 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{r.patient_name}</td>
                    <td className="px-4 py-2 text-gray-600">{r.details?.referred_to || '\u2014'}</td>
                    <td className="px-4 py-2 text-gray-600">{r.details?.reason || '\u2014'}</td>
                    <td className="px-4 py-2 text-gray-600">{r.chw_name}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {new Date(r.encounter_datetime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary-700">Patient Portal</h3>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">New</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Patients can securely access their health records via phone OTP authentication.
          Share the portal link with patients.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/patient-portal"
            target="_blank"
            className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Smartphone className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-primary-700">Open Portal</p>
              <p className="text-xs text-primary-500">Patient login page</p>
            </div>
          </a>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Send className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Send OTP</p>
              <p className="text-xs text-gray-400">From patient's profile page</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">OTP Auth</p>
              <p className="text-xs text-gray-400">6-digit code, 5 min expiry</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <SyncStatusPanel data={syncStatus} onRefresh={refresh} />
      </div>

      <CHWActivityChart data={chwActivity} />

      <SystemHealthPanel data={health} />

      {showReferralModal && (
        <ReferralModal
          onClose={() => setShowReferralModal(false)}
          onSuccess={() => { setShowReferralModal(false); refresh(); }}
        />
      )}
    </div>
  );
}

function ReferralModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    patientId: '',
    patientSearch: '',
    reason: '',
    referredTo: '',
    location: '',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const searchPatients = async (q) => {
    if (!q || q.length < 2) return;
    setSearching(true);
    try {
      const { default: mod } = await import('../services/api');
      const data = await mod.patientsAPI.list({ search: q, limit: 10 });
      setPatients(data.data || []);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.reason.trim()) {
      toast.error('Please enter a reason for referral');
      return;
    }
    if (!form.referredTo.trim()) {
      toast.error('Please enter the facility to refer to');
      return;
    }
    setLoading(true);
    try {
      await referralsAPI.create({
        patientId: selectedPatient.id,
        reason: form.reason,
        referredTo: form.referredTo,
        location: form.location,
        notes: form.notes,
      });
      toast.success('Referral created successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">New Referral</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-blue-800">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </span>
                <button type="button" onClick={() => { setSelectedPatient(null); setPatients([]); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                  Change
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={form.patientSearch}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, patientSearch: e.target.value }));
                    searchPatients(e.target.value);
                  }}
                  className="input"
                  placeholder="Search patient by name..."
                />
                {searching && <Loader2 className="w-4 h-4 animate-spin text-primary-600 mt-1" />}
                {patients.length > 0 && (
                  <ul className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {patients.map((p) => (
                      <li
                        key={p.id}
                        className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        onClick={() => { setSelectedPatient(p); setForm((prev) => ({ ...prev, patientSearch: '' })); setPatients([]); }}
                      >
                        {p.first_name} {p.last_name} {p.national_id ? `(${p.national_id})` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referred To (Facility) *</label>
            <input type="text" name="referredTo" value={form.referredTo} onChange={(e) => setForm((p) => ({ ...p, referredTo: e.target.value }))} className="input" placeholder="e.g. Kisumu County Hospital" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral *</label>
            <textarea name="reason" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} className="input" rows="2" placeholder="Describe the reason..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="input" placeholder="Village or facility location" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea name="notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="input" rows="2" placeholder="Any additional information..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
