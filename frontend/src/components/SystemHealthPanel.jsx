import { Server, Database, Wifi, WifiOff, Clock, Activity } from 'lucide-react';

export default function SystemHealthPanel({ data }) {
  if (!data) return null;

  const { echis, openmrs, database } = data;

  const systems = [
    {
      name: 'eCHIS API',
      icon: Server,
      status: echis.status,
      lastConnected: echis.lastConnected,
      recentActivity: echis.recentActivity,
      recentFailures: echis.recentFailures,
    },
    {
      name: 'OpenMRS FHIR',
      icon: Database,
      status: openmrs.status,
      lastConnected: openmrs.lastConnected,
      recentActivity: openmrs.recentActivity,
      recentFailures: openmrs.recentFailures,
    },
    {
      name: 'Database',
      icon: Server,
      status: database.status,
      lastConnected: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {systems.map((system) => (
        <div key={system.name} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <system.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{system.name}</span>
            </div>
            {system.status === 'connected' ? (
              <span className="badge-success gap-1">
                <Wifi className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="badge-danger gap-1">
                <WifiOff className="w-3 h-3" />
                {system.status === 'disconnected' ? 'Disconnected' : 'Unknown'}
              </span>
            )}
          </div>
          {system.lastConnected && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Last: {new Date(system.lastConnected).toLocaleString()}
            </div>
          )}
          {system.recentActivity !== undefined && (
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <Activity className="w-3 h-3" />
                {system.recentActivity} ops
              </span>
              {system.recentFailures > 0 && (
                <span className="text-danger-600 font-medium">
                  {system.recentFailures} failed
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
