import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  ChevronRight,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
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
    </div>
  );
};

export default OrderHistoryPage;
