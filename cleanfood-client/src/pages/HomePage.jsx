import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import api from '../lib/axios';
import useAuth from '../stores/useAuth';
import useCart from '../stores/useCart';
import toast from 'react-hot-toast';

const Banner = () => (
  <div className="relative bg-emerald-700 rounded-3xl overflow-hidden mb-16 shadow-2xl shadow-emerald-200/50">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/60 to-transparent z-10"></div>
    <div className="relative z-20 p-12 md:p-20 flex flex-col items-start gap-6 max-w-2xl">
      {/*
      <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/20">
        Khuyến mãi hôm nay
      </span>
      */}
      <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">Thực phẩm sạch cho cuộc sống xanh</h1>
      <p className="text-white/80 text-lg font-medium">Những mặt hàng tốt nhất được chuyên gia khuyên dùng</p>
      <Link to="/products" className="mt-4 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl">
        Mua sắm ngay
      </Link>
    </div>
    <img 
      src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
      alt="Fresh veggies" 
      className="absolute right-0 top-0 h-full w-2/3 object-cover object-left"
    />
  </div>
);

const Features = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
    {[
      { icon: ShieldCheck, title: "100% An toàn", desc: "Đã qua kiểm định VietGAP & Organic" },
      { icon: Truck, title: "Giao nhanh 2h", desc: "Nội thành TP.HCM & Hà Nội" },
      { icon: Clock, title: "Tươi ngon mỗi ngày", desc: "Hàng mới về lúc 5h sáng hàng ngày" }
    ].map((f, i) => (
      <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
          <f.icon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 tracking-tight">{f.title}</h4>
          <p className="text-slate-500 text-sm font-medium">{f.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const isPromotionActive = (product) => {
  if (Number(product.discountPercent) <= 0) return false;
  const today = new Date().toISOString().slice(0, 10);
  const start = product.promotionStartDate;
  const end = product.promotionEndDate;
  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
};

const getDisplayPrice = (product) => (
  isPromotionActive(product) ? (product.discountedPrice || 0) : (product.price || 0)
);

const sortNewestProducts = (items) => (
  [...(items || [])].sort((a, b) => {
    const aDate = a.createdAt || a.updatedAt;
    const bDate = b.createdAt || b.updatedAt;
    if (aDate && bDate) return new Date(bDate) - new Date(aDate);
    return Number(b.id || 0) - Number(a.id || 0);
  })
);

const ProductCard = ({ product, onAddToCart, adding }) => (
  <div className="h-full bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col">
    <Link to={`/products/${product.id}`} className="block aspect-square relative overflow-hidden bg-slate-50">
      <img
        src={product.images && product.images.length > 0 ? `http://localhost:8080${product.images[0].url}` : "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=600"}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-emerald-700 shadow-sm">
        <MapPin className="w-3 h-3" />
        {product.origin?.split(',')[0]}
      </div>
    </Link>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category?.name}</span>
      </div>
      <Link to={`/products/${product.id}`} className="block text-lg font-black text-slate-800 mb-1 hover:text-emerald-600 transition-colors line-clamp-2 min-h-[56px]">
        {product.name}
      </Link>
      <p className="text-slate-400 text-xs font-medium mb-4">{product.unit || 'Kg'} • Còn lại {product.stockQuantity ?? 0}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col leading-tight min-h-[40px] justify-end">
          {isPromotionActive(product) ? (
            <span className="text-xs text-slate-400 line-through">{(product.price || 0).toLocaleString()} đ</span>
          ) : (
            <span className="text-xs text-transparent select-none">0 đ</span>
          )}
          <span className="text-xl font-black text-emerald-600">{getDisplayPrice(product).toLocaleString()} <span className="text-xs uppercase">đ</span></span>
        </div>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={adding || Number(product.stockQuantity) <= 0}
          className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Thêm vào giỏ hàng"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchCart, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);

  const categoryStyles = {
    'Rau củ quả': {
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      desc: 'text-emerald-800/70',
      btn: 'bg-emerald-500',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKTXelDyqQTyACDLJpHPwkWPLU2-vQCVd1AQ&s'
    },
    'Thịt tươi sống': {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      desc: 'text-amber-800/70',
      btn: 'bg-amber-500',
      img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400'
    },
    'Thủy hải sản tươi sống': {
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      desc: 'text-rose-800/70',
      btn: 'bg-rose-500',
      img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    'Kem sữa trứng': {
      bg: 'bg-blue-100',
      text: 'text-blue-900',
      desc: 'text-blue-800/70',
      btn: 'bg-blue-500',
      img: 'https://images.unsplash.com/photo-1646834118758-479021c8d1fc?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
  };

  const defaultStyle = {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    desc: 'text-slate-800/70',
    btn: 'bg-slate-500',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400'
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/public/products'),
          api.get('/public/categories')
        ]);
        const allProducts = prodRes.data || [];
        setProducts(sortNewestProducts(allProducts).slice(0, 4));
        setPromotionProducts(allProducts.filter(isPromotionActive).slice(0, 4));
        setCategories(catRes.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleAddToCart = async (product) => {
    setAddingProductId(product.id);
    try {
      if (!isAuthenticated) {
        await addToCart(product.id, 1, product);
      } else {
        await api.post(`/cart/add?productId=${product.id}&quantity=1`);
        await fetchCart();
      }
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      toast.error('Thêm vào giỏ hàng thất bại');
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Banner />
      <Features />

      {/* Featured Section */}
      <div className="mb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sản phẩm mới nhất</h2>
            <p className="text-slate-500 font-medium">Những mặt hàng tốt nhất được chuyên gia khuyên dùng</p>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:translate-x-1 transition-all">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                adding={addingProductId === p.id}
              />
            ))}
          </div>
        )}
      </div>

      {promotionProducts.length > 0 && (
        <div className="mb-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sản phẩm khuyến mãi</h2>
              <p className="text-slate-500 font-medium">Những mặt hàng tốt nhất được chuyên gia khuyên dùng</p>
            </div>
            <Link to="/products" className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:translate-x-1 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {promotionProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                adding={addingProductId === p.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories Banner Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {categories.map((cat) => {
            const style = categoryStyles[cat.name] || defaultStyle;
            return (
              <Link 
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className={`h-64 rounded-[32px] ${style.bg} flex items-center p-10 md:p-12 overflow-hidden relative group cursor-pointer transition-all hover:shadow-xl hover:shadow-slate-200/50`}
              >
                  <div className="relative z-10 w-1/2">
                    <h3 className={`text-2xl font-black ${style.text} mb-2`}>{cat.name}</h3>
                    <p className={`${style.desc} text-sm font-bold mb-4 line-clamp-2`}>{cat.description || 'Sản phẩm tươi sống từ nguồn cung uy tín.'}</p>
                    <div className={`inline-flex py-1.5 px-5 ${style.btn} text-white rounded-full text-[10px] font-black uppercase tracking-widest`}>Khám phá</div>
                  </div>
                  <img 
                    src={style.img} 
                    className="absolute right-0 top-0 h-full w-2/3 object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={cat.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default HomePage;
