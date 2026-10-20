import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, CalendarDays, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsAPI, patientsAPI, referralsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  scheduled: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
  no_show: 'badge-warning',
};

function ScheduleModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    patientId: '',
    facilityId: user?.facilityId || '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list({ limit: 200 }).then((r) => setPatients(r.data)).catch(() => {});
    referralsAPI.facilities({}).then((r) => setFacilities(r.data)).catch(() => {});
  }, []);

  const slotFacilityId = form.facilityId;

  useEffect(() => {
    if (slotFacilityId && form.appointmentDate) {
      setSlotsLoading(true);
      appointmentsAPI.availableSlots({ facilityId: slotFacilityId, date: form.appointmentDate })
        .then((r) => {
          setAvailableSlots(r.data);
          setForm((prev) => ({ ...prev, appointmentTime: '' }));
        })
        .catch(() => setAvailableSlots([]))
        .finally(() => setSlotsLoading(false));
    } else {
      setAvailableSlots([]);
    }
  }, [slotFacilityId, form.appointmentDate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.facilityId || !form.appointmentDate || !form.appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await appointmentsAPI.create(form);
      toast.success('Appointment scheduled successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Appointment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select name="patientId" value={form.patientId} onChange={handleChange} className="input">
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.national_id ? `(${p.national_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Facility *</label>
            <select name="facilityId" value={form.facilityId} onChange={handleChange} className="input" disabled={!!user?.facilityId}>
              {!user?.facilityId && <option value="">Select facility...</option>}
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.county}{user?.facilityId === f.id ? ' (your facility)' : ''}
                </option>
              ))}
            </select>
            {user?.facilityId && (
              <p className="text-xs text-gray-500 mt-1">You can only schedule at your assigned facility</p>
            )}
          </div>

          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="label">Time Slot *</label>
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading available slots...
              </div>
            ) : form.facilityId && form.appointmentDate ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.length === 0 ? (
                  <p className="col-span-4 text-sm text-gray-500 py-2">No slots available for this date</p>
                ) : (
                  availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, appointmentTime: slot }))}
                      className={`text-sm py-2 px-3 rounded-lg border transition-colors ${
                        form.appointmentTime === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Select a facility and date first</p>
            )}
          </div>

          <div>
            <label className="label">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="input"
              rows={2}
              placeholder="Reason for appointment..."
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { hasRole, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      if (user?.facilityId) params.facilityId = user.facilityId;
      const data = await appointmentsAPI.list(params);
      setAppointments(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFilter, statusFilter, user?.facilityId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentsAPI.update(id, { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm">Schedule and manage patient appointments</p>
        </div>
        {hasRole('admin', 'manager') && (
          <button onClick={() => setShowScheduleModal(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input pl-10"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="input w-44"
              placeholder="Filter by date"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-40"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No appointments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Facility</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Time</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Reason</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Scheduled By</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{a.patient_name}</td>
                    <td className="px-6 py-3 text-gray-600">{a.facility_name || '—'}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(a.appointment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600">{a.appointment_time}</td>
                    <td className="px-6 py-3 text-gray-600 max-w-[200px] truncate">
                      {a.reason || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={STATUS_BADGE[a.status] || 'badge-info'}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{a.created_by_name}</td>
                    <td className="px-6 py-3">
                      {a.status === 'scheduled' && hasRole('admin', 'manager') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(a.id, 'completed')}
                            className="btn-secondary text-xs py-1 px-2"
                            title="Mark completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(a.id, 'cancelled')}
                            className="bg-danger-50 text-danger-600 hover:bg-danger-100 text-xs py-1 px-2 rounded-lg"
                            title="Cancel appointment"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => { setShowScheduleModal(false); fetchAppointments(); }}
        />
      )}
    </div>
  );
}
