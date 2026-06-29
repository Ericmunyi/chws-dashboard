import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

export function useDashboardData() {
  const [summary, setSummary] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [chwActivity, setChwActivity] = useState(null);
  const [health, setHealth] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, ss, ca, h, ps, r] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.syncStatus().catch(() => null),
        dashboardAPI.chwActivity(),
        dashboardAPI.health().catch(() => null),
        dashboardAPI.patientStats(),
        dashboardAPI.recentReferrals({ limit: 10 }),
      ]);
      setSummary(s);
      setSyncStatus(ss);
      setChwActivity(ca);
      setHealth(h);
      setPatientStats(ps);
      setReferrals(r);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { summary, syncStatus, chwActivity, health, patientStats, referrals, loading, error, refresh: fetchAll };
}
