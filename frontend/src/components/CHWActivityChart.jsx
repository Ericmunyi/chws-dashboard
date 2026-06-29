import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CHWActivityChart({ data }) {
  if (!data) return null;

  const { byType, byCHW } = data;

  const pieData = (byType || []).map((item) => ({
    name: item.activity_type.replace(/_/g, ' '),
    value: parseInt(item.count),
  }));

  const chwData = (byCHW || []).map((item) => ({
    name: item.chw_name,
    visits: parseInt(item.count),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-600" />
          <h4 className="text-sm font-bold text-primary-600">Activities by Type</h4>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              formatter={(value) => (
                <span className="text-xs capitalize">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-6">
        <h4 className="text-sm font-bold text-primary-600 mb-4">Visits by CHW</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chwData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip />
            <Bar dataKey="visits" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
