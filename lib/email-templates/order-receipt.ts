export const getOrderReceiptTemplate = (order: any) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const orderItems = order.orderItems.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EEE;">
        ${item.variant.product.name} - ${item.variant.name}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: right;">
        ${formatPrice(item.price)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Receipt</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #EEE;
          }
          .order-info {
            margin: 20px 0;
            padding: 20px;
            background: #F8F8F8;
            border-radius: 5px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th {
            background: #F8F8F8;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #EEE;
          }
          .total {
            margin-top: 20px;
            text-align: right;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #EEE;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Order #${order.id}</p>
          </div>

          <div class="order-info">
            <h3>Shipping Information</h3>
            <p>${order.address}</p>
            <p>Phone: ${order.phone}</p>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems}
            </tbody>
          </table>

          <div class="total">
            <p>Subtotal: ${formatPrice(order.totalAmount)}</p>
            ${order.emailDiscount > 0 ? `<p>Email Discount: -${formatPrice(order.emailDiscount)}</p>` : ''}
            ${order.customerDiscount > 0 ? `<p>Customer Discount: -${formatPrice(order.customerDiscount)}</p>` : ''}
            ${order.couponDiscount > 0 ? `<p>Coupon Discount: -${formatPrice(order.couponDiscount)}</p>` : ''}
            <h3>Final Total: ${formatPrice(order.finalAmount)}</h3>
          </div>

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>If you have any questions, please contact our customer support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
