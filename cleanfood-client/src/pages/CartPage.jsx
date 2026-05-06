import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Plus, Minus, ArrowRight, CreditCard, MapPin, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import useAuth from '../stores/useAuth';
import useCart from '../stores/useCart';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, fetchCart, updateQuantity: updateCartQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [address, setAddress] = useState({ fullName: '', phone: '', detail: '' });
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initCart = async () => {
      await fetchCart();
      setLoading(false);
    };
    initCart();
  }, [fetchCart]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/user/profile');
        setAddress({
          fullName: res.data.fullName || res.data.username || '',
          phone: res.data.phone || '',
          detail: res.data.address || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.state?.directCheckout && cartItems.length > 0) {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để thanh toán');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      setCheckoutStep(2);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, cartItems.length, isAuthenticated, navigate]);

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartQuantity(id, newQty);
      await fetchCart();
    } catch {
      toast.error('Cập nhật giỏ hàng thất bại');
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(id);
      await fetchCart();
      toast.success('Đã xóa sản phẩm');
    } catch {
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const isPromotionActive = (product) => {
    if (Number(product?.discountPercent) <= 0) return false;
    const today = new Date().toISOString().slice(0, 10);
    const start = product.promotionStartDate;
    const end = product.promotionEndDate;
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  };

  const getDisplayPrice = (product) => {
    if (isPromotionActive(product) && Number(product?.discountedPrice) > 0) {
      return Number(product.discountedPrice);
    }
    return Number(product?.price || 0);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + getDisplayPrice(item.product) * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const shippingAddress = `${address.fullName} - ${address.phone} - ${address.detail}`;

  const handleVNPayPayment = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/payment/create-vnpay-payment', {
        params: { shippingAddress }
      });
      if (res.data.url) {
        if (res.data.orderId) {
          sessionStorage.setItem('pendingOrderId', res.data.orderId);
        }
        window.location.href = res.data.url;
        return;
      }
      setLoading(false);
    } catch {
      toast.error('Không thể khởi tạo thanh toán VNPay');
      setLoading(false);
    }
  };

  const handleCodPayment = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!address.fullName || !address.phone || !address.detail) {
      toast.error('Vui lòng nhập đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders/create-cod-order', { shippingAddress });
      if (res.data?.orderId) {
        api.post('/auth/send-invoice', { orderId: res.data.orderId }).catch(console.error);
      }
      await fetchCart();
      toast.success('Đặt hàng COD thành công');
      navigate('/my-orders');
    } catch (error) {
      const message = error?.response?.data?.message || 'Đặt hàng COD thất bại';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ShoppingBasket className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-500 font-medium mb-8">Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.</p>
        <Link to="/products" className="block w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          {checkoutStep === 1 ? (
            <>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Giỏ hàng của bạn ({cartItems.length})</h2>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const unitPrice = getDisplayPrice(item.product);
                    const hasDiscount = isPromotionActive(item.product) && unitPrice < Number(item.product?.price || 0);

                    return (
                    <div key={item.id} className="p-6 flex gap-6 items-center group">
                      <img
                        src={item.product.images && item.product.images.length > 0 ? `http://localhost:8080${item.product.images[0].url}` : 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=200'}
                        className="w-24 h-24 rounded-2xl object-cover border border-slate-50 transition-transform group-hover:scale-105"
                        alt={item.product.name}
                      />
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 mb-1">{item.product.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.product.origin?.split(',')[0]} - {item.product.unit || 'Kg'}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-2 border border-slate-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-emerald-600 rounded-lg transition-all text-slate-500"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center text-sm font-black text-slate-700">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-emerald-600 rounded-lg transition-all text-slate-500"><Plus className="w-4 h-4" /></button>
                          </div>
                          <div className="text-right">
                            {hasDiscount && (
                              <p className="text-xs text-slate-400 font-bold line-through">
                                {(Number(item.product.price || 0) * item.quantity).toLocaleString()} d
                              </p>
                            )}
                            <p className="text-emerald-600 font-black">{(unitPrice * item.quantity).toLocaleString()} d</p>
                            <button onClick={() => removeItem(item.id)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-1">Xóa khỏi giỏ</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setCheckoutStep(1)} className="text-slate-400 hover:text-slate-800 transition-colors">
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Thông tin nhận hàng</h2>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Người nhận</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Nguyen Van A"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="09xx..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Địa chỉ chi tiết</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      placeholder="Số nhà, tên đường, phường/xã..."
                      rows="3"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      value={address.detail}
                      onChange={(e) => setAddress({ ...address, detail: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Phương thức thanh toán</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`w-full p-6 rounded-2xl flex items-center justify-between text-left transition-all ${
                      paymentMethod === 'vnpay' ? 'border-2 border-emerald-500 bg-emerald-50' : 'border border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-emerald-100">
                        <img src="https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png" className="h-4" alt="VNPay" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Vi VNPay / Ngân hàng</p>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Khuyên dùng</p>
                      </div>
                    </div>
                    {paymentMethod === 'vnpay' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-6 rounded-2xl flex items-center justify-between text-left transition-all ${
                      paymentMethod === 'cod' ? 'border-2 border-emerald-500 bg-emerald-50' : 'border border-slate-200 bg-white hover:border-emerald-300'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Thanh toán (COD)</p>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Yêu cầu đăng nhập</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:w-96 flex-shrink-0">
          <div className="sticky top-28 bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl shadow-emerald-500/5 space-y-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Tóm tắt đơn hàng</h3>

            <div className="space-y-4 border-b border-slate-50 pb-6 text-sm font-bold">
              <div className="flex justify-between items-center text-slate-500">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString()} d</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()} d`}</span>
              </div>
              {shipping > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700 leading-relaxed font-bold">
                  <AlertCircle className="w-4 h-4 mb-2" />
                  Mua thêm <strong>{(500000 - subtotal).toLocaleString()} d</strong> để được miễn phí vận chuyển!
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-black text-slate-800">Tổng cộng</span>
              <span className="text-2xl font-black text-emerald-600">{total.toLocaleString()} d</span>
            </div>

            {checkoutStep === 1 ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Vui lòng đăng nhập để thanh toán');
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                  }
                  setCheckoutStep(2);
                }}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
              >
                Tiến hành đặt hàng
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={paymentMethod === 'cod' ? handleCodPayment : handleVNPayPayment}
                disabled={!address.fullName || !address.phone || !address.detail}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:grayscale"
              >
                {paymentMethod === 'cod' ? 'Đặt hàng COD' : 'Thanh toán ngay'}
                <CreditCard className="w-5 h-5" />
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center font-bold tracking-tight grayscale opacity-70">
              {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Giao dịch an toàn và bảo mật qua cổng VNPay'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
