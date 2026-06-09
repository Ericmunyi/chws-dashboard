import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Users, Home, Activity, CalendarCheck, UserCheck,
  AlertTriangle, Clock, BarChart3, Stethoscope, Syringe
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import StatCard from '../components/StatCard';
import SyncStatusPanel from '../components/SyncStatusPanel';
import CHWActivityChart from '../components/CHWActivityChart';
import SystemHealthPanel from '../components/SystemHealthPanel';

export default function DashboardPage() {
  const {
    summary,
    syncStatus,
    chwActivity,
    health,
    patientStats,
    loading,
    error,
    refresh,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
        <p className="text-gray-900 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={refresh} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total Patients',
      value: summary?.totalPatients?.toLocaleString(),
      icon: Users,
      color: 'blue',
      subtitle: `${patientStats?.total || 0} registered`,
    },
    {
      label: 'Active Households',
      value: summary?.totalHouseholds?.toLocaleString(),
      icon: Home,
      color: 'green',
    },
    {
      label: 'Active CHWs',
      value: summary?.totalCHWs?.toLocaleString(),
      icon: UserCheck,
      color: 'purple',
    },
    {
      label: 'Encounters',
      value: summary?.totalEncounters?.toLocaleString(),
      icon: Stethoscope,
      color: 'indigo',
    },
    {
      label: 'Sync Success Rate',
      value: summary ? `${summary.syncSuccessRate}%` : '—',
      icon: Activity,
      color: summary?.syncSuccessRate >= 80 ? 'green' : 'yellow',
    },
    {
      label: 'Pending Syncs',
      value: summary?.pendingSyncs?.toLocaleString(),
      icon: Clock,
      color: summary?.pendingSyncs > 0 ? 'yellow' : 'green',
    },
    {
      label: 'Failed Syncs',
      value: summary?.failedSyncs?.toLocaleString(),
      icon: AlertTriangle,
      color: summary?.failedSyncs > 0 ? 'red' : 'green',
    },
    {
      label: 'Visits This Month',
      value: summary?.activeVisitsThisMonth?.toLocaleString(),
      icon: CalendarCheck,
      color: 'green',
    },
  ];

  const patientBreakdown = patientStats?.byGender || [];
  const malePatients = patientBreakdown.find((g) => g.gender === 'Male');
  const femalePatients = patientBreakdown.find((g) => g.gender === 'Female');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            CHWS Integration Overview — eCHIS & OpenMRS
          </p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Patient Demographics</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {femalePatients ? parseInt(femalePatients.count) : 0}
              </p>
              <p className="text-xs text-gray-500">Female</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {malePatients ? parseInt(malePatients.count) : 0}
              </p>
              <p className="text-xs text-gray-500">Male</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {patientStats?.total || 0}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Age Distribution</h3>
          <div className="grid grid-cols-3 gap-2">
            {(patientStats?.byAgeGroup || []).map((group) => (
              <div key={group.age_group} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{parseInt(group.count)}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {group.age_group.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <SyncStatusPanel data={syncStatus} onRefresh={refresh} />
      </div>

      <CHWActivityChart data={chwActivity} />

      <SystemHealthPanel data={health} />
    </div>
  );
}
