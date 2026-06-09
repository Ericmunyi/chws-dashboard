export default function StatCard({ label, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value ?? '—'}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
