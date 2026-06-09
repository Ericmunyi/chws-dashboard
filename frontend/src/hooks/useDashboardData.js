import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

export function useDashboardData() {
  const [summary, setSummary] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [chwActivity, setChwActivity] = useState(null);
  const [health, setHealth] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, ss, ca, h, ps] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.syncStatus(),
        dashboardAPI.chwActivity(),
        dashboardAPI.health(),
        dashboardAPI.patientStats(),
      ]);
      setSummary(s);
      setSyncStatus(ss);
      setChwActivity(ca);
      setHealth(h);
      setPatientStats(ps);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { summary, syncStatus, chwActivity, health, patientStats, loading, error, refresh: fetchAll };
}
