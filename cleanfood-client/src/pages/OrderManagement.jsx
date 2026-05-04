import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, Eye, Calendar, Search } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const ORDERS_PER_PAGE = 10;

  const statusMap = {
    PENDING: { label: 'Chờ xác nhận', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    SHIPPING: { label: 'Đang giao hàng', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Package },
    COMPLETED: { label: 'Giao thành công', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Đã hủy đơn', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle }
  };

  const statusTabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'SHIPPING', label: 'Đang giao hàng' },
    { key: 'COMPLETED', label: 'Giao thành công' },
    { key: 'CANCELLED', label: 'Đã hủy đơn' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status && (status === 'PENDING' || status === 'SHIPPING' || status === 'COMPLETED' || status === 'CANCELLED')) {
      setStatusFilter(status);
      setCurrentPage(1);
    }
  }, [location.search]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      const list = Array.isArray(response.data) ? response.data : [];
      setOrders(list);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status?status=${status}`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
      if (status === 'CANCELLED' || status === 'COMPLETED' || status === 'SHIPPING') {
        setStatusFilter(status);
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái đơn hàng thất bại');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('vi-VN');
  };

  const parseShippingAddress = (order) => {
    const raw = String(order?.shippingAddress || '');
    const parts = raw.split(' - ').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        fullName: parts[0],
        phone: parts[1],
        address: parts.slice(2).join(' - ')
      };
    }
    return {
      fullName: order?.customer?.fullName || '',
      phone: order?.customer?.phone || '',
      address: raw
    };
  };

  const handlePrintInvoice = (order) => {
    const shipping = parseShippingAddress(order);
    const rows = (order.items || [])
      .map((item) => {
        const name = item.product?.name || 'San pham';
        const qty = Number(item.quantity || 0);
        const lineTotal = qty * Number(item.price || 0);
        return `
          <tr>
            <td>${name}</td>
            <td style="text-align:center;">${qty}</td>
            <td style="text-align:right;">${lineTotal.toLocaleString()} d</td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <html>
        <head>
          <title>Hóa đơn #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h2 { margin: 0 0 8px 0; }
            .meta p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 14px; }
            th { background: #f8fafc; text-align: left; }
            .total { margin-top: 16px; text-align: right; font-weight: 700; font-size: 18px; }
          </style>
        </head>
        <body>
          <h2>Hóa đơn đơn hàng #${order.id}</h2>
          <div class="meta">
            <p><strong>Họ và tên:</strong> ${shipping.fullName || 'N/A'}</p>
            <p><strong>Số điện thoại:</strong> ${shipping.phone || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> ${shipping.address || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th style="text-align:center;">Số lượng</th>
                <th style="text-align:right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total">Tổng tiền: ${(order.totalAmount || 0).toLocaleString()} d</div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Không mở được cửa sổ in hóa đơn');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return (orders || []).filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (!keyword) return true;
      const numericKeyword = keyword.replace('#', '');
      if (/^\d+$/.test(numericKeyword)) {
        return String(o.id || '') === numericKeyword;
      }
      const name = String(o.customer?.fullName || o.customer?.username || '').toLowerCase();
      const phone = String(o.customer?.phone || '').toLowerCase();
      const code = String(o.id || '').toLowerCase();
      return name.includes(keyword) || phone.includes(keyword) || code.includes(keyword);
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil((filteredOrders?.length || 0) / ORDERS_PER_PAGE));
  const paginatedOrders = (filteredOrders || []).slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo mã đơn, tên hoặc số điện thoại..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                statusFilter === tab.key
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Mã đơn</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-32">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-48">Tổng thanh toán</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-40">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((order) => {
                const State = statusMap[order.status] || statusMap.PENDING;
                const StateIcon = State.icon;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-bold">{order.customer?.fullName || 'Khách vãng lai'}</p>
                      <p className="text-xs text-slate-400 font-medium">{order.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-emerald-600 font-black">{(order.totalAmount || 0).toLocaleString()} <span className="text-[10px]">d</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-tight w-32 justify-center ${State.bg} ${State.text} ${State.border}`}>
                        <StateIcon className="w-3 h-3" />
                        {State.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                          {Object.keys(statusMap).map((status) => (
                            <option key={status} value={status}>{statusMap[status].label}</option>
                          ))}
                        </select>
                        <button onClick={() => handleViewDetails(order)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredOrders.length === 0 && (
          <div className="p-16 text-center text-slate-400 text-sm font-medium italic">Không có đơn hàng phù hợp.</div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        (() => {
          const shipping = parseShippingAddress(selectedOrder);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      Chi tiết đơn hàng <span className="text-emerald-600 font-mono">#{selectedOrder.id}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic font-black">
                      Người đặt: {shipping.fullName || selectedOrder.customer?.fullName}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Thông tin giao hàng</h4>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 font-bold text-slate-600">
                        <p className="flex justify-between items-center text-xs">Tên: <span className="text-slate-900">{shipping.fullName || 'N/A'}</span></p>
                        <p className="flex justify-between items-center text-xs">SĐT: <span className="text-slate-900">{shipping.phone || 'N/A'}</span></p>
                        <p className="flex justify-between items-start text-xs gap-3">Địa chỉ: <span className="text-slate-900 text-right break-words">{shipping.address || 'N/A'}</span></p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Thanh toán</h4>
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2 font-bold text-emerald-700">
                        <p className="flex justify-between items-center text-xs">Tổng tiền: <span className="text-lg font-black">{(selectedOrder.totalAmount || 0).toLocaleString()} d</span></p>
                        <p className="flex justify-between items-center text-[10px] uppercase tracking-tighter">Trạng thái: {selectedOrder.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Danh sách sản phẩm</h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {selectedOrder.items?.map((item, i) => {
                        const imgUrl = item.product?.images?.[0]?.url ? `http://localhost:8080${item.product.images[0].url}` : null;
                        return (
                          <div key={i} className="flex justify-between items-center p-4 bg-white hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item.product?.name || 'San pham'} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-xs text-slate-400 italic">IMG</div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.product?.name || 'Sản phẩm'}</p>
                                <p className="text-[11px] text-slate-400 font-medium">SL: {item.quantity} x {(item.price || 0).toLocaleString()} d</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-700">{(item.quantity * item.price).toLocaleString()} d</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => handlePrintInvoice(selectedOrder)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                    In hóa đơn
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default OrderManagement;
