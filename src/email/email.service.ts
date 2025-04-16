import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import * as handlebars from "handlebars"
import * as fs from "fs"
import * as path from "path"
import { registerHandlebarsHelpers } from './helpers/handlebars-helpers';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(EmailService.name)
  private readonly templatesDir: string;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    // Register handlebars helpers
    registerHandlebarsHelpers();
    
    // Set up the templates directory path
    this.templatesDir = this.resolveTemplatesPath();
    
    // Check if we're in development mode
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Create appropriate transporter based on environment
    if (this.isDevelopment) {
      // In development, use a preview service or log to console
      this.setupDevelopmentTransport();
    } else {
      // In production, use the configured email service
      this.setupProductionTransport();
    }
  }

  /**
   * Sets up a development email transport that doesn't actually send emails
   * but logs them to the console or uses a preview service
   */
  // private setupDevelopmentTransport(): void {
  //   this.logger.log('Using development email transport (emails will be logged but not sent)');
    
  //   // Create a preview transport that logs emails instead of sending them
  //   this.transporter = nodemailer.createTransport({
  //     name: 'development',
  //     version: '1.0.0',
  //     send: (mail, callback) => {
  //       const envelope = mail.message.getEnvelope();
  //       const messageId = mail.message.messageId();
        
  //       this.logger.log('================ EMAIL PREVIEW ================');
  //       this.logger.log(`From: ${envelope.from}`);
  //       this.logger.log(`To: ${envelope.to}`);
  //       this.logger.log(`Subject: ${mail.data.subject}`);
  //       this.logger.log('===============================================');
        
  //       callback(null, { envelope, messageId });
  //     },
  //   });
  // }

  private setupDevelopmentTransport(): void {
    this.logger.log('Using development email transport (emails will be logged but not sent)');
    
    // Create a preview transport that logs emails instead of sending them
    this.transporter = nodemailer.createTransport({
      name: 'development',
      version: '1.0.0',
      send: (mail, callback) => {
        const envelope = mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        
        this.logger.log('================ EMAIL PREVIEW ================');
        this.logger.log(`From: ${envelope.from}`);
        this.logger.log(`To: ${envelope.to}`);
        this.logger.log(`Subject: ${mail.data.subject}`);
        this.logger.log('===============================================');
        
        // Return a complete SentMessageInfo object with all required properties
        callback(null, {
          envelope,
          messageId,
          accepted: envelope.to || [],
          rejected: [],
          pending: [],
          response: 'Development transport - email not actually sent'
        });
      },
    });
  }

  /**
   * Sets up the production email transport using the configured service
   */
  private setupProductionTransport(): void {
    const emailService = this.configService.get("email.service");
    const emailUser = this.configService.get("email.user");
    const emailPassword = this.configService.get("email.password");
    
    if (!emailService || !emailUser || !emailPassword) {
      this.logger.warn('Email configuration is incomplete. Falling back to development transport.');
      this.setupDevelopmentTransport();
      return;
    }
    
    this.logger.log(`Using email service: ${emailService}`);
    
    this.transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    
    // Verify the connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`Email transport verification failed: ${error.message}`);
      } else {
        this.logger.log('Email transport is ready to send messages');
      }
    });
  }

  /**
   * Resolves the path to the email templates directory
   * Tries multiple possible locations to handle both development and production environments
   */
  private resolveTemplatesPath(): string {
    const possiblePaths = [
      path.join(process.cwd(), 'src/templates/emails'),
      path.join(process.cwd(), 'dist/templates/emails'),
      path.join(process.cwd(), 'templates/emails'),
      path.join(__dirname, '../templates/emails'),
      path.join(__dirname, '../../templates/emails'),
      path.join(__dirname, '../../../templates/emails'),
    ];

    for (const templatePath of possiblePaths) {
      try {
        // Check if directory exists
        if (fs.existsSync(templatePath)) {
          this.logger.log(`Using templates from: ${templatePath}`);
          return templatePath;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // If no valid path is found, create the directory
    const fallbackPath = path.join(process.cwd(), 'templates/emails');
    try {
      fs.mkdirSync(fallbackPath, { recursive: true });
      this.logger.log(`Created templates directory at: ${fallbackPath}`);
      return fallbackPath;
    } catch (error) {
      this.logger.error(`Failed to create templates directory: ${error.message}`);
      return path.join(process.cwd(), 'templates/emails');
    }
  }

  /**
   * Loads a template from the filesystem or falls back to a simple default template
   */
  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      this.logger.warn(`Template ${templateName}.hbs not found, using fallback template`);
      
      // Create the directory if it doesn't exist
      try {
        fs.mkdirSync(this.templatesDir, { recursive: true });
      } catch (err) {
        // Directory already exists or can't be created
      }
      
      // Create a basic fallback template
      const fallbackTemplate = this.createFallbackTemplate(templateName);
      
      // Try to save the fallback template for future use
      try {
        fs.writeFileSync(templatePath, fallbackTemplate);
        this.logger.log(`Created fallback template at: ${templatePath}`);
      } catch (err) {
        this.logger.error(`Failed to save fallback template: ${err.message}`);
      }
      
      return fallbackTemplate;
    }
  }

  /**
   * Creates a simple fallback template when the requested template is not found
   */
  private createFallbackTemplate(templateName: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raymond Arts</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background-color: #f8f4ef; }
    .content { padding: 20px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f8f4ef; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Raymond Arts</h1>
  </div>
  <div class="content">
    <p>Dear {{user.firstName}},</p>
    
    <p>This is a notification from Raymond Arts.</p>
    
    {{#if order}}
    <p>Your order #{{order.orderNumber}} has been processed.</p>
    {{/if}}
    
    {{#if invoice}}
    <p>Your invoice #{{invoice.invoiceNumber}} has been created.</p>
    {{/if}}
    
    {{#if resetUrl}}
    <p>You can reset your password by clicking <a href="{{resetUrl}}">here</a>.</p>
    {{/if}}
    
    <p>Thank you for choosing Raymond Arts!</p>
    
    <p>Best regards,<br>The Raymond Arts Team</p>
  </div>
  <div class="footer">
    <p>&copy; {{currentYear}} Raymond Arts. All rights reserved.</p>
  </div>
</body>
</html>`;
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    template: string,
    context: any,
    attachments: any[] = [],
  ): Promise<boolean> {
    try {
      // Convert Mongoose documents to plain objects to avoid Handlebars issues
      const plainContext = JSON.parse(JSON.stringify(context));
      
      // Load the template (with fallback)
      const templateSource = this.loadTemplate(template);
      
      // Add common context variables for all emails
      const commonContext = {
        ...plainContext,
        shopName: "Raymond Arts",
        shopLogo: `${this.configService.get("frontend.url") || 'https://raymondarts.com'}/images/raymond-arts-logo.png`,
        currentYear: new Date().getFullYear(),
        shopAddress: "123 Art Avenue, Creative District, NY 10001",
        shopPhone: "+1 (555) 123-4567",
        shopEmail: "contact@raymondarts.com",
        socialLinks: {
          facebook: "https://facebook.com/raymondarts",
          instagram: "https://instagram.com/raymondarts",
          twitter: "https://twitter.com/raymondarts",
          pinterest: "https://pinterest.com/raymondarts"
        },
        siteUrl: this.configService.get("frontend.url") || 'https://raymondarts.com',
        subject: subject,
      };

      // Register partials if layout.hbs exists
      try {
        const layoutSource = this.loadTemplate('layout');
        handlebars.registerPartial('layout', layoutSource);
      } catch (error) {
        // No layout partial, continue without it
      }

      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate(commonContext);

      const mailOptions = {
        from: `"Raymond Arts" <${this.configService.get("email.from") || 'noreply@raymondarts.com'}>`,
        to,
        subject,
        html,
        attachments,
      };

      // In development mode, just log the email and return success
      if (this.isDevelopment) {
        this.logger.log(`[DEV MODE] Email would be sent to: ${to}`);
        this.logger.log(`[DEV MODE] Subject: ${subject}`);
        // Uncomment to see the full HTML content
        // this.logger.log(`[DEV MODE] HTML Content: ${html}`);
        return true;
      }

      // In production, actually send the email
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      // For development purposes, log the email content that would have been sent
      this.logger.debug(`Email that would have been sent to ${to}:`, {
        subject,
        template,
        context,
      });
      
      return false;
    }
  }

    async sendOrderConfirmation(order: any, user: any): Promise<boolean> {
    return this.sendEmail(user.email, `Your Raymond Arts Order #${order.orderNumber} Confirmation`, "order-confirmation", {
      user,
      order,
      date: new Date().toLocaleDateString(),
    });
  }

  async sendInvoice(invoice: any, user: any, pdfBuffer?: Buffer): Promise<boolean> {
    const attachments = pdfBuffer
      ? [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [];

    return this.sendEmail(
      user.email,
      `Invoice #${invoice.invoiceNumber} from Raymond Arts`,
      "invoice",
      {
        user,
        invoice,
        date: new Date().toLocaleDateString(),
      },
      attachments,
    );
  }

  async sendInvoiceCreated(invoice: any, user: any, pdfBuffer?: Buffer): Promise<boolean> {
    return this.sendInvoice(invoice, user, pdfBuffer);
  }

  async sendPaymentReceipt(payment: any, user: any): Promise<boolean> {
    return this.sendEmail(user.email, "Payment Receipt from Raymond Arts", "payment-receipt", {
      user,
      payment,
      date: new Date().toLocaleDateString(),
    });
  }

  async sendPasswordReset(user: any, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get("frontend.url")}/reset-password?token=${resetToken}`;

    return this.sendEmail(user.email, "Reset Your Raymond Arts Password", "password-reset", {
      user,
      resetUrl,
    });
  }

  async sendShippingConfirmation(order: any, user: any): Promise<boolean> {
    return this.sendEmail(user.email, `Your Raymond Arts Order #${order.orderNumber} Has Shipped`, "shipping-confirmation", {
      user,
      order,
      trackingUrl: order.trackingUrl,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not available',
    });
  }

  async sendWelcomeEmail(user: any): Promise<boolean> {
    return this.sendEmail(user.email, "Welcome to Raymond Arts", "welcome", {
      user,
    });
  }

  async sendAbandonedCartReminder(user: any, cart: any): Promise<boolean> {
    return this.sendEmail(user.email, "Your Raymond Arts Cart is Waiting", "abandoned-cart", {
      user,
      cart,
      cartUrl: `${this.configService.get("frontend.url")}/cart`,
    });
  }

  // Rest of the methods remain the same
  // ...
}