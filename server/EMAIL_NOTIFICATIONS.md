# Email Notification Setup Guide

## Overview
The LegacyModernize platform now supports automated email notifications for project status changes. Users will receive beautifully formatted emails when their projects:

- ✅ **Complete successfully**
- ⏳ **Start processing** (in-progress)
- ❌ **Encounter errors** (archived/failed)

## Features

### 1. **Status Change Notifications**
Automatic emails sent when project status changes to:
- `completed` - Success notification with green theme
- `in-progress` - Processing notification with yellow theme  
- `archived` - Failure notification with red theme

### 2. **Beautiful HTML Email Templates**
- Gradient header with branding
- Color-coded status badges
- Responsive design
- Professional styling
- Call-to-action buttons

### 3. **User Preferences**
Email notifications respect user notification preferences (coming soon in user settings)

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification**
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Generate password and copy it

3. **Update .env file**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**
   - Visit https://sendgrid.com/
   - Create a free account (100 emails/day free)

2. **Create API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Update .env file**
```bash
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
```

### Option 3: Other SMTP Providers

You can use any SMTP provider (Mailgun, AWS SES, etc.):

```bash
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587  # or 465 for SSL
```

## Testing Email Configuration

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Check Logs
Look for these messages in the console:
- ✅ `Email service configured successfully` - Email is ready
- ⚠️ `Email service not configured` - Missing configuration

### 4. Test with Status Change
Update a project status via API:
```bash
curl -X PATCH http://localhost:3001/api/projects/{projectId}/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## Email Template Customization

### Modify Email Content
Edit `/server/src/services/email.service.ts`:

```typescript
// Change status configurations
const statusConfig = {
  completed: {
    emoji: '✅',
    color: '#10B981',
    title: 'Your Custom Title',
    message: 'Your custom message',
  },
  // ... other statuses
};
```

### Add Custom Fields
```typescript
export interface ProjectStatusEmailData {
  userName: string;
  projectName: string;
  status: 'completed' | 'in-progress' | 'failed';
  projectUrl?: string;
  statusDetails?: string;
  // Add your custom fields here
  customField?: string;
}
```

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
```bash
# Verify variables are set
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

2. **Check Server Logs**
Look for error messages:
- `Email service not configured` - Add EMAIL_USER and EMAIL_PASSWORD
- `Failed to send email` - Check SMTP credentials
- `Connection timeout` - Check firewall/port settings

3. **Test SMTP Connection**
The service automatically tests connection on startup. Check logs for:
- ✅ `Email service connection verified`
- ❌ `Email service connection failed`

### Gmail Specific Issues

- **"Less secure app"** - Use App Passwords instead
- **"Authentication failed"** - Verify App Password is correct
- **"Daily limit exceeded"** - Gmail has sending limits (500/day)

### SendGrid Specific Issues

- **API Key invalid** - Regenerate API key
- **Domain not verified** - Verify sender domain
- **Rate limit** - Check SendGrid dashboard for limits

## Production Recommendations

### 1. Use Professional SMTP Service
- **SendGrid** - Reliable, good free tier
- **AWS SES** - Scalable, pay-as-you-go
- **Mailgun** - Developer-friendly
- **Postmark** - Excellent deliverability

### 2. Set Up Domain Authentication
- Configure SPF records
- Add DKIM signature
- Set up DMARC policy

### 3. Monitor Email Deliverability
- Track bounce rates
- Monitor spam complaints
- Watch delivery metrics

### 4. Implement Rate Limiting
```typescript
// Add to email.service.ts
private async checkRateLimit(email: string): Promise<boolean> {
  // Implement rate limiting logic
}
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EMAIL_USER` | SMTP username or email | - | Yes |
| `EMAIL_PASSWORD` | SMTP password or API key | - | Yes |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP server port | `587` | No |
| `CORS_ORIGIN` | Frontend URL for links | `http://localhost:5173` | No |

## API Reference

### Send Status Notification
```typescript
// Automatically called when project status changes
await emailService.sendProjectStatusNotification(
  'user@example.com',
  {
    userName: 'John Doe',
    projectName: 'My PHP Project',
    status: 'completed',
    projectUrl: 'http://localhost:5173/projects/123',
    statusDetails: 'Project completed successfully'
  }
);
```

### Send Custom Email
```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML</h1>',
  text: 'Custom plain text'
});
```

## Security Best Practices

1. **Never commit credentials** - Use .env file (gitignored)
2. **Use App Passwords** - Don't use main account password
3. **Rotate credentials** - Change passwords regularly
4. **Monitor usage** - Watch for unusual activity
5. **Limit scope** - Use minimal permissions

## Future Enhancements

- [ ] User notification preferences
- [ ] Digest emails (daily/weekly summaries)
- [ ] Email templates for other events
- [ ] Unsubscribe functionality
- [ ] Email analytics dashboard
- [ ] Multiple language support
- [ ] Rich text editor for admin emails

## Support

For issues or questions:
1. Check the logs in `/server/logs/combined.log`
2. Review this documentation
3. Contact the development team

---

**Last Updated:** December 4, 2025
