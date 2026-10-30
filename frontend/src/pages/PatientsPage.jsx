import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddPatientModal from '../components/AddPatientModal';
import ReferPatientModal from '../components/ReferPatientModal';

export default function PatientsPage() {
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [referPatient, setReferPatient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientsAPI.list({ page, limit: 20, search });
      setPatients(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Delete patient ${patient.first_name} ${patient.last_name}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(patient.id);
    try {
      await patientsAPI.remove(patient.id);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete patient');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm">Manage registered patients</p>
        </div>
        {hasRole('admin', 'manager', 'chw') && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, record no., ID, or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No patients found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Record No.</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">National ID</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Gender</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Village</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">CHW</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Created</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-3 font-mono text-xs text-primary-700">
                      {p.record_number || '—'}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.national_id || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`badge-${p.gender === 'Female' ? 'warning' : 'info'}`}>
                        {p.gender}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.village || '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{p.assigned_chw_name || 'Unassigned'}</td>
                    <td className="px-6 py-3">
                      <span className={`badge-${p.status === 'active' ? 'success' : 'danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {hasRole('admin', 'manager', 'chw') && (
                          <button
                            onClick={() => setReferPatient(p)}
                            className="btn-secondary text-xs"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Refer
                          </button>
                        )}
                        {hasRole('admin', 'manager') && (
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="btn-secondary text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingId === p.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary text-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchPatients(); }}
        />
      )}

      {referPatient && (
        <ReferPatientModal
          patient={referPatient}
          onClose={() => setReferPatient(null)}
          onSuccess={() => { setReferPatient(null); toast.success('Referral submitted'); }}
        />
      )}
    </div>
  );
}
