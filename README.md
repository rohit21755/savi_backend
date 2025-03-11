User Authentication & Profile Management

1. User Registration

Route: POST /api/auth/register
Middleware: None
Body:

{
  "name": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}

Response: User created confirmation or error message.

2. User Login

Route: POST /api/auth/login
Middleware: None
Body:

{
  "email": "string",
  "password": "string"
}

Response: JWT token & user details.

3. User Profile Update

Route: PUT /api/user/profile
Middleware: authMiddleware
Body:

{
  "name": "string",
  "phoneNumber": "string",
  "address": "string"
}

Response: Updated user details.

Product & Shopping Features

4. Get All Products

Route: GET /api/products
Middleware: None
Query Parameters (Optional):

categoryId (integer) - Filter by category

sale (boolean) - Filter by sale items

new (boolean) - Filter by new arrivals

minPrice, maxPrice (float) - Price range filter

5. Get Single Product

Route: GET /api/products/:id
Middleware: None
Response: Product details.

6. Add to Cart

Route: POST /api/cart
Middleware: authMiddleware
Body:

{
  "productId": "integer",
  "quantity": "integer"
}

Response: Cart updated confirmation.

7. View Cart

Route: GET /api/cart
Middleware: authMiddleware
Response: Cart details.

8. Remove from Cart

Route: DELETE /api/cart/:id
Middleware: authMiddleware
Response: Cart updated confirmation.

9. Wishlist Management

Route: POST /api/wishlist
Middleware: authMiddleware
Body:

{
  "productId": "integer"
}

Response: Wishlist updated.

10. Like/Dislike Product

Route: POST /api/products/like
Middleware: authMiddleware
Body:

{
  "productId": "integer",
  "like": "boolean"
}

Response: Success message.

11. Share Product

Route: POST /api/products/share
Middleware: authMiddleware
Body:

{
  "productId": "integer",
  "platform": "string"
}

Response: Share link.

Order & Payment

12. Place an Order

Route: POST /api/order
Middleware: authMiddleware
Body:

{
  "cart": [{ "productId": "integer", "quantity": "integer" }],
  "paymentMethod": "string",
  "address": "string"
}

Response: Order confirmation.

13. Get User Orders

Route: GET /api/order
Middleware: authMiddleware
Response: List of orders.

14. Payment Processing

Route: POST /api/payment
Middleware: authMiddleware
Body:

{
  "orderId": "integer",
  "paymentDetails": "object"
}

Response: Payment success or failure.

Admin Features

15. Admin Login

Route: POST /api/admin/login
Middleware: None
Body:

{
  "email": "string",
  "password": "string"
}

Response: JWT token & admin details.

16. Add Product

Route: POST /api/admin/product
Middleware: adminAuthMiddleware
Body:

{
  "name": "string",
  "type": "string",
  "originalPrice": "float",
  "sale": "boolean",
  "salePrice": "float",
  "quantity": "integer",
  "sizes": ["string"],
  "description": "string",
  "categoryId": "integer"
}

Response: Product added confirmation.

17. Remove Product

Route: DELETE /api/admin/product/:id
Middleware: adminAuthMiddleware
Response: Product deleted confirmation.

18. Put Product on Sale

Route: PUT /api/admin/product/sale/:id
Middleware: adminAuthMiddleware
Body:

{
  "sale": "boolean",
  "salePrice": "float"
}

Response: Sale updated confirmation.

19. View All Orders

Route: GET /api/admin/orders
Middleware: adminAuthMiddleware
Response: List of all orders.

20. Confirm Order

Route: PUT /api/admin/order/confirm/:id
Middleware: adminAuthMiddleware
Response: Order confirmation message.

Additional Features

21. Filter Products

Route: GET /api/products/filter
Middleware: None
Query Parameters:

categoryId (integer)

sale (boolean)

minPrice, maxPrice (float)

new (boolean)

Response: Filtered product list.

Middleware

authMiddleware: Ensures the user is authenticated.

adminAuthMiddleware: Ensures the user is an admin.

validateRequestMiddleware: Validates request body data.

This API documentation provides all the required endpoints for both user and admin functionalities, ensuring a complete backend system for the clothing eCommerce platform.