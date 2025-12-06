import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

// POST /api/support/contact - Dummy support endpoint (no email sent)
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

    // Log the support request (no email sent)
    logger.info(`Support request received from ${name} (${email}) - Category: ${category}, Subject: ${subject}`);

    // Return success with dummy message
    res.status(200).json({
      success: true,
      message: 'Thank you for your message. This is a demo environment - no email will be sent, but your request has been logged.'
    });
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