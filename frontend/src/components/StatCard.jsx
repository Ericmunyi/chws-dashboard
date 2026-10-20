export default function StatCard({ label, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-primary-50 text-primary-600',
    yellow: 'bg-primary-50 text-primary-600',
    red: 'bg-primary-50 text-primary-600',
    purple: 'bg-primary-50 text-primary-600',
    indigo: 'bg-primary-50 text-primary-600',
    orange: 'bg-primary-50 text-primary-600',
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
        <div className={`mt-3 text-xs font-medium text-primary-700`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
