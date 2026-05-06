# 3.3. Kiểm thử chức năng

## 3.3.1. Kiểm thử chức năng Đăng ký tài khoản

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| DK01 | Đăng ký tài khoản với thông tin hợp lệ | Username: `customer01`; Password: `123456`; Họ tên: `Nguyễn Văn A`; Email: `a@gmail.com`; SĐT: `0912345678` | Hệ thống tạo tài khoản thành công và hiển thị thông báo đăng ký thành công |
| DK02 | Đăng ký với username đã tồn tại | Username đã có trong hệ thống; các thông tin khác hợp lệ | Hệ thống không tạo tài khoản và thông báo tên đăng nhập đã tồn tại |
| DK03 | Đăng ký khi bỏ trống thông tin bắt buộc | Bỏ trống username hoặc password | Hệ thống yêu cầu nhập đầy đủ thông tin bắt buộc |
| DK04 | Đăng ký với email không hợp lệ | Email: `abcgmail.com` | Hệ thống thông báo email không hợp lệ |

## 3.3.2. Kiểm thử chức năng Đăng nhập

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| DN01 | Đăng nhập với tài khoản hợp lệ | Username: `customer01`; Password: `123456` | Đăng nhập thành công, hệ thống chuyển về trang chủ và lưu token đăng nhập |
| DN02 | Đăng nhập sai mật khẩu | Username đúng; Password sai | Hệ thống không cho đăng nhập và hiển thị thông báo lỗi |
| DN03 | Đăng nhập với tài khoản không tồn tại | Username chưa đăng ký; Password bất kỳ | Hệ thống thông báo tài khoản hoặc mật khẩu không đúng |
| DN04 | Đăng nhập khi bỏ trống thông tin | Username rỗng hoặc password rỗng | Hệ thống yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu |

## 3.3.3. Kiểm thử chức năng Quên mật khẩu

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| QMK01 | Gửi yêu cầu đặt lại mật khẩu với email đã đăng ký | Email: `a@gmail.com` | Hệ thống ghi nhận yêu cầu và gửi liên kết đặt lại mật khẩu |
| QMK02 | Gửi yêu cầu với email chưa đăng ký | Email: `notfound@gmail.com` | Hệ thống thông báo email không đúng hoặc chưa đăng ký |
| QMK03 | Đặt lại mật khẩu với token hợp lệ | Token hợp lệ; Mật khẩu mới: `12345678` | Hệ thống cập nhật mật khẩu mới thành công |
| QMK04 | Đặt lại mật khẩu với token hết hạn hoặc không hợp lệ | Token sai hoặc hết hạn | Hệ thống từ chối yêu cầu và thông báo token không hợp lệ hoặc đã hết hạn |

## 3.3.4. Kiểm thử chức năng Xem danh sách sản phẩm

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| SP01 | Xem danh sách sản phẩm | Truy cập trang sản phẩm | Hệ thống hiển thị danh sách sản phẩm gồm tên, ảnh, giá và thông tin cơ bản |
| SP02 | Xem chi tiết sản phẩm | Chọn một sản phẩm bất kỳ | Hệ thống hiển thị chi tiết sản phẩm, ảnh, mô tả, giá, tồn kho và danh mục |
| SP03 | Tìm kiếm sản phẩm theo từ khóa | Từ khóa: `rau` | Hệ thống hiển thị các sản phẩm phù hợp với từ khóa |
| SP04 | Lọc sản phẩm theo danh mục | Danh mục: `Rau củ` | Hệ thống chỉ hiển thị sản phẩm thuộc danh mục đã chọn |

## 3.3.5. Kiểm thử chức năng Giỏ hàng

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| GH01 | Thêm sản phẩm vào giỏ hàng | Chọn sản phẩm và số lượng hợp lệ | Sản phẩm được thêm vào giỏ hàng với đúng số lượng |
| GH02 | Cập nhật số lượng sản phẩm trong giỏ | Tăng hoặc giảm số lượng sản phẩm | Hệ thống cập nhật số lượng và tính lại tổng tiền |
| GH03 | Xóa sản phẩm khỏi giỏ hàng | Chọn nút xóa sản phẩm | Sản phẩm bị xóa khỏi giỏ hàng |
| GH04 | Thêm số lượng vượt quá tồn kho | Số lượng lớn hơn tồn kho hiện có | Hệ thống không cho thêm hoặc thông báo số lượng không hợp lệ |

## 3.3.6. Kiểm thử chức năng Đặt hàng

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| DH01 | Đặt hàng COD với thông tin hợp lệ | Giỏ hàng có sản phẩm; Địa chỉ giao hàng hợp lệ; Phương thức: COD | Hệ thống tạo đơn hàng thành công và trả về mã đơn hàng |
| DH02 | Đặt hàng khi giỏ hàng rỗng | Giỏ hàng không có sản phẩm | Hệ thống không cho đặt hàng và thông báo giỏ hàng rỗng |
| DH03 | Đặt hàng khi thiếu địa chỉ giao hàng | Địa chỉ giao hàng rỗng | Hệ thống yêu cầu nhập địa chỉ giao hàng |
| DH04 | Đặt hàng với tổng tiền trên 500.000 VNĐ | Tổng tiền sản phẩm lớn hơn 500.000 VNĐ | Hệ thống miễn phí vận chuyển |

## 3.3.7. Kiểm thử chức năng Lịch sử đơn hàng

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| LSDH01 | Xem danh sách đơn hàng của người dùng | Người dùng đã đăng nhập | Hệ thống hiển thị các đơn hàng của đúng người dùng đó |
| LSDH02 | Hủy đơn hàng đang chờ xử lý | Đơn hàng có trạng thái `PENDING` | Hệ thống cập nhật trạng thái đơn hàng thành `CANCELLED` |
| LSDH03 | Hủy đơn hàng không còn chờ xử lý | Đơn hàng có trạng thái `SHIPPING` hoặc `COMPLETED` | Hệ thống không cho hủy đơn hàng |
| LSDH04 | Xem lịch sử khi chưa có đơn hàng | Tài khoản chưa từng đặt hàng | Hệ thống hiển thị danh sách rỗng hoặc thông báo chưa có đơn hàng |

## 3.3.8. Kiểm thử chức năng Quản lý sản phẩm

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| QLSP01 | Thêm sản phẩm mới | Tên, mô tả, giá, tồn kho, danh mục, ảnh hợp lệ | Sản phẩm được thêm thành công và hiển thị trong danh sách |
| QLSP02 | Cập nhật thông tin sản phẩm | Thay đổi tên, giá hoặc số lượng tồn kho | Hệ thống cập nhật thông tin sản phẩm thành công |
| QLSP03 | Xóa sản phẩm | Chọn một sản phẩm cần xóa | Hệ thống xóa sản phẩm khỏi danh sách |
| QLSP04 | Thêm sản phẩm thiếu thông tin bắt buộc | Bỏ trống tên hoặc giá sản phẩm | Hệ thống không cho lưu và thông báo nhập đầy đủ thông tin |

## 3.3.9. Kiểm thử chức năng Quản lý danh mục

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| QLDM01 | Thêm danh mục mới | Tên danh mục và mô tả hợp lệ | Danh mục được thêm thành công |
| QLDM02 | Cập nhật danh mục | Thay đổi tên hoặc mô tả danh mục | Hệ thống cập nhật danh mục thành công |
| QLDM03 | Xóa danh mục | Chọn danh mục cần xóa | Hệ thống xóa danh mục khỏi danh sách |
| QLDM04 | Thêm danh mục trùng tên | Tên danh mục đã tồn tại | Hệ thống thông báo danh mục đã tồn tại hoặc không cho thêm mới |

## 3.3.10. Kiểm thử chức năng Quản lý đơn hàng

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| QLDH01 | Xem danh sách đơn hàng | Tài khoản quản trị truy cập trang quản lý đơn hàng | Hệ thống hiển thị danh sách đơn hàng |
| QLDH02 | Cập nhật trạng thái đơn hàng sang đang giao | Trạng thái mới: `SHIPPING` | Hệ thống cập nhật trạng thái đơn hàng thành công |
| QLDH03 | Cập nhật trạng thái đơn hàng sang hoàn thành | Trạng thái mới: `COMPLETED` | Hệ thống cập nhật trạng thái và trừ tồn kho một lần |
| QLDH04 | Cập nhật trạng thái khi tồn kho không đủ | Số lượng trong đơn lớn hơn tồn kho sản phẩm | Hệ thống không cho hoàn thành đơn và thông báo tồn kho không đủ |

## 3.3.11. Kiểm thử chức năng Quản lý người dùng

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| QLND01 | Xem danh sách người dùng | Tài khoản quản trị truy cập trang quản lý người dùng | Hệ thống hiển thị danh sách người dùng |
| QLND02 | Khóa hoặc mở khóa tài khoản | Chọn một người dùng và thay đổi trạng thái hoạt động | Hệ thống cập nhật trạng thái tài khoản thành công |
| QLND03 | Cập nhật thông tin người dùng | Thay đổi họ tên, email, số điện thoại hoặc địa chỉ | Hệ thống cập nhật thông tin người dùng thành công |
| QLND04 | Xóa người dùng | Chọn người dùng cần xóa | Hệ thống xóa người dùng khỏi danh sách |

## 3.3.12. Kiểm thử chức năng Thống kê

| ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi |
| --- | --- | --- | --- |
| TK01 | Xem thống kê tổng quan | Tài khoản quản trị truy cập trang dashboard | Hệ thống hiển thị số lượng người dùng, sản phẩm, đơn hàng và doanh thu |
| TK02 | Thống kê doanh thu | Có đơn hàng trạng thái `COMPLETED` | Hệ thống tính tổng doanh thu từ các đơn hàng đã hoàn thành |
| TK03 | Thống kê đơn hàng theo trạng thái | Có các đơn hàng với nhiều trạng thái khác nhau | Hệ thống hiển thị đúng số lượng đơn theo từng trạng thái |
| TK04 | Không có dữ liệu thống kê | Hệ thống chưa có đơn hàng hoàn thành | Hệ thống hiển thị doanh thu bằng 0 hoặc dữ liệu rỗng phù hợp |
