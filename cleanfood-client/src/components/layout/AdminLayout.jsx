import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import useAuth from '../../stores/useAuth';
import api from '../../lib/axios';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const raw = localStorage.getItem('admin_read_notification_ids');
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Danh mục', path: '/admin/categories', icon: Package },
    { name: 'Sản phẩm', path: '/admin/products', icon: Package },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Khách hàng', path: '/admin/users', icon: Users }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/admin/orders'),
          api.get('/admin/products')
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const products = Array.isArray(productsRes.data) ? productsRes.data : [];
        const today = new Date().toISOString().slice(0, 10);

        const newOrderNotis = orders
          .filter((o) => o?.status === 'PENDING')
          .slice(0, 5)
          .map((o) => ({
            id: `new-${o.id}`,
            type: 'new-order',
            message: `Đơn hàng mới #${o.id} chờ xác nhận`,
            time: o.orderDate
          }));

        const cancelledNotis = orders
          .filter((o) => o?.status === 'CANCELLED')
          .slice(0, 5)
          .map((o) => ({
            id: `cancel-${o.id}`,
            type: 'cancelled-order',
            message: `Đơn hàng #${o.id} đã bị hủy`,
            time: o.orderDate
          }));

        const expiredPromotionNotis = products
          .filter((p) => {
            const endDate = p?.promotionEndDate;
            const discount = Number(p?.discountPercent || 0);
            return endDate && endDate < today && discount > 0;
          })
          .slice(0, 5)
          .map((p) => ({
            id: `promo-${p.id}`,
            type: 'expired-promotion',
            message: `Sản phẩm ${p.name} đã hết khuyến mãi`,
            time: p.promotionEndDate
          }));

        const outOfStockNotis = products
          .filter((p) => Number(p.stockQuantity || 0) <= 0)
          .slice(0, 5)
          .map((p) => ({
            id: `oos-${p.id}`,
            type: 'out-of-stock',
            message: `Sản phẩm ${p.name} đã hết hàng`,
            time: p.updatedAt || p.createdAt || today
          }));

        setNotifications([...newOrderNotis, ...cancelledNotis, ...expiredPromotionNotis, ...outOfStockNotis]);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const visibleNotifications = notifications.filter((n) => !readIds.has(n.id));
  const sortedNotifications = useMemo(
    () =>
      [...visibleNotifications].sort((a, b) => {
        const ta = a.time ? new Date(a.time).getTime() : 0;
        const tb = b.time ? new Date(b.time).getTime() : 0;
        return tb - ta;
      }),
    [visibleNotifications]
  );

  useEffect(() => {
    localStorage.setItem('admin_read_notification_ids', JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  const markAllAsRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  };

  const markOneAsRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleNotificationClick = (n) => {
    markOneAsRead(n.id);
    if (n.type === 'expired-promotion' || n.type === 'out-of-stock') {
      navigate('/admin/products');
      return;
    }
    if (n.type === 'cancelled-order') {
      navigate('/admin/orders?status=CANCELLED');
      return;
    }
    if (n.type === 'new-order') {
      navigate('/admin/orders?status=PENDING');
      return;
    }
    navigate('/admin/orders');
  };

  const toCsvValue = (value) => {
    const raw = value == null ? '' : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  };

  const downloadCsv = (headers, rows, filename) => {
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const path = location.pathname.split('/').pop() || 'dashboard';
      let data = [];
      let filename = `bao-cao-${path}.csv`;

      if (path === 'orders' || path === 'admin' || path === 'dashboard') {
        const res = await api.get('/admin/orders');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (path === 'products') {
        const res = await api.get('/admin/products');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (path === 'categories') {
        const res = await api.get('/admin/categories');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (path === 'users') {
        const res = await api.get('/admin/users');
        data = Array.isArray(res.data) ? res.data : [];
      }

      if (data.length === 0) {
        alert('Không có dữ liệu để xuất báo cáo');
        return;
      }

      if (path === 'admin' || path === 'dashboard') {
        const completedOrders = data.filter((o) => o?.status === 'COMPLETED');
        const revenueByDay = completedOrders.reduce((acc, order) => {
          if (!order?.orderDate) return acc;
          const day = String(order.orderDate).slice(0, 10);
          acc[day] = (acc[day] || 0) + Number(order.totalAmount || 0);
          return acc;
        }, {});

        const rows = Object.entries(revenueByDay)
          .filter(([, revenue]) => Number(revenue) > 0)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([day, revenue]) => [toCsvValue(day), toCsvValue(Math.round(revenue))]);

        if (rows.length === 0) {
          alert('Không có ngày nào có doanh thu từ đơn giao thành công');
          return;
        }

        downloadCsv(['Ngày', 'Doanh Thu'], rows, 'bao-cao-doanh-thu-theo-ngay.csv');
        return;
      }

      if (path === 'orders') {
        const completedOrders = data.filter((o) => o?.status === 'COMPLETED');
        if (completedOrders.length === 0) {
          alert('Không có đơn hàng giao thành công để xuất báo cáo');
          return;
        }

        const headers = ['Mã Đơn', 'Khách Hàng', 'Ngày Đặt', 'Tổng Tiền', 'Trạng Thái'];
        const rows = completedOrders.map((order) => [
          toCsvValue(order.id),
          toCsvValue(order.customer?.fullName || order.customer?.username || ''),
          toCsvValue(order.orderDate ? String(order.orderDate).slice(0, 10) : ''),
          toCsvValue(order.totalAmount || 0),
          toCsvValue(order.status)
        ]);

        downloadCsv(headers, rows, filename);
        return;
      }

      const flatKeys = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
      const rows = data.map((item) => flatKeys.map((k) => toCsvValue(item[k])));
      downloadCsv(flatKeys, rows, filename);
    } catch (err) {
      alert('Xuất báo cáo thất bại');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div
          className="h-20 flex items-center justify-between px-6 border-b border-slate-100"
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm"
              onClick={() => window.location.reload()}
              title="Click de tai lai trang"
            >
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </button>
            <div className="flex flex-col items-start">
              <button
                type="button"
                className="text-lg font-bold tracking-tight text-slate-800"
                onClick={() => window.location.reload()}
                title="Click de tai lai trang"
              >
                C Food
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500  hover:text-black transition-all font-medium"
            title="Chuyển sang trang người dùng"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Trang người dùng</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="">
            
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] leading-4 text-center rounded-full border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-800">Thông báo</p>
                  {sortedNotifications.length > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-600 hover:underline">
                      Đọc tất cả
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {sortedNotifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">Không có thông báo mới.</p>
                  ) : (
                    sortedNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
                          readIds.has(n.id) ? 'bg-white' : 'bg-emerald-50/30'
                        }`}
                      >
                        <p className="text-sm text-slate-700">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time ? String(n.time).slice(0, 10) : ''}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {menuItems.find((i) => i.path === location.pathname)?.name || 'Trang quản trị'}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-emerald-500/20"
              >
                Tải báo cáo
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
