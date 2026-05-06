import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const statusMap = {
    'PENDING': { label: 'Chờ xác nhận', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Clock },
    'SHIPPING': { label: 'Đang giao hàng', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: Package },
    'COMPLETED': { label: 'Thành công', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle2 },
    'CANCELLED': { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: XCircle },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? res.data : order)));
      setSelectedOrder(res.data);
      toast.success('Đã hủy đơn hàng');
    } catch (error) {
      const message = error?.response?.data?.message || 'Hủy đơn hàng thất bại';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center gap-4 mb-10">
         <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
         </Link>
         <h1 className="text-3xl font-black text-slate-800 tracking-tight">Đơn hàng của tôi</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[40px]">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <ShoppingBag className="w-10 h-10" />
           </div>
           <p className="text-slate-500 font-bold mb-8">Bạn chưa có đơn hàng nào cả.</p>
           <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
              Mua sắm ngay
              <ChevronRight className="w-4 h-4" />
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap['PENDING'];
            const StatusIcon = status.icon;
            return (
              <div key={order.id} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                 <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-mono font-bold text-xs border border-slate-100">
                          #{order.id}
                       </div>
                       <div>
                          <p className="text-lg font-black text-slate-800 mb-1">{(order.totalAmount || 0).toLocaleString()} đ</p>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                             <Calendar className="w-3 h-3" />
                             <span>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-tight ${status.bg} ${status.text} ${status.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                       </span>
                       <button
                         type="button"
                         onClick={() => setSelectedOrder(order)}
                         className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                         title="Xem chi tiết đơn hàng"
                       >
                         <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
                 
                 <div className="px-8 pb-8 flex flex-wrap gap-2">
                    {order.items?.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                          <span className="text-[10px] font-black text-slate-400">{item.quantity}x</span>
                          <span className="text-[11px] font-bold text-slate-600">{item.product?.name}</span>
                       </div>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        (() => {
          const status = statusMap[selectedOrder.status] || statusMap.PENDING;
          const StatusIcon = status.icon;
          const canCancel = selectedOrder.status === 'PENDING';

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
              <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 md:p-8 bg-slate-50/70 border-b border-slate-100 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Chi tiết đơn hàng</p>
                    <h2 className="text-2xl font-black text-slate-800">Đơn hàng #{selectedOrder.id}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-tight ${status.bg} ${status.text} ${status.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-8 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Thanh toán</p>
                      <p className="text-2xl font-black text-emerald-600">{(selectedOrder.totalAmount || 0).toLocaleString()} đ</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{selectedOrder.paymentMethod || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Địa chỉ giao hàng</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedOrder.shippingAddress || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Sản phẩm</p>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {selectedOrder.items?.map((item, idx) => {
                        const imgUrl = item.product?.images?.[0]?.url
                          ? `http://localhost:8080${item.product.images[0].url}`
                          : 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=200';
                        return (
                          <div key={idx} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <img src={imgUrl} alt={item.product?.name || 'Sản phẩm'} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{item.product?.name || 'Sản phẩm'}</p>
                                <p className="text-xs font-bold text-slate-400">{item.quantity} x {(item.price || 0).toLocaleString()} đ</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-700 shrink-0">{(Number(item.quantity || 0) * Number(item.price || 0)).toLocaleString()} đ</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-slate-50/70 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-3">
                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={cancelling}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all"
                  >
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

export default OrderHistoryPage;
