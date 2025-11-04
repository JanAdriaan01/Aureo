import { Resend } from 'resend';

// ONLY THIS ONE LINE - remove any duplicate
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

    // Create email content
    const emailHtml = `
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🛍️ New Order Received - Modahaus</h2>
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

    <div class="section">
      <p><strong>💡 Action Required:</strong> Please contact the customer to confirm order details and arrange delivery.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Modahaus Orders <orders@modahaus.co.za>',
      to: ['info@modahaus.co.za'],
      subject: `New Order: ${order.systemName} - R ${order.subtotal?.toLocaleString() || '0'}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Order email sent successfully',
      data 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}