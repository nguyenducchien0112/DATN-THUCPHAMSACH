import React from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

const ContactPage = () => {
  const contacts = [
    { icon: Phone, label: 'Hotline', value: '1900 6868', text: 'Hỗ trợ tư vấn sản phẩm và đơn hàng trong giờ làm việc.' },
    { icon: Mail, label: 'Email', value: 'support@cfood.vn', text: 'Tiếp nhận yêu cầu hỗ trợ, hóa đơn và phản hồi dịch vụ.' },
    { icon: MapPin, label: 'Địa chỉ', value: 'TP.HCM, Việt Nam', text: 'Kho vận và điểm điều phối đơn hàng thực phẩm sạch.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
        <section>
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Liên hệ</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-5">C Food luôn sẵn sàng hỗ trợ đơn hàng của bạn.</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
            Gửi thông tin cho chúng tôi nếu bạn cần tư vấn sản phẩm, hỗ trợ thanh toán, giao hàng hoặc cần xử lý vấn đề sau khi nhận hàng.
          </p>

          <div className="space-y-4">
            {contacts.map((item) => (
              <div key={item.label} className="bg-white border border-slate-100 rounded-3xl p-6 flex gap-5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <h2 className="text-lg font-black text-slate-800 mb-1">{item.value}</h2>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gửi yêu cầu hỗ trợ</h2>
              <p className="text-sm font-semibold text-slate-400">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Họ tên</label>
                <input className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500" placeholder="Nguyen Van A" />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                <input className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500" placeholder="09xx..." />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</label>
              <input type="email" className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500" placeholder="your-email@gmail.com" />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung</label>
              <textarea rows="5" className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500" placeholder="Bạn cần C Food hỗ trợ điều gì?" />
            </div>
            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all">
              Gửi liên hệ
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
