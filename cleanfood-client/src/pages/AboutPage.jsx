import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react';

const AboutPage = () => {
  const values = [
    { icon: Leaf, title: 'Tươi sạch mỗi ngày', text: 'Sản phẩm được chọn lọc theo ngày, ưu tiên nguồn hàng còn mới và rõ mùa vụ.' },
    { icon: ShieldCheck, title: 'Nguồn gốc minh bạch', text: 'Mỗi mặt hàng đều được quản lý thông tin xuất xứ, đơn vị tính, tồn kho và tiêu chuẩn chất lượng.' },
    { icon: Truck, title: 'Giao hàng đúng hẹn', text: 'Đơn hàng được xử lý nhanh, đóng gói phù hợp để giữ độ tươi trong quá trình vận chuyển.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center mb-20">
        <div>
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Về chúng tôi</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-6">
            C Food đưa thực phẩm sạch đến gần hơn với bữa ăn gia đình.
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
            Chúng tôi xây dựng cửa hàng thực phẩm sạch với trọng tâm là chất lượng, sự minh bạch và trải nghiệm mua sắm thuận tiện. Mỗi sản phẩm được cập nhật thông tin rõ ràng để khách hàng dễ chọn đúng nhu cầu.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all"
          >
            Khám phá sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="aspect-[4/3] rounded-[32px] overflow-hidden bg-slate-100 shadow-xl shadow-emerald-500/5">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1400"
            alt="Thực phẩm sạch tại C Food"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {values.map((item) => (
          <div key={item.title} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <item.icon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-3">{item.title}</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <div>
            <Sprout className="w-10 h-10 text-emerald-600 mb-5" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cách chúng tôi vận hành</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-medium text-slate-500 leading-relaxed">
            <p>Đội ngũ C Food ưu tiên nhập hàng từ các nguồn cung ổn định, có thông tin xuất xứ rõ ràng và phù hợp tiêu chuẩn an toàn thực phẩm.</p>
            <p>Hệ thống bán hàng được thiết kế để khách dễ theo dõi giá, khuyến mãi, tồn kho, trạng thái đơn hàng và phương thức thanh toán.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
