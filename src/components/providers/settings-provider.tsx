"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "@/lib/hooks/useSettings";

interface AppSettings {
  taxRate: number;
  maxCashierDiscount: number;
  currency: string;
  storeName: string;
  cashPayment: boolean;
  cardPayment: boolean;
  bankTransfer: boolean;
  showGstOnReceipt: boolean;
  receiptFooter: string;
  lowStockThreshold: number;
  walletName: string;
  walletNumber: string;
  sessionTimeout: number;
}

const SETTING_DEFAULTS: AppSettings = {
  taxRate: 0.17,
  maxCashierDiscount: 0.10,
  currency: "PKR",
  storeName: "POS System",
  cashPayment: true,
  cardPayment: true,
  bankTransfer: true,
  showGstOnReceipt: true,
  receiptFooter: "Thank you for your purchase!",
  lowStockThreshold: 10,
  walletName: "",
  walletNumber: "",
  sessionTimeout: 30,
};

const SettingsContext = createContext<AppSettings>(SETTING_DEFAULTS);

export const useAppSettings = () => useContext(SettingsContext);

import { formatCurrency } from "@/lib/utils/currency";
export const useCurrency = () => {
  const { currency } = useAppSettings();
  return (amount: number) => formatCurrency(amount, currency);
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: raw } = useSettings();

  const settings = useMemo<AppSettings>(() => raw ? {
    taxRate: raw.tax_rate ? Number(raw.tax_rate) / 100 : SETTING_DEFAULTS.taxRate,
    maxCashierDiscount: raw.max_cashier_discount ? Number(raw.max_cashier_discount) / 100 : SETTING_DEFAULTS.maxCashierDiscount,
    currency: raw.currency ?? SETTING_DEFAULTS.currency,
    storeName: raw.store_name ?? SETTING_DEFAULTS.storeName,
    cashPayment: raw.cash_payment !== "false",
    cardPayment: raw.card_payment !== "false",
    bankTransfer: raw.bank_transfer !== "false",
    showGstOnReceipt: raw.show_gst_on_receipt !== "false",
    receiptFooter: raw.receipt_footer ?? SETTING_DEFAULTS.receiptFooter,
    lowStockThreshold: raw.low_stock_threshold ? Number(raw.low_stock_threshold) : SETTING_DEFAULTS.lowStockThreshold,
    walletName: raw.wallet_name ?? "",
    walletNumber: raw.wallet_number ?? "",
    sessionTimeout: raw.session_timeout ? Number(raw.session_timeout) : SETTING_DEFAULTS.sessionTimeout,
  } : SETTING_DEFAULTS, [raw]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
