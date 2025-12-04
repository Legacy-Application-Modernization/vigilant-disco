import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ProjectStatusEmailData {
  userName: string;
  projectName: string;
  status: 'completed' | 'in-progress' | 'failed' | 'planning';
  projectUrl?: string;
  statusDetails?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration exists
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');

    if (!emailUser || !emailPass) {
      logger.warn('Email service not configured. Email notifications will be disabled.');
      logger.warn('Set EMAIL_USER and EMAIL_PASSWORD environment variables to enable email notifications.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.isConfigured = true;
      logger.info('✅ Email service configured successfully');
    } catch (error) {
      logger.error('Failed to configure email service:', error);
    }
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"LegacyModernize" <${process.env.EMAIL_USER}>`,
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
        text: notification.text || this.stripHtml(notification.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email sent successfully to ${notification.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${notification.to}:`, error);
      return false;
    }
  }

  async sendProjectStatusNotification(
    email: string,
    data: ProjectStatusEmailData
  ): Promise<boolean> {
    const { subject, html } = this.generateProjectStatusEmail(data);
    
    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  private generateProjectStatusEmail(data: ProjectStatusEmailData): { subject: string; html: string } {
    const { userName, projectName, status, projectUrl, statusDetails } = data;

    // Determine status styling
    const statusConfig = {
      completed: {
        emoji: '✅',
        color: '#10B981',
        bgColor: '#D1FAE5',
        title: 'Project Completed Successfully!',
        message: 'Your project has been successfully completed and is ready for review.',
      },
      'in-progress': {
        emoji: '⏳',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        title: 'Project In Progress',
        message: 'Your project is currently being processed.',
      },
      planning: {
        emoji: '📋',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        title: 'Project Planning Started',
        message: 'Your project planning phase has begun.',
      },
      failed: {
        emoji: '❌',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        title: 'Project Encountered an Issue',
        message: 'Your project has encountered an issue and requires attention.',
      },
    };

    const config = statusConfig[status] || statusConfig['in-progress'];

    const subject = `${config.emoji} ${projectName} - ${config.title}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${config.emoji} LegacyModernize
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                Transforming Legacy Code into Modern Applications
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: ${config.bgColor}; color: ${config.color}; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      ${config.title}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                ${config.message}
              </p>

              <!-- Project Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${config.color}; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                      Project Details
                    </p>
                    <p style="margin: 0; color: #111827; font-size: 18px; font-weight: bold;">
                      ${projectName}
                    </p>
                    ${statusDetails ? `
                      <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                        ${statusDetails}
                      </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              ${projectUrl ? `
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <a href="${projectUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        View Project Details
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ''}

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; text-align: center;">
                This is an automated notification from LegacyModernize.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} LegacyModernize. All rights reserved.
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

    return { subject, html };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.error('Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('✅ Email service connection verified');
      return true;
    } catch (error) {
      logger.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
