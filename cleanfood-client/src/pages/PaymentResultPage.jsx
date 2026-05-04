import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBasket, Calendar, CreditCard } from 'lucide-react';
import api from '../lib/axios';
import useCart from '../stores/useCart';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
  const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
  
  const isSuccess = vnp_ResponseCode === '00';

  useEffect(() => {
    if (isSuccess) {
      clearCart().catch(console.error);

      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      if (pendingOrderId) {
        api.post('/auth/send-invoice', { orderId: pendingOrderId })
          .then(() => {
            sessionStorage.removeItem('pendingOrderId');
          })
          .catch(console.error);
      }
    }
  }, [isSuccess, clearCart]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent)]">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-12 text-center border border-slate-100 relative overflow-hidden">
        
        {/* Decorative Background Icon */}
        <div className="absolute -top-10 -right-10 opacity-5 grayscale pointer-events-none">
           <ShoppingBasket size={150} />
        </div>

        {isSuccess ? (
          <>
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-inner">
               <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Thanh toán thành công!</h2>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">
              Cảm ơn bạn đã tin tưởng chọn thực phẩm sạch tại CleanFood. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến.
            </p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-8 shadow-inner">
               <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Thanh toán không thành công</h2>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">
              Giao dịch đã bị hủy hoặc gặp sự cố kỹ thuật. Đừng lo lắng, các sản phẩm vẫn còn trong giỏ hàng của bạn.
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-4 mb-12 text-left bg-slate-50 rounded-3xl p-6 border border-slate-100">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã giao dịch</p>
              <p className="text-sm font-black text-slate-700">{vnp_TransactionNo || 'N/A'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số tiền</p>
              <p className="text-sm font-black text-emerald-600">{(vnp_Amount / 100).toLocaleString()} <span className="text-[10px]">đ</span></p>
           </div>
           <div className="space-y-1 col-span-2 pt-4 border-t border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</p>
              <p className="text-sm font-medium text-slate-600">{vnp_OrderInfo}</p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           {isSuccess ? (
             <Link to="/products" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                Tiếp tục mua sắm
                <ArrowRight className="w-4 h-4" />
             </Link>
           ) : (
             <>
               <Link to="/cart" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-950 transition-all">
                  Thử lại payment
               </Link>
               <Link to="/" className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
                  Về trang chủ
               </Link>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
