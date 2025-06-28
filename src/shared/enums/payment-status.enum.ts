export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid", 
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_PAID = "partially_paid",
    OVERDUE = "overdue",        // Added from installments
    CANCELLED = "cancelled",    // Added from installments
  }
  