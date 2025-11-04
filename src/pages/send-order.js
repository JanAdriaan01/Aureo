import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  try {
    const { order, customerInfo = {} } = req.body;

    // Validate required fields
    if (!order || !order.systemName) {
      return res.status(400).json({ error: 'Missing order information' });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // ====== EMAIL TO MODAHAUS (YOU) ======
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .total { font-size: 1.2em; font-weight: bold; color: #000; }
    .urgent { background: #fff5f5; border-left: 4px solid #e53e3e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🛍️ New Order Received - Modahaus</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Order Time:</strong> ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</p>
    </div>
    
    <div class="section">
      <h3>📦 Order Details</h3>
      <table>
        <tr><th>Product</th><td>${order.systemName}</td></tr>
        <tr><th>Size</th><td>${order.size}</td></tr>
        <tr><th>Glazing</th><td>${order.glazing}</td></tr>
        <tr><th>Finish</th><td>${order.finish}</td></tr>
        <tr><th>Quantity</th><td>${order.quantity}</td></tr>
        <tr><th>Unit Price</th><td>R ${order.price?.toLocaleString() || '0'}</td></tr>
        <tr class="total"><th>Subtotal</th><td>R ${order.subtotal?.toLocaleString() || '0'}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>👤 Customer Information</h3>
      <table>
        <tr><th>Name</th><td>${customerInfo.name || 'Not provided'}</td></tr>
        <tr><th>Email</th><td>${customerInfo.email || 'Not provided'}</td></tr>
        <tr><th>Phone</th><td>${customerInfo.phone || 'Not provided'}</td></tr>
        <tr><th>Address</th><td>${customerInfo.address || 'Not provided'}</td></tr>
      </table>
    </div>

    <div class="section urgent">
      <p><strong>🚀 Action Required:</strong> Please contact the customer to confirm order details and arrange delivery.</p>
    </div>
  </div>
</body>
</html>
    `;

    // ====== EMAIL TO CLIENT ======
    const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1a365d; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #1a365d; }
    .bank-section { background: #f0f8ff; border-left: 4px solid #007bff; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; background: white; border-radius: 6px; overflow: hidden; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background-color: #edf2f7; font-weight: 600; color: #2d3748; width: 35%; }
    .total-row { background: #1a365d; color: white; font-weight: bold; }
    .total-row td { border-bottom: none; font-size: 16px; }
    .footer { text-align: center; padding: 20px; background: #f7fafc; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed - Modahaus</h1>
      <p>Thank you for your order!</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>📦 Your Order Summary</h3>
        <table>
          <tr><th>Order Number</th><td>${orderId}</td></tr>
          <tr><th>Order Date</th><td>${new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          <tr><th>Product</th><td>${order.systemName}</td></tr>
          <tr><th>Size</th><td>${order.size} mm</td></tr>
          <tr><th>Glazing</th><td>${order.glazing}</td></tr>
          <tr><th>Frame Finish</th><td>${order.finish}</td></tr>
          <tr><th>Quantity</th><td>${order.quantity}</td></tr>
          <tr><th>Unit Price</th><td>R ${order.price?.toLocaleString('en-ZA') || '0'}</td></tr>
          <tr class="total-row"><th>Total Amount</th><td>R ${order.subtotal?.toLocaleString('en-ZA') || '0'}</td></tr>
        </table>
      </div>

      <div class="section bank-section">
        <h3>💰 Payment Instructions</h3>
        <p><strong>Please make payment via EFT within 72 hours to secure your order:</strong></p>
        <table>
          <tr><th>Bank</th><td>FNB</td></tr>
          <tr><th>Account Name</th><td>Modahaus (Pty) Ltd</td></tr>
          <tr><th>Account Number</th><td>62012345678</td></tr>
          <tr><th>Branch Code</th><td>250655</td></tr>
          <tr><th>Reference</th><td>${orderId}</td></tr>
          <tr><th>Amount Due</th><td>R ${order.subtotal?.toLocaleString('en-ZA') || '0'}</td></tr>
        </table>
        <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
          ⚠️ <strong>Important:</strong> Orders not paid within 72 hours are automatically cancelled.
        </p>
      </div>

      <div class="section">
        <h3>📞 Next Steps</h3>
        <p>Once payment is received, we will:</p>
        <ul>
          <li>Confirm your order in our system</li>
          <li>Schedule manufacturing (10-20 working days)</li>
          <li>Contact you to arrange delivery/installation</li>
          <li>Send you a payment confirmation receipt</li>
        </ul>
        
        <p style="margin-top: 15px;">
          <strong>Need help?</strong><br>
          📞 Phone: +27 (0) 61 193 3931<br>
          📧 Email: info@modahaus.co.za
        </p>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing Modahaus Aluminium Systems</p>
      <p>© ${new Date().getFullYear()} Modahaus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email to Modahaus (you)
    const adminEmail = await resend.emails.send({
      from: 'Modahaus Orders <orders@modahaus.co.za>',
      to: ['info@modahaus.co.za'],
      subject: `NEW ORDER [${orderId}]: ${order.systemName} - R ${order.subtotal?.toLocaleString() || '0'}`,
      html: adminEmailHtml,
    });

    if (adminEmail.error) {
      console.error('Resend error (admin):', adminEmail.error);
      return res.status(500).json({ error: 'Failed to send admin email' });
    }

    // Send email to client (if email provided)
    let clientEmail = null;
    if (customerInfo.email && customerInfo.email !== 'Not provided') {
      clientEmail = await resend.emails.send({
        from: 'Modahaus Orders <orders@modahaus.co.za>',
        to: [customerInfo.email],
        subject: `Order Confirmation [${orderId}] - Modahaus Aluminium Systems`,
        html: clientEmailHtml,
      });

      if (clientEmail.error) {
        console.error('Resend error (client):', clientEmail.error);
        // Don't fail the entire request if client email fails
      }
    }

    console.log('Emails sent successfully:', { 
      admin: adminEmail.data,
      client: clientEmail?.data 
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Order emails sent successfully',
      orderId: orderId,
      emails: {
        admin: adminEmail.data,
        client: clientEmail?.data
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}