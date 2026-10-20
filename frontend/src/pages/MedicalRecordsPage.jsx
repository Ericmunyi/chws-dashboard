import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, ChevronLeft, ChevronRight, Loader2, FileText, X, Pencil,
  ClipboardList, Users, CheckCircle2, SkipForward, Trash2, PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  medicalRecordsAPI, patientsAPI, departmentsAPI, queueAPI,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ENCOUNTER_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'home_visit', label: 'Home Visit' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'immunization', label: 'Immunization' },
  { value: 'prenatal', label: 'Prenatal Care' },
  { value: 'chronic_care', label: 'Chronic Care' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

const QUEUE_STATUS = {
  waiting: { label: 'Waiting', cls: 'badge-warning' },
  in_service: { label: 'In Service', cls: 'badge-info' },
  completed: { label: 'Completed', cls: 'badge-success' },
  skipped: { label: 'Skipped', cls: 'badge-danger' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
};

const QUEUE_PRIORITY = {
  emergency: { label: 'Emergency', cls: 'badge-danger' },
  urgent: { label: 'Urgent', cls: 'badge-warning' },
  normal: { label: 'Normal', cls: 'badge-info' },
};

const typeLabel = (v) =>
  ENCOUNTER_TYPES.find((t) => t.value === v)?.label || v;

const SYNC_BADGE = {
  success: 'badge-success',
  pending: 'badge-warning',
  failed: 'badge-danger',
  in_progress: 'badge-info',
  conflict: 'badge-danger',
};

const toLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function RecordModal({ record, onClose, onSuccess }) {
  const isEdit = !!record;
  const [form, setForm] = useState({
    patientId: record?.patient_id || '',
    encounterType: record?.encounter_type || '',
    encounterDatetime: toLocalInput(record?.encounter_datetime) || toLocalInput(new Date()),
    location: record?.location || '',
    departmentId: record?.department_id || '',
    observations: record?.observations || '',
  });
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list({ limit: 200 }).then((r) => setPatients(r.data)).catch(() => {});
    departmentsAPI.list().then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.encounterType || !form.encounterDatetime) {
      toast.error('Patient, encounter type, and date/time are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        patientId: form.patientId,
        encounterType: form.encounterType,
        encounterDatetime: new Date(form.encounterDatetime).toISOString(),
        location: form.location,
        departmentId: form.departmentId || null,
        observations: form.observations,
      };
      if (isEdit) {
        await medicalRecordsAPI.update(record.id, payload);
        toast.success('Medical record updated');
      } else {
        await medicalRecordsAPI.create(payload);
        toast.success('Medical record created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Medical Record' : 'New Medical Record'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              className="input"
              disabled={isEdit}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.national_id ? `(${p.national_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Department</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="input">
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Encounter Type *</label>
            <select name="encounterType" value={form.encounterType} onChange={handleChange} className="input">
              <option value="">Select type...</option>
              {ENCOUNTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date & Time *</label>
            <input
              type="datetime-local"
              name="encounterDatetime"
              value={form.encounterDatetime}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input"
              placeholder="Facility / village / home"
            />
          </div>

          <div>
            <label className="label">Clinical Notes / Observations</label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              className="input"
              rows={4}
              placeholder="Symptoms, vitals, diagnosis, treatment..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isEdit ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnqueueModal({ department, onClose, onSuccess }) {
  const [form, setForm] = useState({ patientId: '', priority: 'normal', reason: '', notes: '' });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsAPI.list({ limit: 200 }).then((r) => setPatients(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) {
      toast.error('Select a patient to queue');
      return;
    }
    setLoading(true);
    try {
      await queueAPI.enqueue({
        patientId: form.patientId,
        departmentId: department.id,
        priority: form.priority,
        reason: form.reason,
        notes: form.notes,
      });
      toast.success(`Patient added to ${department.name} queue`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to queue patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add Patient to Queue</h2>
            <p className="text-sm text-gray-500">{department.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select
              value={form.patientId}
              onChange={(e) => setForm((p) => ({ ...p, patientId: e.target.value }))}
              className="input"
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.national_id ? `(${p.national_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              className="input"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="label">Reason for visit</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className="input"
              placeholder="e.g. Fever, follow-up, antenatal visit..."
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="input"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add to Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QueueView() {
  const { hasRole } = useAuth();
  const { socket } = useSocket();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [showEnqueue, setShowEnqueue] = useState(false);
  const [calling, setCalling] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentsAPI.list();
      setDepartments(data.data);
      setSelectedDept((prev) => prev || data.data[0]?.id || null);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!selectedDept) {
      setEntries([]);
      return;
    }
    setQueueLoading(true);
    try {
      const data = await queueAPI.list({ departmentId: selectedDept, date: todayStr(), limit: 200 });
      setEntries(data.data);
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setQueueLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDepartments();
      fetchQueue();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDepartments, fetchQueue]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => {
      fetchDepartments();
      fetchQueue();
    };
    socket.on('queue:update', onUpdate);
    return () => socket.off('queue:update', onUpdate);
  }, [socket, fetchDepartments, fetchQueue]);

  const department = departments.find((d) => d.id === selectedDept);
  const canManage = hasRole('admin', 'manager', 'chw');

  const handleStatus = async (entry, status) => {
    try {
      await queueAPI.update(entry.id, { status });
      fetchDepartments();
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update queue entry');
    }
  };

  const handleRemove = async (entry) => {
    try {
      await queueAPI.remove(entry.id);
      toast.success('Patient removed from queue');
      fetchDepartments();
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove patient');
    }
  };

  const handleCallNext = async () => {
    setCalling(true);
    try {
      const entry = await queueAPI.callNext({ departmentId: selectedDept });
      toast.success(`Now serving: ${entry.patient_name}`);
      fetchDepartments();
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error || 'No patients waiting');
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading departments...</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-500">
        <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        No departments available. Run the department seed to get started.
      </div>
    );
  }

  const inService = entries.filter((e) => e.status === 'in_service');
  const waiting = entries.filter((e) => e.status === 'waiting');
  const others = entries.filter((e) => !['in_service', 'waiting'].includes(e.status));

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDept(d.id)}
            className={`card p-4 text-left transition ${
              selectedDept === d.id
                ? 'ring-2 ring-primary-600 border-primary-600'
                : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {d.code}
              </span>
              <span className="text-lg font-bold text-gray-900">{d.waitingToday}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">{d.name}</p>
            <p className="text-xs text-gray-400 mt-1">{d.queuedToday} queued today</p>
          </button>
        ))}
      </div>

      {department && (
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">{department.name}</h2>
              <p className="text-sm text-gray-500">
                {waiting.length} waiting · {inService.length} in service · {new Date().toLocaleDateString()}
              </p>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEnqueue(true)}
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1 inline" />
                  Add Patient
                </button>
                <button
                  onClick={handleCallNext}
                  disabled={calling || waiting.length === 0 || inService.length > 0}
                  className="btn-primary text-sm disabled:opacity-50"
                  title={inService.length > 0 ? 'Finish the current patient first' : 'Call the next patient'}
                >
                  <PlayCircle className="w-4 h-4 mr-1 inline" />
                  Call Next
                </button>
              </div>
            )}
          </div>

          {queueLoading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No patients in this queue today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-gray-500 font-medium w-16">#</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Reason</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Priority</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Queued at</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...inService, ...waiting, ...others].map((e) => {
                    const status = QUEUE_STATUS[e.status] || { label: e.status, cls: 'badge-info' };
                    const priority = QUEUE_PRIORITY[e.priority] || QUEUE_PRIORITY.normal;
                    return (
                      <tr
                        key={e.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 ${
                          e.status === 'in_service' ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <td className="px-6 py-3 font-bold text-gray-900">{e.queue_number}</td>
                        <td className="px-6 py-3 font-medium">
                          {e.patient_name}
                          <span className="block text-xs text-gray-400 font-normal">
                            {e.patient_village || ''}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{e.reason || '—'}</td>
                        <td className="px-6 py-3">
                          <span className={priority.cls}>{priority.label}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={status.cls}>{status.label}</span>
                        </td>
                        <td className="px-6 py-3 text-gray-600 text-xs">
                          {e.queued_at ? new Date(e.queued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-3">
                          {canManage && (
                            <div className="flex gap-1">
                              {e.status === 'waiting' && (
                                <>
                                  <button
                                    onClick={() => handleStatus(e, 'in_service')}
                                    className="btn-secondary text-xs py-1 px-2"
                                    title="Start serving"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatus(e, 'skipped')}
                                    className="btn-secondary text-xs py-1 px-2"
                                    title="Skip patient"
                                  >
                                    <SkipForward className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {e.status === 'in_service' && (
                                <button
                                  onClick={() => handleStatus(e, 'completed')}
                                  className="btn-secondary text-xs py-1 px-2"
                                  title="Mark completed"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {['waiting', 'in_service', 'skipped'].includes(e.status) && (
                                <button
                                  onClick={() => handleRemove(e)}
                                  className="btn-secondary text-xs py-1 px-2 text-red-600"
                                  title="Remove from queue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showEnqueue && department && (
        <EnqueueModal
          department={department}
          onClose={() => setShowEnqueue(false)}
          onSuccess={() => {
            setShowEnqueue(false);
            fetchDepartments();
            fetchQueue();
          }}
        />
      )}
    </div>
  );
}

export default function MedicalRecordsPage() {
  const { hasRole } = useAuth();
  const [view, setView] = useState('records');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    departmentsAPI.list().then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter) params.encounterType = typeFilter;
      if (deptFilter) params.departmentId = deptFilter;
      if (fromFilter) params.from = new Date(fromFilter).toISOString();
      if (toFilter) params.to = new Date(`${toFilter}T23:59:59`).toISOString();
      const data = await medicalRecordsAPI.list(params);
      setRecords(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, deptFilter, fromFilter, toFilter]);

  useEffect(() => {
    if (view === 'records') fetchRecords();
  }, [fetchRecords, view]);

  const filtered = search
    ? records.filter((r) =>
        (r.patient_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : records;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 text-sm">Clinical encounters, departments and patient queues</p>
        </div>
        {view === 'records' && hasRole('admin', 'manager', 'chw') && (
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setView('records')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            view === 'records' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 mr-2 inline" />
          Records
        </button>
        <button
          onClick={() => setView('queues')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            view === 'queues' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="w-4 h-4 mr-2 inline" />
          Department Queues
        </button>
      </div>

      {view === 'queues' ? (
        <QueueView />
      ) : (
        <div className="card mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                className="input w-48"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="input w-44"
              >
                <option value="">All types</option>
                {ENCOUNTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="date"
                value={fromFilter}
                onChange={(e) => { setFromFilter(e.target.value); setPage(1); }}
                className="input w-40"
                title="From date"
              />
              <input
                type="date"
                value={toFilter}
                onChange={(e) => { setToFilter(e.target.value); setPage(1); }}
                className="input w-40"
                title="To date"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading medical records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No medical records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Department</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Location</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Notes</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">CHW</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Sync</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{r.patient_name}</td>
                      <td className="px-6 py-3">
                        {r.department_name ? (
                          <span className="badge-info" title={r.department_name}>
                            {r.department_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="badge-info">{typeLabel(r.encounter_type)}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(r.encounter_datetime).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{r.location || '—'}</td>
                      <td className="px-6 py-3 text-gray-600 max-w-[220px] truncate" title={r.observations || ''}>
                        {r.observations || '—'}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{r.chw_name || '—'}</td>
                      <td className="px-6 py-3">
                        <span className={SYNC_BADGE[r.sync_status] || 'badge-info'}>
                          {r.sync_status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {hasRole('admin', 'manager', 'chw') && (
                          <button
                            onClick={() => { setEditing(r); setShowModal(true); }}
                            className="btn-secondary text-xs py-1 px-2"
                            title="Edit record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
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
      )}

      {showModal && (
        <RecordModal
          record={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchRecords(); }}
        />
      )}
    </div>
  );
}
