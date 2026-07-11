const { Resend } = require('resend');

// Use a placeholder if no API key is provided during dev
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * Sends a pending application email to realtors upon registration.
 */
const sendPendingEmail = async (user) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email Skipped] Welcome email to ${user.email} not sent. Missing RESEND_API_KEY.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'GWealth Nation <hello@gwealthnation.com>', // Update this domain after verifying in Resend
      to: user.email,
      subject: 'Welcome to GWealth Nation - Application Pending',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #111;">Welcome to GWealth Nation!</h2>
          <p>Hi ${user.fullName},</p>
          <p>Thank you for registering as a Realtor with GWealth Nation. We are currently reviewing your application.</p>
          <p>Once your account is approved by an administrator, you will receive another email and be able to log in to access the Marketing Media Hub and your personal dashboard.</p>
          <br/>
          <p>Best regards,<br/><strong>The GWealth Admin Team</strong></p>
        </div>
      `,
    });
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${user.email}:`, error);
  }
};

/**
 * Sends an email notification to the realtor when their commission is paid.
 */
const sendPayoutEmail = async (user, amount, propertyName) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email Skipped] Payout email to ${user.email} not sent. Missing RESEND_API_KEY.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'GWealth Nation <hello@gwealthnation.com>', // Update this domain
      to: user.email,
      subject: 'Commission Payout Processed - GWealth Nation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2E8B57;">Payment Successful!</h2>
          <p>Hi ${user.fullName},</p>
          <p>Great news! Your commission payout of <strong>₦${amount.toLocaleString()}</strong> for the sale at <strong>${propertyName}</strong> has been successfully processed.</p>
          <p>The funds have been transferred to your registered bank account.</p>
          <p>Keep up the great work!</p>
          <br/>
          <p>Best regards,<br/><strong>The GWealth Admin Team</strong></p>
        </div>
      `,
    });
    console.log(`✅ Payout email sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Error sending payout email to ${user.email}:`, error);
  }
};

module.exports = {
  sendPendingEmail,
  sendPayoutEmail,
};
