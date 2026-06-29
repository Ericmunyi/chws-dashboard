import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { householdsAPI, patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function HouseholdsPage() {
  const { hasRole } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await householdsAPI.list({ page, limit: 20, search });
      setHouseholds(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Households</h1>
          <p className="text-gray-500 text-sm">Manage registered households</p>
        </div>
        {hasRole('admin', 'manager', 'chw') && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Household
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by head name, phone, or village..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading households...</p>
          </div>
        ) : households.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No households found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Head Name</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Phone</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Village</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Members</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">CHW</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {households.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{h.head_name}</td>
                    <td className="px-6 py-3 text-gray-600">{h.head_phone || '\u2014'}</td>
                    <td className="px-6 py-3 text-gray-600">{h.village || '\u2014'}</td>
                    <td className="px-6 py-3">{h.member_count || 0}</td>
                    <td className="px-6 py-3 text-gray-600">{h.assigned_chw_name || 'Unassigned'}</td>
                    <td className="px-6 py-3">
                      <span className={`badge-${h.status === 'active' ? 'success' : 'danger'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(h.created_at).toLocaleDateString()}
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
        <AddHouseholdModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchHouseholds(); }}
        />
      )}
    </div>
  );
}

const SUB_COUNTIES = {
  'UASIN GISHU': ['Soy', 'Turbo', 'Moiben', 'Ainabkoi', 'Kapseret', 'Kesses'],
  'BUSIA': ['Busia Township', 'Matayos', 'Butula', 'Nambale', 'Samia', 'Funyula', 'Teso North', 'Teso South'],
  'EMBU': ['Manyatta', 'Runyenjes', 'Mbeere South', 'Mbeere North'],
};

const VILLAGES = {
  'Soy': ['Kimuri', 'Kipsomba', 'Koibarak', 'Sosiani', 'Chebisaas'],
  'Turbo': ['Kamagut', 'Ngenyilel', 'Sosiani', 'Tapsagoi', 'Kipsomba'],
  'Moiben': ['Karuna', 'Kimumu', 'Moiben', 'Segero', 'Tembelio'],
  'Ainabkoi': ['Ainabkoi', 'Kaptagat', 'Kipkabus', 'Cheplasko', 'Nerkwo'],
  'Kapseret': ['Kapseret', 'Langas', 'Kambiusi', 'Moi\'s Bridge', 'Olare'],
  'Kesses': ['Kesses', 'Ngeria', 'Simat', 'Chepkoilel', 'Kapyemit'],
  'Busia Township': ['Busia Town', 'Mujengo', 'Odiado', 'Malaba', 'Kocholia'],
  'Matayos': ['Matayos', 'Burumba', 'Kisoko', 'Mungatsi', 'Bumalimba'],
  'Butula': ['Butula', 'Mundika', 'Bumutiru', 'Nambia', 'Buduta'],
  'Nambale': ['Nambale', 'Nangina', 'Bukati', 'Mashitsi', 'Bwaliro'],
  'Samia': ['Nangwe', 'Lwang\'ni', 'Bwirege', 'Budongo', 'Rwambwa'],
  'Funyula': ['Funyula', 'Siginga', 'Bunyala', 'Port Victoria', 'Ochinga'],
  'Teso North': ['Malaba', 'Omoding', 'Akoroi', 'Kamolo', 'Osia'],
  'Teso South': ['Amagoro', 'Angurai', 'Chakol', 'Kocholia', 'Ojolais'],
  'Manyatta': ['Manyatta', 'Njukiri', 'Kithimu', 'Ngandori', 'Karuari'],
  'Runyenjes': ['Runyenjes', 'Kagaari', 'Gaturi', 'Kigumo', 'Mbeti'],
  'Mbeere South': ['Kiritiri', 'Mwea', 'Gachoka', 'Nthawa', 'Makima'],
  'Mbeere North': ['Siakago', 'Ishiara', 'Muminji', 'Evurore', 'Ndagoni'],
};

const WARDS = {
  'Soy': ['Moi\'s Bridge', 'Ziwa', 'Kipsomba', 'Segero/Barsombe', 'Kapkures', 'Sosiani'],
  'Turbo': ['Kamagut', 'Ngenyilel', 'Tapsagoi', 'Kiborgok', 'Kipsomai', 'Tuiyobei'],
  'Moiben': ['Karuna', 'Kimumu', 'Moiben', 'Tembelio', 'Segero', 'Kaptagat'],
  'Ainabkoi': ['Ainabkoi', 'Kaptagat', 'Kapkures', 'Cheplasko', 'Nerkwo', 'Kipkabus'],
  'Kapseret': ['Kapseret', 'Langas', 'Kambiu', 'Moi\'s Bridge', 'Olare', 'Simat'],
  'Kesses': ['Kesses', 'Ngeria', 'Simat', 'Chepkoilel', 'Kapyemit', 'Tarakwa'],
  'Busia Township': ['Busia Town', 'Mujengo', 'Odiado', 'Malaba', 'Kocholia'],
  'Matayos': ['Matayos', 'Burumba', 'Kisoko', 'Mungatsi', 'Bumalimba'],
  'Butula': ['Butula', 'Mundika', 'Bumutiru', 'Nambia', 'Buduta'],
  'Nambale': ['Nambale', 'Nangina', 'Bukati', 'Mashitsi', 'Bwaliro'],
  'Samia': ['Nangwe', 'Lwang\'ni', 'Bwirege', 'Budongo', 'Rwambwa'],
  'Funyula': ['Funyula', 'Siginga', 'Bunyala', 'Port Victoria', 'Ochinga'],
  'Teso North': ['Malaba', 'Omoding', 'Akoroi', 'Kamolo', 'Osia'],
  'Teso South': ['Amagoro', 'Angurai', 'Chakol', 'Kocholia', 'Ojolais'],
  'Manyatta': ['Manyatta', 'Njukiri', 'Kithimu', 'Ngandori', 'Karuari', 'Ruguri'],
  'Runyenjes': ['Runyenjes', 'Kagaari', 'Gaturi', 'Kigumo', 'Mbeti', 'Gitarene'],
  'Mbeere South': ['Kiritiri', 'Mwea', 'Gachoka', 'Nthawa', 'Makima', 'Mavuria'],
  'Mbeere North': ['Siakago', 'Ishiara', 'Muminji', 'Evurore', 'Ndagoni', 'Riandu'],
};

function AddHouseholdModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    headName: '',
    headPhone: '',
    village: '',
    ward: '',
    subCounty: '',
    county: '',
    memberCount: 0,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.headName.trim()) {
      toast.error('Head name is required');
      return;
    }
    setLoading(true);
    try {
      await householdsAPI.create({
        ...form,
        memberCount: parseInt(form.memberCount) || 0,
      });
      toast.success('Household added successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add household');
    } finally {
      setLoading(false);
    }
  };

  const subCounties = form.county ? SUB_COUNTIES[form.county] : [];
  const villages = form.subCounty ? VILLAGES[form.subCounty] : [];
  const wards = form.subCounty ? WARDS[form.subCounty] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add New Household</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Head of Household Name *</label>
              <input type="text" name="headName" value={form.headName} onChange={handleChange} className="input" placeholder="Full name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="headPhone" value={form.headPhone} onChange={handleChange} className="input" placeholder="+254..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Count</label>
              <input type="number" name="memberCount" value={form.memberCount} onChange={handleChange} className="input" placeholder="0" min="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
              <select name="county" value={form.county} onChange={handleChange} className="input">
                <option value="">Select county...</option>
                {Object.keys(SUB_COUNTIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-County *</label>
              <select name="subCounty" value={form.subCounty} onChange={handleChange} className="input" disabled={!form.county}>
                <option value="">Select sub-county...</option>
                {subCounties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
              <select name="village" value={form.village} onChange={handleChange} className="input" disabled={!form.subCounty}>
                <option value="">Select village...</option>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
              <select name="ward" value={form.ward} onChange={handleChange} className="input" disabled={!form.village}>
                <option value="">Select ward...</option>
                {wards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
