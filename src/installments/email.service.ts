import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("SMTP_HOST") || "smtp.gmail.com",
      port: this.configService.get("SMTP_PORT") || 587,
      secure: false,
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASS"),
      },
    })
  }

  async sendEmail(to: string, subject: string, template: string, data: any): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
        to,
        subject,
        html: this.getEmailTemplate(template, data),
      })
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  async sendOrderConfirmation(order: any, user: any): Promise<void> {
    const subject = `Order Confirmation - #${order.orderNumber}`
    const html = this.getOrderConfirmationTemplate(order, user)

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendPaymentReceipt(payment: any, user: any): Promise<void> {
    const subject = `Payment Receipt - ${payment.reference}`
    const html = this.getPaymentReceiptTemplate(payment, user)

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendInvoice(invoice: any, user: any): Promise<void> {
    const subject = `Invoice - #${invoice.invoiceNumber}`
    const html = this.getInvoiceTemplate(invoice, user)

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  // Installment-related email methods
  async sendInstallmentPlanCreated(plan: any, user: any, order: any): Promise<void> {
    const subject = `Installment Plan Created - #${plan.planNumber}`

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
          <p><strong>Total Payable:</strong> $${plan.totalPayable.toFixed(2)}</p>
          <p><strong>Start Date:</strong> ${new Date(plan.startDate).toDateString()}</p>
        </div>
        
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
        
        <p><strong>Important:</strong> Please ensure timely payments to avoid late fees and maintain your credit standing.</p>
        
        <p>Thank you for choosing our installment payment option!</p>
        
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendInstallmentPaymentConfirmation(plan: any, payment: any, user: any): Promise<void> {
    const subject = `Payment Confirmation - Installment #${payment.installmentNumber}`

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
          <p><strong>Remaining Balance:</strong> $${plan.remainingAmount.toFixed(2)}</p>
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
          <p>Your next payment is due on: <strong>${plan.payments.find((p: any) => p.status === "pending")?.dueDate ? new Date(plan.payments.find((p: any) => p.status === "pending").dueDate).toDateString() : "N/A"}</strong></p>
        `
        }
        
        <p>Thank you for your payment!</p>
        
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendInstallmentPaymentReminder(plan: any, payment: any, user: any, daysOverdue: number): Promise<void> {
    const subject = `⚠️ Overdue Payment Reminder - Plan #${plan.planNumber}`

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
        
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendUpcomingInstallmentReminder(plan: any, payment: any, user: any, daysUntilDue: number): Promise<void> {
    const subject = `📅 Upcoming Payment Reminder - Plan #${plan.planNumber}`

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
        
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  async sendInstallmentDefaultNotification(plan: any, user: any): Promise<void> {
    const subject = `🚨 Account Default Notice - Plan #${plan.planNumber}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Default Notice</h2>
        
        <p>Dear ${user.firstName} ${user.lastName},</p>
        
        <p>We regret to inform you that your installment plan #${plan.planNumber} has been marked as <strong>DEFAULTED</strong> due to non-payment.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0; color: #721c24;">Default Details:</h3>
          <p><strong>Plan Number:</strong> ${plan.planNumber}</p>
          <p><strong>Total Outstanding:</strong> $${plan.overdueAmount.toFixed(2)}</p>
          <p><strong>Default Date:</strong> ${new Date(plan.defaultedAt).toDateString()}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Immediate Action Required:</h3>
          <p>This default may affect your credit score and future purchasing ability. Please contact our customer service team immediately to discuss payment arrangements.</p>
        </div>
        
        <p>Contact Information:</p>
        <ul>
          <li>Phone: [Your Phone Number]</li>
          <li>Email: [Your Support Email]</li>
          <li>Hours: Monday - Friday, 9 AM - 6 PM</li>
        </ul>
        
        <p>We are committed to working with you to resolve this matter.</p>
        
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `

    await this.transporter.sendMail({
      from: this.configService.get("SMTP_FROM") || "noreply@yourstore.com",
      to: user.email,
      subject,
      html,
    })
  }

  // Helper methods for existing email templates
  private getEmailTemplate(template: string, data: any): string {
    switch (template) {
      case "invoice-overdue":
        return this.getInvoiceOverdueTemplate(data)
      default:
        return `<p>Email template not found: ${template}</p>`
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
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
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
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }

  private getInvoiceTemplate(invoice: any, user: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice #${invoice.invoiceNumber}</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Please find your invoice attached.</p>
        <p>Amount Due: $${invoice.total.toFixed(2)}</p>
        <p>Due Date: ${new Date(invoice.dueDate).toDateString()}</p>
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }

  private getInvoiceOverdueTemplate(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Invoice Overdue</h2>
        <p>Dear ${data.customer.firstName} ${data.customer.lastName},</p>
        <p>Your invoice #${data.invoice.invoiceNumber} is now ${data.daysOverdue} days overdue.</p>
        <p>Please make payment as soon as possible.</p>
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }
}
