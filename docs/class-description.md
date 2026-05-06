# Mô tả lớp, thuộc tính và phương thức

## 2.4.1. Lớp User

Thuộc tính:

- Id
- Username
- Password
- FullName
- Email
- Phone
- Address
- ResetPasswordToken
- ResetPasswordExpiresAt
- Role
- IsActive

Phương thức:

- Login()
- Logout()
- Register()
- ForgotPassword()
- ResetPassword()

## 2.4.2. Lớp Role

Thuộc tính:

- ROLE_ADMIN
- ROLE_CUSTOMER

Phương thức:

- values()
- valueOf()

## 2.4.3. Lớp Category

Thuộc tính:

- Id
- Name
- Description
- Products

Phương thức:

- AddCategory()
- UpdateCategory()
- DeleteCategory()
- GetProductCount()

## 2.4.4. Lớp Product

Thuộc tính:

- Id
- Name
- Description
- Price
- DiscountPercent
- DiscountedPrice
- PromotionStartDate
- PromotionEndDate
- Images
- StockQuantity
- Origin
- Unit
- Category

Phương thức:

- GetAllProducts()
- GetProductById()
- SaveProduct()
- DeleteProduct()

## 2.4.5. Lớp ProductImage

Thuộc tính:

- Id
- Url
- Product

Phương thức:

- AddImage()
- DeleteImage()

## 2.4.6. Lớp CartItem

Thuộc tính:

- Id
- User
- Product
- Quantity

Phương thức:

- AddToCart()
- UpdateQuantity()
- RemoveFromCart()
- ClearCart()

## 2.4.7. Lớp Order

Thuộc tính:

- Id
- Customer
- GuestEmail
- OrderDate
- TotalAmount
- Status
- ShippingAddress
- PaymentMethod
- Paid
- StockDeducted
- Items

Phương thức:

- CreateOrder()
- CreateGuestOrder()
- GetAllOrders()
- GetOrdersByUser()
- UpdateOrderStatus()
- CancelOrder()
- OnCreate()

## 2.4.8. Lớp OrderItem

Thuộc tính:

- Id
- Order
- Product
- Quantity
- Price

Phương thức:

- CalculateItemTotal()

## 2.4.9. Lớp OrderStatus

Thuộc tính:

- PENDING
- SHIPPING
- COMPLETED
- CANCELLED

Phương thức:

- values()
- valueOf()
