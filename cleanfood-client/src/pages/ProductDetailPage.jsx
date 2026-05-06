import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBasket, 
  MapPin, 
  Star, 
  Leaf, 
  Truck, 
  ShieldCheck, 
  PackageCheck,
  ChevronRight, 
  Minus, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import api from '../lib/axios';
import useCart from '../stores/useCart';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/products/${id}`);
        const currentProduct = res.data;
        setProduct(currentProduct);
        if (currentProduct.images && currentProduct.images.length > 0) {
          setActiveImage(`http://localhost:8080${currentProduct.images[0].url}`);
        } else {
          setActiveImage(null);
        }

        const categoryId = currentProduct.category?.id || currentProduct.categoryId;
        if (categoryId) {
          const relatedRes = await api.get(`/public/products/category/${categoryId}`);
          setRelatedProducts(
            (relatedRes.data || [])
              .filter((item) => Number(item.id) !== Number(id))
              .slice(0, 4)
          );
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, quantity, product);
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      toast.error('Thêm vào giỏ hàng thất bại');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="max-w-md mx-auto py-20 text-center">
       <h2 className="text-2xl font-black text-slate-800">Sản phẩm không tồn tại</h2>
       <Link to="/products" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">Quay lại cửa hàng</Link>
    </div>
  );

  const isPromotionActive = (() => {
    const today = new Date().toISOString().slice(0, 10);
    const start = product.promotionStartDate;
    const end = product.promotionEndDate;
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  })();
  const isDiscounted = Number(product.discountPercent) > 0 && isPromotionActive;
  const displayPrice = isDiscounted ? (product.discountedPrice || 0) : (product.price || 0);

  const isRelatedDiscounted = (item) => {
    if (Number(item.discountPercent) <= 0) return false;
    const today = new Date().toISOString().slice(0, 10);
    const start = item.promotionStartDate;
    const end = item.promotionEndDate;
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  };

  const stockQuantity = Number(product.stockQuantity || 0);
  const isOutOfStock = stockQuantity <= 0;
  const canAddToCart = !adding && !isOutOfStock;

  const getRelatedImageUrl = (item) => {
    if (item?.images && item.images.length > 0 && item.images[0]?.url) {
      return `http://localhost:8080${item.images[0].url}`;
    }
    return "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-10">
        <nav className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-emerald-600">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-emerald-600">Sản phẩm</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 line-clamp-1 max-w-[150px]">{product.name}</span>
        </nav>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
           <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Gallery Container */}
        <div className="space-y-6">
           {/* Main Image */}
           <div className="aspect-square rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
              <img 
               src={activeImage || "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=1200"} 
               className="w-full h-full object-cover animate-in fade-in duration-500" 
               alt={product.name} 
              />
           </div>

           {/* Thumbnails */}
           {product.images && product.images.length > 1 && (
             <div className="flex flex-wrap gap-4 px-2">
                {product.images.map((img, index) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImage(`http://localhost:8080${img.url}`)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === `http://localhost:8080${img.url}` 
                        ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                        : 'border-white shadow-sm hover:border-slate-200'
                    }`}
                  >
                    <img src={`http://localhost:8080${img.url}`} className="w-full h-full object-cover" alt={`view ${index}`} />
                  </button>
                ))}
             </div>
           )}
        </div>

        {/* Right: Info Content */}
        <div className="space-y-10">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                    {product.origin?.split(',')[0]}
                 </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-4">{product.name}</h1>
              <div className="flex flex-col gap-1">
                {isDiscounted && (
                  <p className="text-slate-400 text-lg font-bold line-through">{(product.price || 0).toLocaleString()} đ</p>
                )}
                <p className="text-emerald-600 text-4xl font-black italic">{displayPrice.toLocaleString()} <span className="text-lg uppercase">đ</span> / {product.unit || 'Kg'}</p>
              </div>
           </div>

           <div className="prose prose-slate max-w-none">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Mô tả sản phẩm</h4>
              <p className="text-slate-500 font-medium leading-relaxed italic">{product.description || 'Sản phẩm tươi ngon, được tuyển chọn kỹ lưỡng từ các trang trại sạch, đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm.'}</p>
           </div>

           <div className="grid grid-cols-2 gap-6 py-8 border-y border-slate-100">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nguồn gốc</h5>
                    <p className="text-sm font-bold text-slate-700">{product.origin || 'Đang cập nhật'}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <PackageCheck className="w-5 h-5" />
                 </div>
                 <div>
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tồn kho</h5>
                    <p className="text-sm font-bold text-slate-700">Còn lại {product.stockQuantity ?? 0} {product.unit || 'Kg'}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div>
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chứng nhận</h5>
                    <p className="text-sm font-bold text-slate-700">VietGAP & Organic</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl p-1 gap-4 h-16 w-full sm:w-auto px-4">
                 <button
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   disabled={isOutOfStock || quantity <= 1}
                   className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600"
                 >
                   <Minus className="w-5 h-5" />
                 </button>
                 <span className="w-8 text-center text-lg font-black text-slate-800 italic">{quantity}</span>
                 <button
                   onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                   disabled={isOutOfStock || quantity >= stockQuantity}
                   className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 h-16 bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <ShoppingBasket className="w-6 h-6" />
                 {isOutOfStock ? 'Hết hàng' : adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
           </div>

           <div className="flex items-center gap-4 pt-4 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-500" /> Miễn phí giao hàng đơn từ 500k</div>
              <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /> 100% Nông sản sạch</div>
           </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sản phẩm liên quan</h2>
              <p className="text-sm font-semibold text-slate-400 mt-1">Các sản phẩm cùng danh mục</p>
            </div>
            <Link
              to={`/products?category=${product.category?.id || product.categoryId || ''}`}
              className="text-sm font-black text-emerald-600 hover:text-emerald-700"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((item) => {
              const relatedDiscounted = isRelatedDiscounted(item);
              const relatedPrice = relatedDiscounted ? (item.discountedPrice || 0) : (item.price || 0);

              return (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="h-full bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col"
                >
                  <div className="block aspect-square relative overflow-hidden bg-slate-50">
                    <img
                      src={getRelatedImageUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-emerald-700 shadow-sm">
                      <MapPin className="w-3 h-3" />
                      {item.origin?.split(',')[0]}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.category?.name}</span>
                    <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[56px]">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mb-4">{item.unit || 'Kg'} • Còn lại {item.stockQuantity ?? 0}</p>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex flex-col leading-tight min-h-[40px] justify-end">
                        {relatedDiscounted ? (
                          <span className="text-xs text-slate-400 line-through">{(item.price || 0).toLocaleString()} đ</span>
                        ) : (
                          <span className="text-xs text-transparent select-none">0 đ</span>
                        )}
                        <span className="text-xl font-black text-emerald-600">
                          {relatedPrice.toLocaleString()} <span className="text-xs uppercase">đ</span>
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                        <ShoppingBasket className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
