import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { patientsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { SUB_COUNTIES, WARDS, VILLAGES } from '../data/kenya-regions';

const COUNTIES = Object.keys(SUB_COUNTIES);

export default function AddPatientModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    nationalId: '',
    county: '',
    subCounty: '',
    village: '',
    ward: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'county' ? { subCounty: '', village: '', ward: '' } : {}),
      ...(name === 'subCounty' ? { village: '', ward: '' } : {}),
      ...(name === 'village' ? { ward: '' } : {}),
    }));
  };

  const subCounties = form.county ? SUB_COUNTIES[form.county] : [];
  const villages = form.subCounty ? VILLAGES[form.subCounty] : [];
  const wards = form.subCounty ? WARDS[form.subCounty] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, dateOfBirth, gender, phone, nationalId } = form;
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      toast.error('First name, last name, date of birth, and gender are required');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Name fields cannot be empty');
      return;
    }
    if (phone && !/^\+?[\d\s-]{6,15}$/.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await patientsAPI.create(form);
      toast.success('Patient registered successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Register New Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input" placeholder="Kamau" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+254..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
            <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange} className="input" placeholder="National ID number" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
              <select name="county" value={form.county} onChange={handleChange} className="input">
                <option value="">Select County</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
              <select name="subCounty" value={form.subCounty} onChange={handleChange} className="input" disabled={!form.county}>
                <option value="">Select Sub-County</option>
                {subCounties.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <select name="village" value={form.village} onChange={handleChange} className="input" disabled={!form.subCounty}>
                <option value="">Select Village</option>
                {villages.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
              <select name="ward" value={form.ward} onChange={handleChange} className="input" disabled={!form.subCounty}>
                <option value="">Select Ward</option>
                {wards.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
