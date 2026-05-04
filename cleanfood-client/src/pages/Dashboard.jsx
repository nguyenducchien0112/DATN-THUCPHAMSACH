import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import api from '../lib/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalStock: 0,
    chartData: [],
    orderDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data || {});
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Tổng Doanh thu',
      value: `${(stats.totalRevenue || 0).toLocaleString()} d`,
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      title: 'Đơn hàng mới',
      value: stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'Khách hàng',
      value: stats.totalCustomers || 0,
      icon: Users,
      color: 'indigo'
    },
    {
      title: 'Hàng hiện có',
      value: (stats.totalStock || 0).toLocaleString(),
      icon: Package,
      color: 'amber'
    }
  ];
  const formatMoney = (value) => `${Number(value || 0).toLocaleString()} d`;
  const selectedRevenue = Number((stats.revenueByDate && stats.revenueByDate[selectedDate]) || 0);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{card.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-base font-bold text-slate-800">Biểu đồ doanh thu</h4>
              <p className="text-slate-400 text-sm">Chi tiết đơn đã giao thành công</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white cursor-pointer">
                <Calendar className="w-3.5 h-3.5" />
                <span>Chọn ngày</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent outline-none"
                />
              </label>
            </div>
          </div>
          <div className="mb-4 text-sm font-semibold text-slate-600">
            Doanh thu ngày <span className="text-slate-800">{selectedDate}</span>:{" "}
            <span className="text-emerald-600 font-black">{formatMoney(selectedRevenue)}</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <h4 className="text-base font-bold text-slate-800 mb-6">Phân bố đơn hàng</h4>
          <div className="h-[26rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.orderDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={46} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-medium">Chỉ hiển thị cột đơn hàng thành công và đơn hàng đã hủy.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
