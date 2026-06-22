import { TAX_RATE } from "@/lib/constants";

export const calculateTax = (amount: number): number => {
  return Math.round(amount * TAX_RATE * 100) / 100;
};

export const calculateTotal = (subtotal: number, tax: number, discount: number): number => {
  return Math.round((subtotal + tax - discount) * 100) / 100;
};

export const calculateSubtotal = (price: number, quantity: number): number => {
  return Math.round(price * quantity * 100) / 100;
};
