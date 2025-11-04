// In your emailService.js, make sure you're passing customerInfo
export const sendOrderEmail = async (orderData, customerInfo = {}) => {
  try {
    const response = await fetch('/api/send-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: orderData,
        customerInfo: {
          name: customerInfo.name || 'Website Customer',
          email: customerInfo.email || 'Not provided',
          phone: customerInfo.phone || 'Not provided',
          address: customerInfo.address || 'Not provided',
          ...customerInfo
        }
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Failed to send email: ${response.status}`);
    }

    console.log('📧 Emails sent successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in sendOrderEmail:', error);
    throw new Error(`Failed to send order notification: ${error.message}`);
  }
};