import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { BarChart3, Loader2, RefreshCw, Download } from 'lucide-react';
import { dashboardAPI } from '../services/api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [patientStats, setPatientStats] = useState(null);
  const [chwActivity, setChwActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, ca] = await Promise.all([
        dashboardAPI.patientStats(),
        dashboardAPI.chwActivity(),
      ]);
      setPatientStats(ps);
      setChwActivity(ca);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ageData = (patientStats?.byAgeGroup || []).map((g) => ({
    name: g.age_group.replace(/_/g, ' '),
    value: parseInt(g.count),
  }));

  const genderData = (patientStats?.byGender || []).map((g) => ({
    name: g.gender,
    value: parseInt(g.count),
  }));

  const activityByType = (chwActivity?.byType || []).map((item) => ({
    name: item.activity_type.replace(/_/g, ' '),
    count: parseInt(item.count),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">Population health and CHW performance data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {ageData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {genderData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">CHW Activities by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {(patientStats?.byVillage || []).slice(0, 8).map((v) => {
              const maxCount = Math.max(...(patientStats?.byVillage || []).map((x) => parseInt(x.count)));
              const pct = (parseInt(v.count) / maxCount) * 100;
              return (
                <div key={v.village}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{v.village}</span>
                    <span className="text-gray-500">{v.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
