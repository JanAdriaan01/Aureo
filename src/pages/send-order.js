import { Resend } from 'resend';

const resend = new Resend(process.env.Resend_API_KEY);

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported' 
    });
  }

  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { order, customerInfo = {} } = req.body;

    console.log('📧 Received order request:', { order, customerInfo });

    // Enhanced environment variable check
    if (!process.env.Resend_API_KEY) {
      console.error('❌ Resend_API_KEY environment variable is missing');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error',
        message: 'Email service is not properly configured'
      });
    }

    console.log('🔑 API Key available, length:', process.env.Resend_API_KEY?.length);

    // Validate required fields
    if (!order || !order.systemName) {
      return res.status(400).json({ 
        error: 'Missing order information',
        message: 'Product details are required' 
      });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // ====== EMAIL TO MODAHAUS ======
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
        <tr><th>Source</th><td>${customerInfo.source || 'Website'}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
    `;

    console.log('📤 Attempting to send admin email...');
    
    // Send email to Modahaus
    const adminEmail = await resend.emails.send({
      from: 'Modahaus Orders <orders@modahaus.co.za>',
      to: ['orders@modahaus.co.za'],
      subject: `NEW ORDER [${orderId}]: ${order.systemName}`,
      html: adminEmailHtml,
    });

    if (adminEmail.error) {
      console.error('❌ Resend error (admin):', adminEmail.error);
      console.error('❌ Admin email failure details:', {
        code: adminEmail.error.code,
        message: adminEmail.error.message,
        statusCode: adminEmail.error.statusCode
      });
      throw new Error(`Admin email failed: ${adminEmail.error.message}`);
    }

    console.log('✅ Admin email sent successfully:', adminEmail.data?.id);

    // Send email to client if email provided
    let clientEmail = null;
    const shouldSendClientEmail = customerInfo.email && 
                                 customerInfo.email !== 'Not provided' && 
                                 customerInfo.email.includes('@') &&
                                 customerInfo.email !== 'orders@modahaus.co.za';

    if (shouldSendClientEmail) {
      console.log('📤 Attempting to send client email to:', customerInfo.email);
      
      const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .bank-details { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Order Confirmed - Modahaus</h2>
      <p>Thank you for your order <strong>${orderId}</strong>!</p>
    </div>
    
    <h3>Order Summary:</h3>
    <p><strong>${order.systemName}</strong></p>
    <ul>
      <li>Size: ${order.size}</li>
      <li>Glazing: ${order.glazing}</li>
      <li>Finish: ${order.finish}</li>
      <li>Quantity: ${order.quantity}</li>
      <li><strong>Total: R ${order.subtotal?.toLocaleString() || '0'}</strong></li>
    </ul>

    <div class="bank-details">
      <h3>Payment Instructions:</h3>
      <p>Please make payment via EFT within 72 hours:</p>
      <ul>
        <li><strong>Bank:</strong> FNB</li>
        <li><strong>Account Name:</strong> Modahaus (Pty) Ltd</li>
        <li><strong>Account Number:</strong> 62012345678</li>
        <li><strong>Reference:</strong> ${orderId}</li>
        <li><strong>Amount:</strong> R ${order.subtotal?.toLocaleString() || '0'}</li>
      </ul>
    </div>
    
    <p><strong>Important:</strong> Orders not paid within 72 hours are automatically cancelled.</p>
    <p>Once payment reflects, we will contact you to arrange installation.</p>
    
    <p>Thank you for choosing Modahaus!</p>
  </div>
</body>
</html>
      `;

      clientEmail = await resend.emails.send({
        from: 'Modahaus Orders <orders@modahaus.co.za>',
        to: [customerInfo.email],
        subject: `Order Confirmation [${orderId}] - Modahaus`,
        html: clientEmailHtml,
      });

      if (clientEmail.error) {
        console.error('❌ Resend error (client):', clientEmail.error);
        console.error('❌ Client email failure details:', {
          code: clientEmail.error.code,
          message: clientEmail.error.message,
          statusCode: clientEmail.error.statusCode,
          recipient: customerInfo.email
        });
        // Continue even if client email fails - don't throw error
      } else {
        console.log('✅ Client email sent successfully:', clientEmail.data?.id);
      }
    } else {
      console.log('ℹ️  No client email sent - reason:', 
        !customerInfo.email ? 'No email provided' :
        customerInfo.email === 'Not provided' ? 'Email marked as not provided' :
        customerInfo.email === 'orders@modahaus.co.za' ? 'Email is orders address' :
        'Email invalid'
      );
    }

    console.log('🎉 Order processing completed successfully');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Order processed successfully',
      orderId: orderId,
      emails: {
        admin: { 
          id: adminEmail.data?.id,
          sent: true
        },
        client: clientEmail ? { 
          id: clientEmail.data?.id,
          sent: true,
          recipient: customerInfo.email
        } : {
          sent: false,
          reason: !shouldSendClientEmail ? 'No valid client email provided' : 'Sending failed'
        }
      }
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    console.error('💥 Environment variable available:', !!process.env.Resend_API_KEY);
    console.error('💥 API Key length:', process.env.Resend_API_KEY?.length);
    console.error('💥 Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process order',
      message: error.message,
      details: {
        envVarSet: !!process.env.Resend_API_KEY,
        envVarLength: process.env.Resend_API_KEY?.length,
        errorType: error.constructor.name
      }
    });
  }
}