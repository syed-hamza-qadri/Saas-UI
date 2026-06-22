import { CURRENCY } from "@/lib/constants";

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
};
