import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');
  const [linkValid, setLinkValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const paramToken = searchParams.get('token') || '';
    setToken(paramToken);
    if (!paramToken) {
      setLinkValid(false);
      setLinkMessage('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu token.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      toast.success(response.data || 'Đặt lại mật khẩu thành công');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data || 'Đặt lại mật khẩu thất bại';
      setLinkValid(false);
      setLinkMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(40%_40%_at_50%_0%,rgba(16,185,129,0.05)_0%,rgba(255,255,255,0)_100%)]">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đặt lại mật khẩu</h1>
          <p className="text-slate-500 font-medium mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {linkValid ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu mới</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="rounded-3xl bg-rose-50 border border-rose-100 px-6 py-7 text-center">
              <p className="text-slate-900 font-bold text-lg">Liên kết đặt lại mật khẩu không hợp lệ</p>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {linkMessage || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không còn hợp lệ. Vui lòng yêu cầu lại từ trang đăng nhập.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <button onClick={() => navigate('/login')} className="text-emerald-600 font-black hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
