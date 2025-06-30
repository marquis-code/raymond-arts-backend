// import { Injectable, Logger } from "@nestjs/common"
// import { ConfigService } from "@nestjs/config"
// import * as nodemailer from "nodemailer"
// import * as handlebars from "handlebars"
// import * as fs from "fs"
// import * as path from "path"
// import { registerHandlebarsHelpers } from './helpers/handlebars-helpers';

// @Injectable()
// export class EmailService {
//   private transporter: nodemailer.Transporter
//   private readonly logger = new Logger(EmailService.name)
//   private readonly templatesDir: string;
//   private readonly isDevelopment: boolean;

//   constructor(private configService: ConfigService) {
//     // Register handlebars helpers
//     registerHandlebarsHelpers();
    
//     // Set up the templates directory path
//     this.templatesDir = this.resolveTemplatesPath();
    
//     // Check if we're in development mode
//     this.isDevelopment = process.env.NODE_ENV !== 'production';
    
//     // Create appropriate transporter based on environment
//     if (this.isDevelopment) {
//       // In development, use a preview service or log to console
//       this.setupDevelopmentTransport();
//     } else {
//       // In production, use the configured email service
//       this.setupProductionTransport();
//     }
//   }

//   /**
//    * Sets up a development email transport that doesn't actually send emails
//    * but logs them to the console or uses a preview service
//    */
//   // private setupDevelopmentTransport(): void {
//   //   this.logger.log('Using development email transport (emails will be logged but not sent)');
    
//   //   // Create a preview transport that logs emails instead of sending them
//   //   this.transporter = nodemailer.createTransport({
//   //     name: 'development',
//   //     version: '1.0.0',
//   //     send: (mail, callback) => {
//   //       const envelope = mail.message.getEnvelope();
//   //       const messageId = mail.message.messageId();
        
//   //       this.logger.log('================ EMAIL PREVIEW ================');
//   //       this.logger.log(`From: ${envelope.from}`);
//   //       this.logger.log(`To: ${envelope.to}`);
//   //       this.logger.log(`Subject: ${mail.data.subject}`);
//   //       this.logger.log('===============================================');
        
//   //       callback(null, { envelope, messageId });
//   //     },
//   //   });
//   // }

//   private setupDevelopmentTransport(): void {
//     this.logger.log('Using development email transport (emails will be logged but not sent)');
    
//     // Create a preview transport that logs emails instead of sending them
//     this.transporter = nodemailer.createTransport({
//       name: 'development',
//       version: '1.0.0',
//       send: (mail, callback) => {
//         const envelope = mail.message.getEnvelope();
//         const messageId = mail.message.messageId();
        
//         this.logger.log('================ EMAIL PREVIEW ================');
//         this.logger.log(`From: ${envelope.from}`);
//         this.logger.log(`To: ${envelope.to}`);
//         this.logger.log(`Subject: ${mail.data.subject}`);
//         this.logger.log('===============================================');
        
//         // Return a complete SentMessageInfo object with all required properties
//         callback(null, {
//           envelope,
//           messageId,
//           accepted: envelope.to || [],
//           rejected: [],
//           pending: [],
//           response: 'Development transport - email not actually sent'
//         });
//       },
//     });
//   }

//   /**
//    * Sets up the production email transport using the configured service
//    */
//   private setupProductionTransport(): void {
//     const emailService = this.configService.get("email.service");
//     const emailUser = this.configService.get("email.user");
//     const emailPassword = this.configService.get("email.password");
    
//     if (!emailService || !emailUser || !emailPassword) {
//       this.logger.warn('Email configuration is incomplete. Falling back to development transport.');
//       this.setupDevelopmentTransport();
//       return;
//     }
    
//     this.logger.log(`Using email service: ${emailService}`);
    
//     this.transporter = nodemailer.createTransport({
//       service: emailService,
//       auth: {
//         user: emailUser,
//         pass: emailPassword,
//       },
//     });
    
//     // Verify the connection
//     this.transporter.verify((error) => {
//       if (error) {
//         this.logger.error(`Email transport verification failed: ${error.message}`);
//       } else {
//         this.logger.log('Email transport is ready to send messages');
//       }
//     });
//   }

//   /**
//    * Resolves the path to the email templates directory
//    * Tries multiple possible locations to handle both development and production environments
//    */
//   private resolveTemplatesPath(): string {
//     const possiblePaths = [
//       path.join(process.cwd(), 'src/templates/emails'),
//       path.join(process.cwd(), 'dist/templates/emails'),
//       path.join(process.cwd(), 'templates/emails'),
//       path.join(__dirname, '../templates/emails'),
//       path.join(__dirname, '../../templates/emails'),
//       path.join(__dirname, '../../../templates/emails'),
//     ];

//     for (const templatePath of possiblePaths) {
//       try {
//         // Check if directory exists
//         if (fs.existsSync(templatePath)) {
//           this.logger.log(`Using templates from: ${templatePath}`);
//           return templatePath;
//         }
//       } catch (error) {
//         // Continue to next path
//       }
//     }

//     // If no valid path is found, create the directory
//     const fallbackPath = path.join(process.cwd(), 'templates/emails');
//     try {
//       fs.mkdirSync(fallbackPath, { recursive: true });
//       this.logger.log(`Created templates directory at: ${fallbackPath}`);
//       return fallbackPath;
//     } catch (error) {
//       this.logger.error(`Failed to create templates directory: ${error.message}`);
//       return path.join(process.cwd(), 'templates/emails');
//     }
//   }

//   /**
//    * Loads a template from the filesystem or falls back to a simple default template
//    */
//   private loadTemplate(templateName: string): string {
//     const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
//     try {
//       return fs.readFileSync(templatePath, 'utf8');
//     } catch (error) {
//       this.logger.warn(`Template ${templateName}.hbs not found, using fallback template`);
      
//       // Create the directory if it doesn't exist
//       try {
//         fs.mkdirSync(this.templatesDir, { recursive: true });
//       } catch (err) {
//         // Directory already exists or can't be created
//       }
      
//       // Create a basic fallback template
//       const fallbackTemplate = this.createFallbackTemplate(templateName);
      
//       // Try to save the fallback template for future use
//       try {
//         fs.writeFileSync(templatePath, fallbackTemplate);
//         this.logger.log(`Created fallback template at: ${templatePath}`);
//       } catch (err) {
//         this.logger.error(`Failed to save fallback template: ${err.message}`);
//       }
      
//       return fallbackTemplate;
//     }
//   }

//   /**
//    * Creates a simple fallback template when the requested template is not found
//    */
//   private createFallbackTemplate(templateName: string): string {
//     return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Raymond Arts</title>
//   <style>
//     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//     .header { text-align: center; padding: 20px; background-color: #f8f4ef; }
//     .content { padding: 20px; }
//     .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f8f4ef; }
//   </style>
// </head>
// <body>
//   <div class="header">
//     <h1>Raymond Arts</h1>
//   </div>
//   <div class="content">
//     <p>Dear {{user.firstName}},</p>
    
//     <p>This is a notification from Raymond Arts.</p>
    
//     {{#if order}}
//     <p>Your order #{{order.orderNumber}} has been processed.</p>
//     {{/if}}
    
//     {{#if invoice}}
//     <p>Your invoice #{{invoice.invoiceNumber}} has been created.</p>
//     {{/if}}
    
//     {{#if resetUrl}}
//     <p>You can reset your password by clicking <a href="{{resetUrl}}">here</a>.</p>
//     {{/if}}
    
//     <p>Thank you for choosing Raymond Arts!</p>
    
//     <p>Best regards,<br>The Raymond Arts Team</p>
//   </div>
//   <div class="footer">
//     <p>&copy; {{currentYear}} Raymond Arts. All rights reserved.</p>
//   </div>
// </body>
// </html>`;
//   }

//   async sendEmail(
//     to: string | string[],
//     subject: string,
//     template: string,
//     context: any,
//     attachments: any[] = [],
//   ): Promise<boolean> {
//     try {
//       // Convert Mongoose documents to plain objects to avoid Handlebars issues
//       const plainContext = JSON.parse(JSON.stringify(context));
      
//       // Load the template (with fallback)
//       const templateSource = this.loadTemplate(template);
      
//       // Add common context variables for all emails
//       const commonContext = {
//         ...plainContext,
//         shopName: "Raymond Arts",
//         shopLogo: `${this.configService.get("frontend.url") || 'https://raymondarts.com'}/images/raymond-arts-logo.png`,
//         currentYear: new Date().getFullYear(),
//         shopAddress: "123 Art Avenue, Creative District, NY 10001",
//         shopPhone: "+1 (555) 123-4567",
//         shopEmail: "contact@raymondarts.com",
//         socialLinks: {
//           facebook: "https://facebook.com/raymondarts",
//           instagram: "https://instagram.com/raymondarts",
//           twitter: "https://twitter.com/raymondarts",
//           pinterest: "https://pinterest.com/raymondarts"
//         },
//         siteUrl: this.configService.get("frontend.url") || 'https://raymondarts.com',
//         subject: subject,
//       };

//       // Register partials if layout.hbs exists
//       try {
//         const layoutSource = this.loadTemplate('layout');
//         handlebars.registerPartial('layout', layoutSource);
//       } catch (error) {
//         // No layout partial, continue without it
//       }

//       const compiledTemplate = handlebars.compile(templateSource);
//       const html = compiledTemplate(commonContext);

//       const mailOptions = {
//         from: `"Raymond Arts" <${this.configService.get("email.from") || 'noreply@raymondarts.com'}>`,
//         to,
//         subject,
//         html,
//         attachments,
//       };

//       // In development mode, just log the email and return success
//       if (this.isDevelopment) {
//         this.logger.log(`[DEV MODE] Email would be sent to: ${to}`);
//         this.logger.log(`[DEV MODE] Subject: ${subject}`);
//         // Uncomment to see the full HTML content
//         // this.logger.log(`[DEV MODE] HTML Content: ${html}`);
//         return true;
//       }

//       // In production, actually send the email
//       await this.transporter.sendMail(mailOptions);
//       this.logger.log(`Email sent successfully to ${to}`);
//       return true;
//     } catch (error) {
//       this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
//       // For development purposes, log the email content that would have been sent
//       this.logger.debug(`Email that would have been sent to ${to}:`, {
//         subject,
//         template,
//         context,
//       });
      
//       return false;
//     }
//   }

//     async sendOrderConfirmation(order: any, user: any): Promise<boolean> {
//     return this.sendEmail(user.email, `Your Raymond Arts Order #${order.orderNumber} Confirmation`, "order-confirmation", {
//       user,
//       order,
//       date: new Date().toLocaleDateString(),
//     });
//   }

//   async sendInvoice(invoice: any, user: any, pdfBuffer?: Buffer): Promise<boolean> {
//     const attachments = pdfBuffer
//       ? [
//           {
//             filename: `invoice-${invoice.invoiceNumber}.pdf`,
//             content: pdfBuffer,
//           },
//         ]
//       : [];

//     return this.sendEmail(
//       user.email,
//       `Invoice #${invoice.invoiceNumber} from Raymond Arts`,
//       "invoice",
//       {
//         user,
//         invoice,
//         date: new Date().toLocaleDateString(),
//       },
//       attachments,
//     );
//   }

//   async sendInvoiceCreated(invoice: any, user: any, pdfBuffer?: Buffer): Promise<boolean> {
//     return this.sendInvoice(invoice, user, pdfBuffer);
//   }

//   async sendPaymentReceipt(payment: any, user: any): Promise<boolean> {
//     return this.sendEmail(user.email, "Payment Receipt from Raymond Arts", "payment-receipt", {
//       user,
//       payment,
//       date: new Date().toLocaleDateString(),
//     });
//   }

//   async sendPasswordReset(user: any, resetToken: string): Promise<boolean> {
//     const resetUrl = `${this.configService.get("frontend.url")}/reset-password?token=${resetToken}`;

//     return this.sendEmail(user.email, "Reset Your Raymond Arts Password", "password-reset", {
//       user,
//       resetUrl,
//     });
//   }

//   async sendShippingConfirmation(order: any, user: any): Promise<boolean> {
//     return this.sendEmail(user.email, `Your Raymond Arts Order #${order.orderNumber} Has Shipped`, "shipping-confirmation", {
//       user,
//       order,
//       trackingUrl: order.trackingUrl,
//       trackingNumber: order.trackingNumber,
//       estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Not available',
//     });
//   }

//   async sendWelcomeEmail(user: any): Promise<boolean> {
//     return this.sendEmail(user.email, "Welcome to Raymond Arts", "welcome", {
//       user,
//     });
//   }

//   async sendAbandonedCartReminder(user: any, cart: any): Promise<boolean> {
//     return this.sendEmail(user.email, "Your Raymond Arts Cart is Waiting", "abandoned-cart", {
//       user,
//       cart,
//       cartUrl: `${this.configService.get("frontend.url")}/cart`,
//     });
//   }

//   // Rest of the methods remain the same
//   // ...
// }

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
    
    {{#if plan}}
    <p>Your installment plan #{{plan.planNumber}} has been updated.</p>
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
      
      // If HTML is provided in context, use it directly (for installment emails)
      let html: string;
      if (plainContext.html) {
        html = plainContext.html;
      } else {
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
        html = compiledTemplate(commonContext);
      }

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

  // ===== EXISTING EMAIL METHODS =====

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

  // ===== INSTALLMENT-SPECIFIC EMAIL METHODS =====

  async sendInstallmentPlanCreated(plan: any, user: any, order: any): Promise<void> {
    const subject = `Installment Plan Created - #${plan.planNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Installment Plan Created Successfully</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>Your installment plan has been created successfully for order #${order.orderNumber}.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Plan Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Total Amount:</strong> $${plan.totalAmount.toFixed(2)}</p>
          <p><strong>Down Payment:</strong> $${plan.downPayment.toFixed(2)}</p>
          <p><strong>Number of Installments:</strong> ${plan.numberOfInstallments}</p>
          <p><strong>Installment Amount:</strong> $${plan.installmentAmount.toFixed(2)}</p>
          <p><strong>Interest Rate:</strong> ${plan.interestRate}% per annum</p>
          <p><strong>Total Payable:</strong> $${plan.totalPayable ? plan.totalPayable.toFixed(2) : 'N/A'}</p>
          <p><strong>Start Date:</strong> ${new Date(plan.startDate).toDateString()}</p>
        </div>
        
        ${plan.payments && plan.payments.length > 0 ? `
        <h3>Payment Schedule:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e9ecef;">
              <th style="padding: 10px; border: 1px solid #ddd;">Payment #</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Due Date</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${plan.payments
              .map(
                (payment: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${payment.installmentNumber}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${new Date(payment.dueDate).toDateString()}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">$${payment.amount.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        ` : ''}
        
        <p><strong>Important:</strong> Please ensure timely payments to avoid late fees and maintain your credit standing.</p>
        
        <p>Thank you for choosing our installment payment option!</p>
        
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, "installment-plan-created", {
      plan,
      user,
      order,
      html
    });
  }

  async sendInstallmentPaymentConfirmation(plan: any, payment: any, user: any): Promise<void> {
    const subject = `Payment Confirmation - Installment #${payment.installmentNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Received Successfully</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>We have successfully received your installment payment.</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #155724;">Payment Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Installment Number:</strong> ${payment.installmentNumber}</p>
          <p><strong>Amount Paid:</strong> $${payment.amount.toFixed(2)}</p>
          <p><strong>Payment Date:</strong> ${new Date(payment.paidDate).toDateString()}</p>
          <p><strong>Remaining Balance:</strong> $${plan.remainingAmount ? plan.remainingAmount.toFixed(2) : 'N/A'}</p>
        </div>
        
        ${
          plan.status === "completed"
            ? `
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="margin-top: 0; color: #0c5460;">🎉 Congratulations!</h3>
            <p>You have successfully completed all installment payments for this plan!</p>
          </div>
        `
            : `
          <p>Your next payment is due on: <strong>${plan.payments && plan.payments.find((p: any) => p.status === "pending")?.dueDate ? new Date(plan.payments.find((p: any) => p.status === "pending").dueDate).toDateString() : "N/A"}</strong></p>
        `
        }
        
        <p>Thank you for your payment!</p>
        
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, "installment-payment-confirmation", {
      plan,
      payment,
      user,
      html
    });
  }

  async sendInstallmentPaymentReminder(plan: any, payment: any, user: any, daysOverdue: number): Promise<void> {
    const subject = `⚠️ Overdue Payment Reminder - Plan #${plan.planNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Payment Overdue Notice</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>This is a reminder that your installment payment is now <strong>${daysOverdue} days overdue</strong>.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0; color: #721c24;">Overdue Payment Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Installment Number:</strong> ${payment.installmentNumber}</p>
          <p><strong>Amount Due:</strong> $${payment.amount.toFixed(2)}</p>
          <p><strong>Original Due Date:</strong> ${new Date(payment.dueDate).toDateString()}</p>
          <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Important Notice:</h3>
          <p>Late fees may apply for overdue payments. Please make your payment as soon as possible to avoid additional charges and maintain your credit standing.</p>
        </div>
        
        <p>Please log in to your account to make the payment immediately.</p>
        
        <p>If you have any questions or need assistance, please contact our customer support team.</p>
        
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, "installment-payment-reminder", {
      plan,
      payment,
      user,
      daysOverdue,
      html
    });
  }

  async sendUpcomingInstallmentReminder(plan: any, payment: any, user: any, daysUntilDue: number): Promise<void> {
    const subject = `📅 Upcoming Payment Reminder - Plan #${plan.planNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Upcoming Payment Reminder</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>This is a friendly reminder that your next installment payment is due in <strong>${daysUntilDue} days</strong>.</p>
        
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
          <h3 style="margin-top: 0; color: #0c5460;">Payment Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Installment Number:</strong> ${payment.installmentNumber}</p>
          <p><strong>Amount Due:</strong> $${payment.amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(payment.dueDate).toDateString()}</p>
        </div>
        
        <p>To avoid late fees, please ensure your payment is made on or before the due date.</p>
        
        <p>You can make your payment by logging into your account or contacting our customer service team.</p>
        
        <p>Thank you for your continued business!</p>
        
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, "upcoming-installment-reminder", {
      plan,
      payment,
      user,
      daysUntilDue,
      html
    });
  }

  async sendInstallmentDefaultNotification(plan: any, user: any): Promise<void> {
    const subject = `🚨 Account Default Notice - Plan #${plan.planNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Default Notice</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>We regret to inform you that your installment plan #${plan.planNumber} has been marked as <strong>DEFAULTED</strong> due to non-payment.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0; color: #721c24;">Default Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Total Outstanding:</strong> $${plan.overdueAmount ? plan.overdueAmount.toFixed(2) : 'N/A'}</p>
          <p><strong>Default Date:</strong> ${plan.defaultedAt ? new Date(plan.defaultedAt).toDateString() : 'N/A'}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Immediate Action Required:</h3>
          <p>This default may affect your credit score and future purchasing ability. Please contact our customer service team immediately to discuss payment arrangements.</p>
        </div>
        
        <p>Contact Information:</p>
        <ul>
          <li>Phone: +1 (555) 123-4567</li>
          <li>Email: support@raymondarts.com</li>
          <li>Hours: Monday - Friday, 9 AM - 6 PM</li>
        </ul>
        
        <p>We are committed to working with you to resolve this matter.</p>
        
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, "installment-default-notification", {
      plan,
      user,
      html
    });
  }

  // ===== HELPER METHODS FOR LEGACY SUPPORT =====

  private getEmailTemplate(template: string, data: any): string {
    switch (template) {
      case "invoice-overdue":
        return this.getInvoiceOverdueTemplate(data);
      default:
        return `<p>Email template not found: ${template}</p>`;
    }
  }

  private getOrderConfirmationTemplate(order: any, user: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Thank you for your order #${order.orderNumber}.</p>
        <p>Order Total: $${order.total.toFixed(2)}</p>
        <p>We'll send you updates on your order status.</p>
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;
  }

  private getPaymentReceiptTemplate(payment: any, user: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We have received your payment of $${payment.amount.toFixed(2)}.</p>
        <p>Reference: ${payment.reference}</p>
        <p>Date: ${new Date(payment.date).toDateString()}</p>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;
  }

  private getInvoiceTemplate(invoice: any, user: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice #${invoice.invoiceNumber}</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Please find your invoice attached.</p>
        <p>Amount Due: $${invoice.total.toFixed(2)}</p>
        <p>Due Date: ${new Date(invoice.dueDate).toDateString()}</p>
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;
  }

  private getInvoiceOverdueTemplate(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Invoice Overdue</h2>
        <p>Dear ${data.customer.firstName} ${data.customer.lastName},</p>
        <p>Your invoice #${data.invoice.invoiceNumber} is now ${data.daysOverdue} days overdue.</p>
        <p>Please make payment as soon as possible.</p>
        <p>Best regards,<br>The Raymond Arts Team</p>
      </div>
    `;
  }
}