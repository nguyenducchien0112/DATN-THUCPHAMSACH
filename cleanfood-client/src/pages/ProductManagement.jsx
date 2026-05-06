import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as LucideImage,
  Filter,
  MoreHorizontal,
  Upload,
  X as CloseIcon
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const ITEMS_PER_PAGE = 10;
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPercent: '',
    discountedPrice: '',
    promotionStartDate: '',
    promotionEndDate: '',
    stockQuantity: '',
    category: { id: '' },
    imageUrl: '',
    description: '',
    origin: '',
    unit: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        discountPercent: product.discountPercent ?? '',
        discountedPrice: product.discountedPrice ?? product.price ?? '',
        promotionStartDate: product.promotionStartDate || '',
        promotionEndDate: product.promotionEndDate || '',
        stockQuantity: product.stockQuantity,
        category: { id: product.category?.id || '' },
        description: product.description || '',
        origin: product.origin || '',
        unit: product.unit || ''
      });
      setExistingImages(product.images || []);
      setRemovedImageIds([]);
      setSelectedFiles([]);
      setPreviews([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        discountPercent: '',
        discountedPrice: '',
        promotionStartDate: '',
        promotionEndDate: '',
        stockQuantity: '',
        category: { id: categories[0]?.id || '' },
        description: '',
        origin: '',
        unit: ''
      });
      setExistingImages([]);
      setRemovedImageIds([]);
      setSelectedFiles([]);
      setPreviews([]);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setRemovedImageIds(prev => [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.promotionStartDate && formData.promotionEndDate && formData.promotionStartDate > formData.promotionEndDate) {
      toast.error('Ngày kết thúc khuyến mãi phải lớn hơn hoặc bằng ngày bắt đầu.');
      return;
    }

    const normalizedProduct = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      price: Number(formData.price) || 0,
      discountPercent: Number(formData.discountPercent) || 0,
      promotionStartDate: formData.promotionStartDate || null,
      promotionEndDate: formData.promotionEndDate || null,
      stockQuantity: Number(formData.stockQuantity) || 0,
      origin: formData.origin?.trim() || '',
      unit: formData.unit?.trim() || '',
      category: { id: Number(formData.category?.id) }
    };

    const data = new FormData();
    data.append('product', JSON.stringify(normalizedProduct));
    
    selectedFiles.forEach(file => {
      data.append('files', file);
    });

    if (removedImageIds.length > 0) {
      data.append('removedImageIds', JSON.stringify(removedImageIds));
    }

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/admin/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Thêm sản phẩm mới thành công');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error?.response?.data || error.message);
      toast.error('Thao tác sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const calculateDiscountedPrice = (price, discountPercent) => {
    const numericPrice = Number(price) || 0;
    const numericDiscount = Number(discountPercent) || 0;
    const normalizedDiscount = Math.min(100, Math.max(0, numericDiscount));
    const discounted = numericPrice - (numericPrice * normalizedDiscount) / 100;
    return Math.max(0, Math.round(discounted));
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

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      setProducts(products.filter(p => p.id !== deleteConfirmId));
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setLoading(false);
      setDeleteConfirmId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategoryFilter || String(p.category?.id || '') === String(selectedCategoryFilter);
    return matchName && matchCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {selectedCategoryFilter
                ? (categories.find(c => String(c.id) === String(selectedCategoryFilter))?.name || 'Lọc')
                : 'Lọc'}
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 ${!selectedCategoryFilter ? 'text-emerald-600 bg-emerald-50/60' : 'text-slate-700'}`}
                >
                  Tất cả danh mục
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryFilter(String(cat.id));
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 ${String(selectedCategoryFilter) === String(cat.id) ? 'text-emerald-600 bg-emerald-50/60' : 'text-slate-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Giá bán</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tồn kho</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 text-slate-300">
                        {product.images && product.images.length > 0 ? (
                          <img src={`http://localhost:8080${product.images[0].url}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <LucideImage className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm tracking-tight">{product.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">SKU: PROD-{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                      {product.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isPromotionActive(product) && Number(product.discountPercent) > 0 ? (
                      <div className="flex flex-col items-center leading-tight">
                        <p className="text-slate-400 text-xs line-through">{(product.price || 0).toLocaleString()} đ</p>
                        <p className="text-emerald-600 font-bold text-sm">{(product.discountedPrice || 0).toLocaleString()} đ</p>
                      </div>
                    ) : (
                      <p className="text-slate-900 font-bold text-sm">{(product.price || 0).toLocaleString()} đ</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className={`text-sm font-bold ${product.stockQuantity < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {product.stockQuantity}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="p-16 text-center">
            <div className="inline-block w-6 h-6 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="p-16 text-center">
             <p className="text-slate-400 text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
           <p className="text-xs text-slate-500 font-medium">Hiển thị {paginatedProducts.length} / {filteredProducts.length} sản phẩm</p>
           <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold ${currentPage === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Sau
              </button>
           </div>
        </div>
      </div>
      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                   {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <Plus className="w-6 h-6 rotate-45" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên sản phẩm</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Danh mục</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                        value={formData.category.id}
                        onChange={(e) => setFormData({...formData, category: { id: e.target.value }})}
                        required
                      >
                         <option value="">Chọn danh mục</option>
                         {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Giá bán (đ)</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.price}
                        onChange={(e) => {
                          const nextPrice = e.target.value;
                          setFormData({
                            ...formData,
                            price: nextPrice,
                            discountedPrice: calculateDiscountedPrice(nextPrice, formData.discountPercent)
                          });
                        }}
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Khuyến mãi (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.discountPercent}
                        onChange={(e) => {
                          const nextDiscount = e.target.value;
                          setFormData({
                            ...formData,
                            discountPercent: nextDiscount,
                            discountedPrice: calculateDiscountedPrice(formData.price, nextDiscount)
                          });
                        }}
                        placeholder="Ví dụ: 10%"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Giá khuyến mãi (đ)</label>
                      <input
                        type="number"
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-emerald-700 focus:outline-none"
                        value={formData.discountedPrice}
                        readOnly
                      />
                   </div>
                   <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Ngày bắt đầu KM</label>
                        <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.promotionStartDate}
                        onChange={(e) => setFormData({...formData, promotionStartDate: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Số lượng tồn</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Ngày kết thúc KM</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={formData.promotionEndDate}
                        onChange={(e) => setFormData({...formData, promotionEndDate: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nguồn gốc</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        placeholder="Đà Lạt, Lâm Đồng..."
                        value={formData.origin}
                        onChange={(e) => setFormData({...formData, origin: e.target.value})}
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Đơn vị tính</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        placeholder="VD: Kg, Túi, Hộp, Bó..."
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Hình ảnh sản phẩm</label>
                   
                   {/* Image Upload Area */}
                   <div className="flex flex-wrap gap-4">
                      {/* Existing Images */}
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                          <img src={`http://localhost:8080${img.url}`} className="w-full h-full object-cover" alt="product" />
                          <button 
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CloseIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* New Previews */}
                      {previews.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-emerald-200 group ring-2 ring-emerald-500/20">
                          <img src={url} className="w-full h-full object-cover" alt="preview" />
                          <button 
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CloseIcon className="w-3 h-3" />
                          </button>
                          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>
                        </div>
                      ))}

                      {/* Upload Button */}
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all text-slate-400 hover:text-emerald-600">
                         <Upload className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-bold">Thêm ảnh</span>
                         <input 
                           type="file"
                           multiple
                           accept="image/*"
                           className="hidden"
                           onChange={handleFileChange}
                         />
                      </label>
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả sản phẩm</label>
                   <textarea 
                     rows="3"
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                   />
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Hủy</button>
                   <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Lưu sản phẩm</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                   <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                   Bạn có chắc muốn xóa sản phẩm này? Tất cả dữ liệu liên quan sẽ bị gỡ bỏ và không thể khôi phục.
                </p>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setDeleteConfirmId(null)}
                     className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                   >
                     Hủy
                   </button>
                   <button 
                     onClick={handleConfirmDelete}
                     className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                   >
                     Xác nhận xóa
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

