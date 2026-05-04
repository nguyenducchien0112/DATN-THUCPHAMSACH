import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      const successMessage = response.data || 'Đã gửi email đặt lại mật khẩu';
      setMessage(successMessage);
      setSent(true);
      toast.success(successMessage);
      setEmail('');
    } catch (error) {
      const errorMessage = error.response?.data || 'Gửi yêu cầu thất bại';
      setMessage(errorMessage);
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
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quên mật khẩu</h1>
          <p className="text-slate-500 font-medium mt-1">Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 px-6 py-7">
                <p className="text-slate-900 font-bold text-lg">Email đã được gửi</p>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Chúng tôi đã gửi cho bạn một liên kết đặt lại mật khẩu đến email đã đăng ký. Vui lòng kiểm tra hộp thư đến và cả mục Spam.
                </p>
                <p className="mt-3 text-sm text-slate-500">Nếu không nhận được email trong vài phút, thử gửi lại hoặc kiểm tra lại thông tin.</p>
              </div>
              {message && (
                <div className="rounded-2xl bg-emerald-100 border border-emerald-200 px-5 py-4 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              <button
                onClick={() => {
                  setSent(false);
                  setMessage('');
                }}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold h-12 rounded-xl hover:bg-slate-50 transition-all"
              >
                Gửi lại email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email đã đăng ký</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
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

export default ForgotPasswordPage;
