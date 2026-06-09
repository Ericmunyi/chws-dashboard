import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  RefreshCw, AlertTriangle, CheckCircle, Clock, ArrowUpDown, Loader2
} from 'lucide-react';
import { syncAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const STATUS_COLORS = {
  success: '#22c55e',
  failed: '#ef4444',
  pending: '#f59e0b',
  in_progress: '#3b82f6',
};

export default function SyncStatusPanel({ data, onRefresh }) {
  const { lastSyncUpdate } = useSocket();
  const [syncing, setSyncing] = useState(false);

  if (!data) {
    return (
      <div className="card p-6 text-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading sync status...
      </div>
    );
  }

  const { byDirection, byEntity, recentActivity, lastSyncTime } = data;

  const directionChart = byDirection.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.direction);
    if (existing) {
      existing[item.status] = parseInt(item.count);
    } else {
      acc.push({
        name: item.direction,
        [item.status]: parseInt(item.count),
      });
    }
    return acc;
  }, []);

  const latestActivity = recentActivity?.slice(0, 10) || [];

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncAPI.trigger();
      onRefresh?.();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">eCHIS & OpenMRS Sync Status</h3>
        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="text-xs text-gray-500">
              Last sync: {new Date(lastSyncTime).toLocaleString()}
            </span>
          )}
          {lastSyncUpdate && (
            <span className="badge-info gap-1">
              <RefreshCw className="w-3 h-3" />
              Live
            </span>
          )}
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="btn-primary text-sm"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Sync by Direction</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={directionChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" stackId="a" fill={STATUS_COLORS.success} name="Success" />
              <Bar dataKey="failed" stackId="a" fill={STATUS_COLORS.failed} name="Failed" />
              <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
              <Bar dataKey="in_progress" stackId="a" fill={STATUS_COLORS.in_progress} name="In Progress" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Sync by Entity Type</h4>
          <div className="space-y-3">
            {byEntity
              .reduce((acc, item) => {
                const existing = acc.find((a) => a.entity_type === item.entity_type);
                if (existing) {
                  existing[item.status] = parseInt(item.count);
                } else {
                  acc.push({
                    entity_type: item.entity_type,
                    [item.status]: parseInt(item.count),
                  });
                }
                return acc;
              }, [])
              .map((item) => {
                const total = (item.success || 0) + (item.failed || 0) + (item.pending || 0);
                const successRate = total > 0 ? Math.round((item.success || 0) / total * 100) : 0;
                return (
                  <div key={item.entity_type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{item.entity_type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500">{successRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-success-500 transition-all"
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {latestActivity.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="text-sm font-medium text-gray-700">Recent Sync Activity</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Entity</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Direction</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Time</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {latestActivity.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 capitalize">{item.entity_type}</td>
                    <td className="px-6 py-3 text-xs">{item.direction.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`badge-${
                          item.status === 'success'
                            ? 'success'
                            : item.status === 'failed'
                            ? 'danger'
                            : item.status === 'in_progress'
                            ? 'info'
                            : 'warning'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-danger-600 max-w-[200px] truncate">
                      {item.error_message || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
