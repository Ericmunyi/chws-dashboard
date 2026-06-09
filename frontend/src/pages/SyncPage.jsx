import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock, ArrowUpDown } from 'lucide-react';
import { dashboardAPI, syncAPI } from '../services/api';
import SyncStatusPanel from '../components/SyncStatusPanel';

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSyncStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.syncStatus();
      setSyncStatus(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Sync</h1>
          <p className="text-gray-500 text-sm">
            Monitor synchronization between eCHIS and OpenMRS
          </p>
        </div>
        <button onClick={fetchSyncStatus} className="btn-secondary text-sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !syncStatus ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading sync status...</p>
        </div>
      ) : (
        <SyncStatusPanel data={syncStatus} onRefresh={fetchSyncStatus} />
      )}
    </div>
  );
}
