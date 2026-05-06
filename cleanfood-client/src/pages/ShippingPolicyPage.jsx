import React from 'react';
import { Clock, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';

const ShippingPolicyPage = () => {
  const policies = [
    { icon: Truck, title: 'Phạm vi giao hàng', text: 'C Food ưu tiên giao hàng nội thành và các khu vực có thể đảm bảo thời gian vận chuyển phù hợp cho thực phẩm tươi.' },
    { icon: Clock, title: 'Thời gian xử lý', text: 'Đơn hàng được xác nhận và chuẩn bị trong giờ làm việc. Các đơn phát sinh ngoài giờ sẽ được xử lý vào ca tiếp theo.' },
    { icon: PackageCheck, title: 'Đóng gói', text: 'Sản phẩm được phân loại, đóng gói theo nhóm hàng để hạn chế dập nát, rò rỉ hoặc ảnh hưởng chất lượng.' },
    { icon: ShieldCheck, title: 'Kiểm tra khi nhận', text: 'Khách hàng có thể kiểm tra tình trạng hàng hóa khi nhận và phản hồi ngay nếu sản phẩm không đúng đơn.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Chính sách giao hàng</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-5">Giao hàng rõ ràng, nhanh và giữ đúng chất lượng sản phẩm.</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Chính sách này giúp khách hàng nắm được cách C Food chuẩn bị, vận chuyển và xử lý đơn hàng trước khi sản phẩm đến tay người nhận.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        {policies.map((item) => (
          <div key={item.title} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <item.icon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-3">{item.title}</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 bg-white border border-slate-100 rounded-[32px] p-8 md:p-12">
        <div>
          <MapPin className="w-10 h-10 text-emerald-600 mb-5" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Phí vận chuyển</h2>
        </div>
        <div className="space-y-4 text-sm font-medium text-slate-500 leading-relaxed">
          <p>Đơn hàng từ 500.000 đ được miễn phí vận chuyển theo chính sách hiện tại của hệ thống.</p>
          <p>Đơn hàng dưới 500.000 đ áp dụng phí vận chuyển 30.000 đ. Phí này được hiển thị tại trang giỏ hàng trước khi khách xác nhận thanh toán.</p>
          <p>Trong trường hợp địa chỉ nằm ngoài khu vực phục vụ, nhân viên sẽ liên hệ để xác nhận phương án giao hàng phù hợp.</p>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicyPage;
