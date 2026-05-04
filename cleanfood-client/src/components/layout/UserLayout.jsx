import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBasket,
  Search,
  User as UserIcon,
  Leaf,
  Menu,
  X,
  LogOut,
  ReceiptText,
  CreditCard,
  Trash2
} from 'lucide-react';
import api from '../../lib/axios';
import useAuth from '../../stores/useAuth';
import useCart from '../../stores/useCart';
import toast from 'react-hot-toast';

const UserLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  const updateCartQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQuantity(id, newQty);
      await fetchCart();
    } catch (error) {
      toast.error('Cập nhật số lượng thất bại');
    }
  };

  const removeCartItem = async (id) => {
    try {
      await removeFromCart(id);
      await fetchCart();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const clearCartItems = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await clearCart();
      await fetchCart();
      toast.success('Đã xóa tất cả sản phẩm trong giỏ');
    } catch (error) {
      toast.error('Xóa tất cả thất bại');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories');
        setCategories(res.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-emerald-600 text-white text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
        Miễn phí­ vậ­n chuyển cho đơnn hàng từ 500k Giao hàng nhanh trong 2h
      </div>

      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">C Food</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Trang chủ</Link>
              <div className="relative group">
                <Link to="/products" className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">Danh mục</Link>
                <div className="absolute left-0 top-full pt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <div className="px-4 py-2.5 text-sm text-slate-400">Không có danh mục</div>
                    )}
                  </div>
                </div>
              </div>
              <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Về chúng tôi</Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Tìm thực phẩm sạch..."
                  className="bg-slate-100 border-none rounded-full py-2.5 pl-11 pr-5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              </form>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Link to="/cart" className="relative p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all block">
                    <ShoppingBasket className="w-6 h-6" />
                    {cartItems.length > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>

                  <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-800">Sản phẩm trong giỏ hàng</p>
                      {cartItems.length > 0 && (
                        <button
                          onClick={clearCartItems}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-500">Giỏ hàng đang trống.</p>
                      ) : (
                        cartItems.slice(0, 5).map((item) => {
                          const imgUrl = item.product?.images?.[0]?.url
                            ? `http://localhost:8080${item.product.images[0].url}`
                            : 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=200';
                          return (
                            <div key={item.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0 flex items-center gap-3">
                              <img src={imgUrl} alt={item.product?.name || 'San pham'} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">{item.product?.name}</p>
                                <div className="mt-1 inline-flex items-center gap-1 border border-slate-200 rounded-md px-1 py-0.5">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="w-5 h-5 text-xs font-bold text-slate-600 hover:text-emerald-600"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs text-slate-500 min-w-5 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="w-5 h-5 text-xs font-bold text-slate-600 hover:text-emerald-600"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => removeCartItem(item.id)}
                                    className="w-5 h-5 ml-1 text-slate-500 hover:text-rose-600"
                                    title="Xoa san pham"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-emerald-600">{(item.product?.price * item.quantity).toLocaleString()} d</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => navigate('/cart')}
                        className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Chi tiết giỏ hàng
                      </button>
                      <button
                        onClick={() => navigate('/cart', { state: { directCheckout: true } })}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                      >
                        Đặt hàng ngay
                      </button>
                    </div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-slate-800 leading-none">{user?.username}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">Tài khoản của bạn</p>
                    </div>
                    <div className="relative group">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold cursor-pointer">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute right-0 top-full pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                        <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                          <button
                            onClick={() => navigate('/profile')}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            Hồ sơ chi tiết
                          </button>
                          <button
                            onClick={() => navigate('/my-orders')}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <ReceiptText className="w-4 h-4 text-slate-500" />
                            Đơn hàng
                          </button>
                          <button
                            onClick={() => navigate('/cart')}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <ShoppingBasket className="w-4 h-4 text-slate-500" />
                            Giỏ hàng
                          </button>
                          <button
                            onClick={() => toast('Tính năng phương thức thanh toán sẽ có trong bản cập nhật sau', { icon: '??' })}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <CreditCard className="w-4 h-4 text-slate-500" />
                            Phương thức thanh toán
                          </button>
                          <button
                            onClick={logout}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                          >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    <UserIcon className="w-4 h-4" />
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <Link to="/cart" className="relative p-2 text-slate-600">
                <ShoppingBasket className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-6 px-4 space-y-4 shadow-xl">
            <Link to="/" className="block text-lg font-bold text-slate-700">Trang chủ</Link>
            <Link to="/products" className="block text-lg font-bold text-slate-700">Danh mục</Link>
            <Link to="/about" className="block text-lg font-bold text-slate-700">Về chúng tôi</Link>
            <div className="pt-4 border-t border-slate-100">
              {!isAuthenticated && (
                <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">
                  <UserIcon className="w-5 h-5" />
                  Đăng nhập ngay
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-slate-800 tracking-tight">C Food</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Sứ mệnh của chúng tôi là mang thực phẩm sạch, an toàn và tươi ngon từ nông trại đến tận bàn ăn của mỗi gia đình Việt.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Khám phá</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link to="/products" className="hover:text-emerald-600 transition-colors">Tất cả sản phẩm</Link></li>
                <li><Link to="/products?category=1" className="hover:text-emerald-600 transition-colors">Rau củ quả</Link></li>
                <li><Link to="/products?category=2" className="hover:text-emerald-600 transition-colors">Thịt tươi sống</Link></li>
                <li><Link to="/products?category=3" className="hover:text-emerald-600 transition-colors">Hải sản tươi sống</Link></li>
                <li><Link to="/products?category=4" className="hover:text-emerald-600 transition-colors">Sữa và sản phẩm từ sữa</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Hỗ trợ</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link to="/policy" className="hover:text-emerald-600 transition-colors">Chính sách giao hàng</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Liên hệ</Link></li>
                <li><Link to="/faq" className="hover:text-emerald-600 transition-colors">Câu hỏi thường gặp</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Bản tin</h4>
              <p className="text-slate-400 text-xs font-medium mb-4">Nhận ưu đãi sớm nhất từ chúng tôi</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email của bạn" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-emerald-500" />
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors">Gửi</button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">© 2026 C Food. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <img src="https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png" alt="VNPay" className="h-4 grayscale hover:grayscale-0 transition-all opacity-50" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
