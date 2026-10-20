import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { referralsAPI, patientsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ReferPatientModal({ patient, onClose, onSuccess }) {
  const [selectedPatient, setSelectedPatient] = useState(patient || null);
  const [form, setForm] = useState({
    reason: '',
    referredTo: '',
    referredToCustom: '',
    location: '',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [useCustomFacility, setUseCustomFacility] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setFacilitiesLoading(true);
    try {
      const data = await referralsAPI.facilities();
      setFacilities(data.data || []);
    } catch {
      setFacilities([]);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchPatients = async (q) => {
    if (!q || q.length < 2) return;
    setSearching(true);
    try {
      const data = await patientsAPI.list({ search: q, limit: 10 });
      setPatients(data.data || []);
    } finally {
      setSearching(false);
    }
  };

  const getReferredToValue = () => {
    if (useCustomFacility) return form.referredToCustom;
    return form.referredTo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.reason) {
      toast.error('Please select a reason for referral');
      return;
    }
    const referredTo = getReferredToValue();
    if (!referredTo) {
      toast.error('Please select or enter a referral facility');
      return;
    }
    setLoading(true);
    try {
      await referralsAPI.create({
        patientId: selectedPatient.id,
        reason: form.reason,
        referredTo,
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

  const groupedFacilities = facilities.reduce((acc, f) => {
    if (!acc[f.county]) acc[f.county] = [];
    acc[f.county].push(f);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedPatient ? `Refer Patient — ${selectedPatient.first_name} ${selectedPatient.last_name}` : 'New Referral'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!patient && (
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
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
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
                          onClick={() => { setSelectedPatient(p); setPatientSearch(''); setPatients([]); }}
                        >
                          {p.first_name} {p.last_name} {p.national_id ? `(${p.national_id})` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral *</label>
            <select name="reason" value={form.reason} onChange={handleChange} className="input">
              <option value="">Select reason...</option>
              <option value="specialist_review">Specialist Review</option>
              <option value="laboratory_investigation">Laboratory Investigation</option>
              <option value="imaging">Imaging (X-ray, Ultrasound, etc.)</option>
              <option value="hospital_admission">Hospital Admission</option>
              <option value="maternal_health">Maternal Health</option>
              <option value="child_health">Child Health / Immunization</option>
              <option value="mental_health">Mental Health</option>
              <option value="chronic_disease">Chronic Disease Management</option>
              <option value="dental_treatment">Dental Treatment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Referred To *</label>
              <button
                type="button"
                onClick={() => setUseCustomFacility(!useCustomFacility)}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                {useCustomFacility ? 'Pick from list' : 'Custom facility'}
              </button>
            </div>
            {useCustomFacility ? (
              <input
                type="text"
                name="referredToCustom"
                value={form.referredToCustom}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Kisumu County Referral Hospital"
              />
            ) : (
              <select
                name="referredTo"
                value={form.referredTo}
                onChange={handleChange}
                className="input"
                disabled={facilitiesLoading}
              >
                <option value="">
                  {facilitiesLoading ? 'Loading facilities...' : 'Select a facility...'}
                </option>
                {Object.keys(groupedFacilities).map((county) => (
                  <optgroup key={county} label={county}>
                    {groupedFacilities[county].map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input"
              placeholder="Patient's village or location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
