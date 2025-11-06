// api/order-email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;      // <-- all caps
const EMAIL_FROM = process.env.EMAIL_FROM || 'orders@modahaus.co.za';
const EMAIL_BUSINESS = process.env.EMAIL_BUSINESS || 'orders@modahaus.co.za';

const resend = new Resend(RESEND_API_KEY as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (keep if you’re posting from another origin or the browser)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    if (!RESEND_API_KEY) {
      // Don’t log key details in prod
      return res.status(500).json({ ok: false, error: 'Missing RESEND_API_KEY on server' });
    }

    // Ensure the client sent JSON
    if (req.headers['content-type']?.includes('application/json') !== true) {
      return res.status(400).json({ ok: false, error: 'Content-Type must be application/json' });
    }

    const { order, customerInfo = {} } = req.body ?? {};
    if (!order || !order.systemName) {
      return res.status(400).json({ ok: false, error: 'Missing order.systemName' });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const adminHtml = `
      <h2>New Order – ${orderId}</h2>
      <p><b>Product:</b> ${order.systemName}</p>
      <p><b>Size:</b> ${order.size} | <b>Glazing:</b> ${order.glazing} | <b>Finish:</b> ${order.finish}</p>
      <p><b>Qty:</b> ${order.quantity} | <b>Total:</b> R ${Number(order.subtotal ?? 0).toLocaleString('en-ZA')}</p>
      <hr/>
      <h3>Customer</h3>
      <p><b>Name:</b> ${customerInfo.name || '—'}<br/>
      <b>Email:</b> ${customerInfo.email || '—'}<br/>
      <b>Phone:</b> ${customerInfo.phone || '—'}<br/>
      <b>Address:</b> ${customerInfo.address || '—'}</p>
    `;

    // Send to business
    const adminSend = await resend.emails.send({
      from: `Modahaus Orders <${EMAIL_FROM}>`,
      to: [EMAIL_BUSINESS],
      subject: `NEW ORDER [${orderId}]: ${order.systemName}`,
      html: adminHtml,
    });
    if (adminSend.error) {
      return res.status(500).json({ ok: false, error: `Admin email failed: ${adminSend.error.message}` });
    }

    // Optional: send to client if valid email present
    const clientEmail = (customerInfo.email ?? '').trim();
    if (clientEmail && clientEmail.includes('@') && clientEmail.toLowerCase() !== EMAIL_BUSINESS.toLowerCase()) {
      const clientHtml = `
        <h2>Order Confirmation – ${orderId}</h2>
        <p>Thank you for your order of <b>${order.systemName}</b>.</p>
        <p><b>Total:</b> R ${Number(order.subtotal ?? 0).toLocaleString('en-ZA')}</p>
        <h3>Payment (EFT)</h3>
        <p><b>Bank:</b> Standard Bank<br/>
        <b>Account:</b> Modahaus (Pty) Ltd<br/>
        <b>Account No:</b> 10256640074<br/>
        <b>SWIFT:</b> SBZAZAJJ<br/>
        <b>Reference:</b> ${orderId}</p>
        <p>We’ll contact you after payment reflects.</p>
      `;

      const clientSend = await resend.emails.send({
        from: `Modahaus Orders <${EMAIL_FROM}>`,
        to: [clientEmail],
        subject: `Order Confirmation [${orderId}] – Modahaus`,
        html: clientHtml,
      });

      if (clientSend.error) {
        // Don’t fail the whole request if client copy fails
        return res.status(200).json({
          ok: true,
          orderId,
          admin: { sent: true, id: adminSend.data?.id },
          client: { sent: false, error: clientSend.error.message },
        });
      }

      return res.status(200).json({
        ok: true,
        orderId,
        admin: { sent: true, id: adminSend.data?.id },
        client: { sent: true, id: clientSend.data?.id },
      });
    }

    return res.status(200).json({
      ok: true,
      orderId,
      admin: { sent: true, id: adminSend.data?.id },
      client: { sent: false, reason: 'No valid client email' },
    });
  } catch (err: any) {
    console.error('order-email error:', err?.message);
    return res.status(500).json({ ok: false, error: err?.message || 'Server error' });
  }
}
