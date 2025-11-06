// api/order-email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: { message: 'Method Not Allowed' } });
    }

    const { customerEmail, customerName, orderNumber, orderHtml, pdfBase64 } = req.body || {};

    if (!customerEmail || !orderNumber || !orderHtml) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Missing fields: customerEmail, orderNumber, orderHtml are required.' },
      });
    }

    const attachments = pdfBase64
      ? [
          {
            filename: `Order-${orderNumber}.pdf`,
            content: Buffer.from(pdfBase64, 'base64'),
            contentType: 'application/pdf',
          },
        ]
      : undefined;

    const from = process.env.EMAIL_FROM as string;        // e.g. 'orders@modahaus.co.za'
    const business = process.env.EMAIL_BUSINESS as string; // e.g. 'orders@modahaus.co.za'

    const { data, error } = await resend.emails.send({
      from,
      to: [customerEmail, business],
      subject: `Order #${orderNumber} received – Modahaus`,
      html: orderHtml,
      reply_to: business,
      attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      // @ts-ignore statusCode may exist on error
      return res.status(500).json({
        ok: false,
        error: { name: error.name, message: error.message, status: (error as any).statusCode },
      });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (e: any) {
    console.error('Handler error:', e);
    return res.status(500).json({ ok: false, error: { name: e?.name, message: e?.message } });
  }
}
