import { Router, Request, Response } from 'express';
import EmailService from '../services/email.service';
import { logger } from '../utils/logger';

const router = Router();
const emailService = new EmailService();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

// POST /api/support/contact - Send support email
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, category, message }: ContactFormData = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
        error: 'VALIDATION_ERROR'
      });
      return;
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || 'cvcharan52@gmail.com';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Support Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🆘 New Support Request
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                LegacyModernize Platform
              </p>
            </td>
          </tr>

          <!-- Category Badge -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="display: inline-block; background-color: #EEF2FF; color: #667eea; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${category}
              </div>
            </td>
          </tr>

          <!-- Content -->}
          <tr>
            <td style="padding: 0 30px 30px;">
              
              <!-- User Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      From
                    </p>
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: bold;">
                      ${name}
                    </p>
                    <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">
                      <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  Subject
                </p>
                <p style="margin: 0; color: #111827; font-size: 18px; font-weight: bold;">
                  ${subject}
                </p>
              </div>

              <!-- Message -->
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  Message
                </p>
                <div style="background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px; padding: 16px;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${message}
                  </p>
                </div>
              </div>

              <!-- Quick Actions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 11px; text-align: center;">
                Received: ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                LegacyModernize Support System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailSent = await emailService.sendEmail({
      to: supportEmail,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html,
      text: `
Support Request from ${name} (${email})

Category: ${category}
Subject: ${subject}

Message:
${message}

---
Received: ${new Date().toISOString()}
      `
    });

    if (emailSent) {
      logger.info(`Support email sent from ${email} - Subject: ${subject}`);
      
      // Send confirmation email to user
      const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>We received your message</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                ✉️ Message Received
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for contacting LegacyModernize support! We've received your message and our team will review it shortly.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #10B981; border-radius: 4px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600;">
                  YOUR MESSAGE
                </p>
                <p style="margin: 0; color: #111827; font-size: 14px; font-weight: bold;">
                  ${subject}
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>What happens next?</strong>
              </p>
              <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin-top: 8px;">
                <li>Our support team will review your request</li>
                <li>You'll receive a response within 24 hours</li>
                <li>We'll contact you at ${email}</li>
              </ul>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                If you have any additional information to add, just reply to this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                LegacyModernize Support Team
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                This is an automated confirmation email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      // Send confirmation to user (don't wait for it)
      emailService.sendEmail({
        to: email,
        subject: `We received your message: ${subject}`,
        html: confirmationHtml
      }).catch(err => {
        logger.warn('Failed to send confirmation email to user:', err);
      });

      res.status(200).json({
        success: true,
        message: 'Support request submitted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send support request',
        error: 'EMAIL_SEND_FAILED'
      });
    }
  } catch (error: any) {
    logger.error('Support contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

export default router;
