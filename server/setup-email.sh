#!/bin/bash

# Email Notification Setup Script
# This script helps you set up email notifications for the LegacyModernize platform

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Email Notification Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the /server directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install nodemailer @types/nodemailer
echo "✅ Dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create one first."
    exit 1
fi

# Prompt for email provider
echo "Choose your email provider:"
echo "1) Gmail (easiest for testing)"
echo "2) SendGrid (best for production)"
echo "3) Other SMTP provider"
read -p "Enter choice (1-3): " provider

echo ""

case $provider in
    1)
        echo "📧 Gmail Setup"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Before continuing:"
        echo "1. Go to https://myaccount.google.com/apppasswords"
        echo "2. Enable 2-Step Verification if not already enabled"
        echo "3. Create an App Password for 'Mail'"
        echo "4. Copy the 16-digit password"
        echo ""
        read -p "Press Enter when you have your App Password..."
        echo ""
        
        read -p "Enter your Gmail address: " email_user
        read -sp "Enter your App Password (16 digits): " email_pass
        echo ""
        
        # Add to .env
        if grep -q "EMAIL_USER=" .env; then
            sed -i.bak "s|^EMAIL_USER=.*|EMAIL_USER=$email_user|" .env
            sed -i.bak "s|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$email_pass|" .env
            sed -i.bak "s|^EMAIL_HOST=.*|EMAIL_HOST=smtp.gmail.com|" .env
            sed -i.bak "s|^EMAIL_PORT=.*|EMAIL_PORT=587|" .env
        else
            echo "" >> .env
            echo "# Email Configuration" >> .env
            echo "EMAIL_USER=$email_user" >> .env
            echo "EMAIL_PASSWORD=$email_pass" >> .env
            echo "EMAIL_HOST=smtp.gmail.com" >> .env
            echo "EMAIL_PORT=587" >> .env
        fi
        ;;
        
    2)
        echo "📧 SendGrid Setup"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Before continuing:"
        echo "1. Sign up at https://sendgrid.com/"
        echo "2. Create an API Key with 'Mail Send' permission"
        echo "3. Copy the API key"
        echo ""
        read -p "Press Enter when you have your API key..."
        echo ""
        
        read -sp "Enter your SendGrid API Key: " email_pass
        echo ""
        
        # Add to .env
        if grep -q "EMAIL_USER=" .env; then
            sed -i.bak "s|^EMAIL_USER=.*|EMAIL_USER=apikey|" .env
            sed -i.bak "s|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$email_pass|" .env
            sed -i.bak "s|^EMAIL_HOST=.*|EMAIL_HOST=smtp.sendgrid.net|" .env
            sed -i.bak "s|^EMAIL_PORT=.*|EMAIL_PORT=587|" .env
        else
            echo "" >> .env
            echo "# Email Configuration" >> .env
            echo "EMAIL_USER=apikey" >> .env
            echo "EMAIL_PASSWORD=$email_pass" >> .env
            echo "EMAIL_HOST=smtp.sendgrid.net" >> .env
            echo "EMAIL_PORT=587" >> .env
        fi
        ;;
        
    3)
        echo "📧 Custom SMTP Setup"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        read -p "Enter SMTP host (e.g., smtp.example.com): " email_host
        read -p "Enter SMTP port (587 or 465): " email_port
        read -p "Enter SMTP username: " email_user
        read -sp "Enter SMTP password: " email_pass
        echo ""
        
        # Add to .env
        if grep -q "EMAIL_USER=" .env; then
            sed -i.bak "s|^EMAIL_USER=.*|EMAIL_USER=$email_user|" .env
            sed -i.bak "s|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$email_pass|" .env
            sed -i.bak "s|^EMAIL_HOST=.*|EMAIL_HOST=$email_host|" .env
            sed -i.bak "s|^EMAIL_PORT=.*|EMAIL_PORT=$email_port|" .env
        else
            echo "" >> .env
            echo "# Email Configuration" >> .env
            echo "EMAIL_USER=$email_user" >> .env
            echo "EMAIL_PASSWORD=$email_pass" >> .env
            echo "EMAIL_HOST=$email_host" >> .env
            echo "EMAIL_PORT=$email_port" >> .env
        fi
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Clean up backup files
rm -f .env.bak

echo ""
echo "✅ Email configuration added to .env"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Start the server:"
echo "   npm run dev"
echo ""
echo "2. Look for this message:"
echo "   ✅ Email service configured successfully"
echo ""
echo "3. Test by changing a project status"
echo ""
echo "📚 Full documentation: ./EMAIL_NOTIFICATIONS.md"
echo ""
echo "✨ All done! Email notifications are ready to use."
echo ""
