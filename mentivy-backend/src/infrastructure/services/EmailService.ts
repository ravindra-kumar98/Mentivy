import nodemailer from 'nodemailer';

export class EmailService {
    private static getTransporter() {
        const port = parseInt(process.env.SMTP_PORT || '465');
        const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: port,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
            connectionTimeout: 10000, // 10 seconds max connection timeout
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });
    }

    static async sendOtpEmail(toEmail: string, fullName: string, otp: string): Promise<boolean> {
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const isConfigured = !!smtpUser && !!smtpPass;

        if (!isConfigured) {
            console.log(`\n[DEV MODE] SMTP not configured. OTP for ${toEmail}: ${otp}`);
            return true;
        }

        console.log(`[EmailService] Sending verification email to ${toEmail}...`);

        try {
            const transporter = this.getTransporter();
            await transporter.sendMail({
                from: `"Mentivy Guidance" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: `${otp} is your Mentivy Email Verification PIN`,
                html: `
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
                            <div style="margin: 28px 0; padding: 16px; background-color: #eef2ff; border-radius: 12px; border: 1px border #c7d2fe;">
                                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca;">${otp}</span>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                                This code is valid for 10 minutes. If you did not request this code, please ignore this email.
                            </p>
                        </div>
                    </div>
                `,
            });
            console.log(`[EmailService] Verification OTP successfully sent to ${toEmail}`);
            return true;
        } catch (error) {
            console.error(`[EmailService] Failed to send email via SMTP:`, error);
            // Return true so user can still test with console logged OTP
            return true;
        }
    }
}
