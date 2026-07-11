const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(partnerEmail, partnerName, partnerCode) {
    try {
        const { data, error } = await resend.emails.send({
            // 1. Custom sender email under your verified domain
            from: 'G-Wealth Republic <no-reply@gwealthrepublic.com>',
            to: partnerEmail,
            subject: 'Your Partner Node is Active! - G-Wealth Portal',
            
            // 2. Custom, premium, brand-aligned HTML template
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 4px;">
                    <!-- Header -->
                    <div style="background-color: #27267d; padding: 24px; text-align: center; border-radius: 4px 4px 0 0;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: -0.01em;">G-WEALTH REPUBLIC</h1>
                        <span style="color: #D4AF37; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">Verified Partner Network</span>
                    </div>
                    
                    <!-- Content Body -->
                    <div style="padding: 32px 24px; background-color: #FAFAFA;">
                        <h2 style="color: #1E1B4B; margin-top: 0; font-size: 18px;">Welcome to the Network, ${partnerName}!</h2>
                        <p style="color: #464651; font-size: 13px; line-height: 1.6;">Your professional registration has been cleared by the land audit desk. Your partner portal accounts are now fully active.</p>
                        
                        <!-- Unique Partner Code Card -->
                        <div style="background-color: #e5eeff; border: 1px solid #cbdbf5; border-radius: 4px; padding: 16px; margin: 24px 0; text-align: center;">
                            <span style="display: block; font-size: 9px; color: #464651; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Your Unique Partner Reference Code</span>
                            <strong style="font-size: 20px; color: #27267d; letter-spacing: 0.05em;">${partnerCode}</strong>
                        </div>
                        
                        <p style="color: #464651; font-size: 13px; line-height: 1.6;">Log into your active partner dashboard to generate your custom referral links, monitor downline signups, and access our Cloudinary media marketing hub.</p>
                        
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="https://portal.gwealthrepublic.com/login" style="background-color: #bb001b; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; padding: 14px 28px; border-radius: 4px; display: inline-block;">Access Realtor Workspace</a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #718096;">
                        <p style="margin: 0 0 8px 0;">G-Wealth Republic Ltd • 181 Ikot Ekpene Road, Ogbor Hill, Aba.</p>
                        <p style="margin: 0;">This email was sent via a secure, encrypted transaction channel.</p>
                    </div>
                </div>
        });

        if (error) {
            throw error;
        }
        console.log("Welcome email successfully dispatched to:", partnerEmail);
    } catch (error) {
        console.error("Failed to send Resend notification:", error);
    }
}

module.exports = {
    sendWelcomeEmail
};
