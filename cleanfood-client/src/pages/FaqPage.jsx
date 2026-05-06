import React from 'react';
import { HelpCircle } from 'lucide-react';

const FaqPage = () => {
  const faqs = [
    {
      question: 'Tôi có cần đăng nhập để thanh toán không?',
      answer: 'Có. C Food hiện yêu cầu khách hàng đăng nhập trước khi thanh toán COD hoặc VNPay để đơn hàng được lưu đúng tài khoản.'
    },
    {
      question: 'Sản phẩm khuyến mãi được tính giá như thế nào?',
      answer: 'Nếu khuyến mãi còn hiệu lực, hệ thống dùng giá sau giảm trong giỏ hàng, khi tạo đơn và khi thanh toán.'
    },
    {
      question: 'Khi nào tôi được miễn phí vận chuyển?',
      answer: 'Đơn hàng có tổng tiền hàng từ 500.000 đ được miễn phí vận chuyển. Đơn thấp hơn mức này áp dụng phí 30.000 đ.'
    },
    {
      question: 'Tôi có thể thanh toán bằng phương thức nào?',
      answer: 'Bạn có thể chọn thanh toán khi nhận hàng COD hoặc thanh toán trực tuyến qua cổng VNPay.'
    },
    {
      question: 'Tôi xem lại đơn hàng ở đâu?',
      answer: 'Sau khi đăng nhập, bạn vào mục Đơn hàng hoặc đường dẫn /my-orders để xem danh sách đơn đã đặt.'
    },
    {
      question: 'Nếu sản phẩm bị lỗi khi nhận hàng thì làm gì?',
      answer: 'Bạn nên liên hệ C Food ngay sau khi nhận hàng, kèm thông tin đơn hàng và hình ảnh sản phẩm để được hỗ trợ xử lý.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-7 h-7" />
        </div>
        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Câu hỏi thường gặp</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-5">Những thông tin khách hàng thường cần trước khi đặt hàng.</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-3xl mx-auto">
          Tìm nhanh câu trả lời về tài khoản, giỏ hàng, thanh toán, giao hàng và hỗ trợ sau bán.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, index) => (
          <details key={item.question} className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
              <span className="text-base md:text-lg font-black text-slate-800">{item.question}</span>
              <span className="mt-1 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-black group-open:bg-emerald-600 group-open:text-white">
                {index + 1}
              </span>
            </summary>
            <p className="mt-4 text-sm md:text-base font-medium text-slate-500 leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
