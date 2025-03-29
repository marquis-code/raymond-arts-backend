import { Injectable, Logger } from "@nestjs/common"
// import type { ConfigService } from "@nestjs/config"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import * as handlebars from "handlebars"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(EmailService.name)

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get("email.service"),
      auth: {
        user: this.configService.get("email.user"),
        pass: this.configService.get("email.password"),
      },
    })
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    template: string,
    context: any,
    attachments: any[] = [],
  ): Promise<boolean> {
    try {
      const templatePath = path.join(__dirname, "../templates/emails", `${template}.hbs`)

      const templateSource = fs.readFileSync(templatePath, "utf8")
      const compiledTemplate = handlebars.compile(templateSource)
      const html = compiledTemplate(context)

      const mailOptions = {
        from: this.configService.get("email.from"),
        to,
        subject,
        html,
        attachments,
      }

      await this.transporter.sendMail(mailOptions)
      this.logger.log(`Email sent successfully to ${to}`)
      return true
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack)
      return false
    }
  }

  async sendOrderConfirmation(order: any, user: any): Promise<boolean> {
    return this.sendEmail(user.email, "Order Confirmation", "order-confirmation", {
      user,
      order,
      date: new Date().toLocaleDateString(),
      siteUrl: this.configService.get("frontend.url"),
    })
  }

  async sendInvoice(invoice: any, user: any, pdfBuffer?: Buffer): Promise<boolean> {
    const attachments = pdfBuffer
      ? [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ]
      : []

    return this.sendEmail(
      user.email,
      `Invoice #${invoice.invoiceNumber}`,
      "invoice",
      {
        user,
        invoice,
        date: new Date().toLocaleDateString(),
        siteUrl: this.configService.get("frontend.url"),
      },
      attachments,
    )
  }

  async sendPaymentReceipt(payment: any, user: any): Promise<boolean> {
    return this.sendEmail(user.email, "Payment Receipt", "payment-receipt", {
      user,
      payment,
      date: new Date().toLocaleDateString(),
      siteUrl: this.configService.get("frontend.url"),
    })
  }

  async sendPasswordReset(user: any, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get("frontend.url")}/reset-password?token=${resetToken}`

    return this.sendEmail(user.email, "Password Reset", "password-reset", {
      user,
      resetUrl,
      siteUrl: this.configService.get("frontend.url"),
    })
  }
}

