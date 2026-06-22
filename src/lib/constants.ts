export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "PKR";
export const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0.17);
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "POS System";

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer"] as const;
export const ORDER_STATUSES = ["pending", "completed", "refunded", "voided"] as const;
export const USER_ROLES = ["admin", "manager", "cashier"] as const;

export const MAX_CASHIER_DISCOUNT = 0.10;
export const MAX_MANAGER_DISCOUNT = 0.25;
export const SESSION_TIMEOUT_MINUTES = 30;
