User Authentication & Profile Management



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

4. get product by filters
see the image
![Screenshot 2025-03-15 at 9 22 09 AM](https://github.com/user-attachments/assets/ce7b6211-258d-4a69-bfeb-31a42f9a568b)









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

