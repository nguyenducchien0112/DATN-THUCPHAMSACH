import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, SlidersHorizontal, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import useCart from '../stores/useCart';
import toast from 'react-hot-toast';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const ITEMS_PER_PAGE = 9;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState(null);
  
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          categoryId ? api.get(`/public/products/category/${categoryId}`) : search ? api.get(`/public/products/search?query=${search}`) : api.get('/public/products'),
          api.get('/public/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryId, selectedPriceRange, sortBy]);

  const getDisplayPrice = (product) => {
    if (isPromotionActive(product) && Number(product.discountPercent) > 0) {
      return product.discountedPrice || 0;
    }
    return product.price || 0;
  };

  const isPromotionActive = (product) => {
    if (Number(product.discountPercent) <= 0) return false;
    const today = new Date().toISOString().slice(0, 10);
    const start = product.promotionStartDate;
    const end = product.promotionEndDate;
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  };

  const getNewestValue = (product) => {
    const dateValue = product.createdAt || product.updatedAt || product.createdDate || product.updatedDate;
    const dateTime = dateValue ? new Date(dateValue).getTime() : 0;
    return Number.isNaN(dateTime) || dateTime === 0 ? Number(product.id || 0) : dateTime;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!selectedPriceRange) return true;
      const price = getDisplayPrice(p);
      if (selectedPriceRange === '0-50000') return price < 50000;
      if (selectedPriceRange === '50000-200000') return price >= 50000 && price <= 200000;
      if (selectedPriceRange === '200000+') return price > 200000;
      return true;
    });
  }, [products, selectedPriceRange]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'promotion') {
      return sorted
        .filter(isPromotionActive)
        .sort((a, b) => getNewestValue(b) - getNewestValue(a));
    }
    if (sortBy === 'price-desc') {
      return sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }
    if (sortBy === 'price-asc') {
      return sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    }
    return sorted.sort((a, b) => getNewestValue(b) - getNewestValue(a));
  }, [filteredProducts, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'promotion', label: 'Sản phẩm khuyến mãi' },
    { value: 'price-desc', label: 'Giá từ cao đến thấp' },
    { value: 'price-asc', label: 'Giá từ thấp đến cao' }
  ];

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getProductImageUrl = (product) => {
    if (product?.images && product.images.length > 0 && product.images[0]?.url) {
      return `http://localhost:8080${product.images[0].url}`;
    }
    return "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=600";
  };

  const handleAddToCart = async (product) => {
    setAddingProductId(product.id);
    try {
      await addToCart(product.id, 1, product);
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      toast.error('Thêm vào giỏ hàng thất bại');
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
        <Link to="/" className="hover:text-emerald-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900">Sản phẩm</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
           <div className="sticky top-28 space-y-8">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                   <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                   Danh mục
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link 
                      to="/products"
                      className={`text-[13px] font-bold block transition-all ${!categoryId ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Tất cả sản phẩm
                    </Link>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                       <Link 
                        to={`/products?category=${cat.id}`}
                        className={`text-[13px] font-bold block transition-all ${categoryId == cat.id ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                         {cat.name}
                       </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                   Giá bán
                </h4>
                <div className="space-y-4">
                    {[
                      { label: 'Tất cả mức giá', value: null },
                      { label: 'Dưới 50k', value: '0-50000' },
                      { label: '50k - 200k', value: '50000-200000' },
                      { label: 'Trên 200k', value: '200000+' }
                    ].map((range, i) => (
                      <label 
                        key={i} 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedPriceRange(range.value)}
                      >
                         <div className={`w-4 h-4 border-2 rounded transition-all ${
                           selectedPriceRange === range.value 
                             ? 'border-emerald-500 bg-emerald-500' 
                             : 'border-slate-200 group-hover:border-emerald-500'
                         }`}>
                           {selectedPriceRange === range.value && (
                             <div className="w-full h-full flex items-center justify-center">
                               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                             </div>
                           )}
                         </div>
                         <span className={`text-[13px] font-bold transition-colors ${
                           selectedPriceRange === range.value ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'
                         }`}>
                           {range.label}
                         </span>
                      </label>
                    ))}
                </div>
              </div>
           </div>
        </aside>

        {/* Main Products Grid */}
        <div className="flex-1">
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {search ? `Kết quả tìm kiếm cho "${search}"` : categoryId ? `Sản phẩm ${categories.find(c => c.id == categoryId)?.name || ''}` : 'Tất cả sản phẩm'}
              </h2>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600">
                 <label htmlFor="product-sort" className="shrink-0">Sắp xếp:</label>
                 <select
                   id="product-sort"
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="bg-transparent text-emerald-600 underline underline-offset-4 decoration-2 font-black focus:outline-none cursor-pointer"
                 >
                   {sortOptions.map(option => (
                     <option key={option.value} value={option.value}>{option.label}</option>
                   ))}
                 </select>
              </div>
           </div>

           {loading ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse"></div>
               ))}
             </div>
           ) : sortedProducts.length === 0 ? (
             <div className="bg-slate-50 border border-slate-100 rounded-3xl p-20 text-center">
                <p className="text-slate-500 font-bold">Không tìm thấy sản phẩm nào phù hợp với lựa chọn của bạn.</p>
                <button 
                  onClick={() => {
                    setSelectedPriceRange(null);
                    setSortBy('newest');
                  }}
                  className="mt-4 text-emerald-600 font-black text-sm hover:underline"
                 >
                    Xóa bộ lọc
                 </button>
             </div>
           ) : (
             <>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map(p => (
                   <div key={p.id} className="h-full bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col">
                      <Link to={`/products/${p.id}`} className="block aspect-[4/5] relative overflow-hidden bg-slate-50">
                        <img 
                          src={getProductImageUrl(p)} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      </Link>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category?.name}</span>
                        </div>
                        <Link to={`/products/${p.id}`} className="block text-lg font-black text-slate-800 mb-1 hover:text-emerald-600 transition-colors line-clamp-2 min-h-[56px]">
                          {p.name}
                        </Link>
                        <p className="text-slate-400 text-xs font-medium mb-4">{p.unit || 'Kg'} • Còn lại {p.stockQuantity ?? 0}</p>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col leading-tight min-h-[40px] justify-end">
                              {isPromotionActive(p) && Number(p.discountPercent) > 0 ? (
                                <span className="text-xs text-slate-400 line-through">{(p.price || 0).toLocaleString()} đ</span>
                              ) : (
                                <span className="text-xs text-transparent select-none">0 đ</span>
                              )}
                              <span className="text-xl font-black text-emerald-600">{getDisplayPrice(p).toLocaleString()} <span className="text-xs uppercase">đ</span></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(p)}
                              disabled={addingProductId === p.id || Number(p.stockQuantity) <= 0}
                              className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Thêm vào giỏ hàng"
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </button>
                        </div>
                      </div>
                   </div>
                ))}
             </div>
             {totalPages > 1 && (
               <div className="flex items-center justify-center gap-2 mt-10">
                 <button
                   type="button"
                   onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                   disabled={currentPage === 1}
                   className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                 >
                   Trước
                 </button>
                 {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                   <button
                     key={page}
                     type="button"
                     onClick={() => setCurrentPage(page)}
                     className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                       currentPage === page
                         ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                         : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200'
                     }`}
                   >
                     {page}
                   </button>
                 ))}
                 <button
                   type="button"
                   onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                   disabled={currentPage === totalPages}
                   className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                 >
                   Sau
                 </button>
               </div>
             )}
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;

