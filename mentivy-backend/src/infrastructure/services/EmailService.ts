export class EmailService {
    static async sendOtpEmail(toEmail: string, fullName: string, otp: string): Promise<boolean> {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL || 'info.mentivy@gmail.com';

        if (!apiKey) {
            console.log(`\n==================================================`);
            console.log(`[DEV MODE] BREVO_API_KEY not set. OTP for ${toEmail}: ${otp}`);
            console.log(`==================================================\n`);
            return true;
        }

        console.log(`[EmailService] Sending 6-digit OTP email to ${toEmail} via Brevo HTTPS API...`);

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 32px; background-color: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800;">Mentivy</h1>
                    <p style="color: #64748b; margin-top: 4px; font-size: 14px;">Your Personalized Guidance Engine</p>
                </div>
                <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to Mentivy, ${fullName}!</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Please use the 6-digit verification code below to verify your email address and activate your account.
                    </p>
                    <div style="margin: 28px 0; padding: 16px; background-color: #eef2ff; border-radius: 12px; border: 1px solid #c7d2fe;">
                        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca;">${otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                        This code is valid for 10 minutes. If you did not request this code, please ignore this email.
                    </p>
                </div>
            </div>
        `;

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Mentivy Guidance',
                        email: senderEmail
                    },
                    to: [
                        {
                            email: toEmail,
                            name: fullName
                        }
                    ],
                    subject: `${otp} is your Mentivy Email Verification PIN`,
                    htmlContent: htmlContent
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[EmailService] Brevo API Error (${response.status}):`, errorData);
                return true;
            }

            console.log(`[EmailService] Verification OTP successfully sent to ${toEmail} via Brevo!`);
            return true;
        } catch (error) {
            console.error(`[EmailService] Failed to send email via Brevo HTTPS API:`, error);
            return true;
        }
    }

    static async sendPasswordResetEmail(toEmail: string, fullName: string, otp: string): Promise<boolean> {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL || 'info.mentivy@gmail.com';

        if (!apiKey) {
            console.log(`\n==================================================`);
            console.log(`[DEV MODE] BREVO_API_KEY not set. Password Reset OTP for ${toEmail}: ${otp}`);
            console.log(`==================================================\n`);
            return true;
        }

        console.log(`[EmailService] Sending Password Reset OTP email to ${toEmail} via Brevo...`);

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 32px; background-color: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800;">Mentivy</h1>
                    <p style="color: #64748b; margin-top: 4px; font-size: 14px;">Your Personalized Guidance Engine</p>
                </div>
                <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Hello ${fullName}, you requested to reset your password. Please use the 6-digit PIN below to reset your password.
                    </p>
                    <div style="margin: 28px 0; padding: 16px; background-color: #fff7ed; border-radius: 12px; border: 1px solid #ffedd5;">
                        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #c2410c;">${otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                        This password reset code is valid for 10 minutes. If you did not request a password reset, please ignore this email or secure your account.
                    </p>
                </div>
            </div>
        `;

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Mentivy Security',
                        email: senderEmail
                    },
                    to: [
                        {
                            email: toEmail,
                            name: fullName
                        }
                    ],
                    subject: `${otp} is your Mentivy Password Reset PIN`,
                    htmlContent: htmlContent
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[EmailService] Brevo Reset Email Error (${response.status}):`, errorData);
                return true;
            }

            console.log(`[EmailService] Password Reset OTP successfully sent to ${toEmail} via Brevo!`);
            return true;
        } catch (error) {
            console.error(`[EmailService] Failed to send password reset email via Brevo:`, error);
            return true;
        }
    }
}
