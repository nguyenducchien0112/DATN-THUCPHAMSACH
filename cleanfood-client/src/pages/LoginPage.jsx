import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import useAuth from '../stores/useAuth';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    if (result.success) {
      toast.success('Đăng nhập thành công!');
      // Luân chuyển logic chuyển hướng dựa trên vai trò
      if (result.user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
      toast.error(result.message || 'Đăng nhập thất bại!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(40%_40%_at_50%_0%,rgba(16,185,129,0.05)_0%,rgba(255,255,255,0)_100%)]">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
             <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
             </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chào mừng trở lại</h1>
          <p className="text-slate-500 font-medium mt-1">Đăng nhập để trải nghiệm thực phẩm sạch</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                  placeholder="admin_cleanfood"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-[13px] font-medium animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
            >
              {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-400 text-xs font-medium">© 2026 CleanFood - Thực phẩm sạch cho mọi nhà</p>
          <div className="pt-4 border-t border-slate-100">
             <p className="text-[13px] font-bold text-slate-500">Bạn chưa có tài khoản?</p>
             <button 
               onClick={() => navigate('/register')}
               className="text-[13px] font-black text-emerald-600 hover:underline mt-1"
             >
                Đăng ký ngay
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
