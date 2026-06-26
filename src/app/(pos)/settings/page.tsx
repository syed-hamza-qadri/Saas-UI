"use client";

import React, { useState, useEffect } from "react";
import { useSettings, useSaveAllSettings } from "@/lib/hooks/useSettings";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/providers/settings-provider";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { useLoadingButton } from "@/lib/hooks/useLoadingButton";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Store, Receipt as ReceiptIcon,
  CreditCard, Shield, Printer, Bell, LogOut,
} from "lucide-react";
import clsx from "clsx";

const SidebarItem = ({ icon: Icon, label, active = false, href }: { icon: LucideIcon; label: string; active?: boolean; href: string }) => (
  <Link href={href}>
    <div className={clsx(
      "flex flex-row items-center justify-between px-[20px] py-[14px] cursor-pointer transition-colors duration-200 group mb-[4px]",
      active ? "bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white rounded-[24px]" : "text-slate-600 hover:bg-slate-50 rounded-[24px]"
    )}>
      <div className="flex flex-row items-center gap-[18px]">
        <Icon size={22} strokeWidth={1.75} className={clsx(active ? "text-white" : "text-[#7b8396] group-hover:text-slate-700")} />
        <span className={clsx("text-[16px] font-semibold tracking-tight", active ? "text-white" : "text-[#5e687b] group-hover:text-slate-800")}>{label}</span>
      </div>
      {!active && <ChevronRight size={18} strokeWidth={2} className="text-[#c1c6d4] group-hover:text-slate-400" />}
    </div>
  </Link>
);

type SettingsTab = "store" | "receipt" | "payment" | "security" | "printer" | "notifications";

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "receipt", label: "Receipt", icon: ReceiptIcon },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "printer", label: "Printer", icon: Printer },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
    <div>
      <p className="text-[14px] font-semibold text-slate-700">{label}</p>
      {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
    </div>
    <div className="ml-8 shrink-0">{children}</div>
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      enabled ? "bg-[#702bf0] cursor-pointer" : "bg-slate-200 cursor-pointer"
    )}>
    <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
      enabled ? "translate-x-6" : "translate-x-1"
    )} />
  </button>
);

interface AllSettings {
  store_name: string;
  store_address: string;
  store_phone: string;
  currency: string;
  gst_number: string;
  receipt_footer: string;
  tax_rate: string;
  max_cashier_discount: string;
  session_timeout: string;
  printer_name: string;
  paper_width: string;
  alert_email: string;
  auto_print_receipt: boolean;
  email_receipt: boolean;
  show_gst_on_receipt: boolean;
  cash_payment: boolean;
  card_payment: boolean;
  bank_transfer: boolean;
  two_factor: boolean;
  require_pin_void: boolean;
  auto_cut: boolean;
  print_logo: boolean;
  low_stock_alert: boolean;
  daily_summary: boolean;
  order_notification: boolean;
  wallet_name: string;
  wallet_number: string;
}

const DEFAULTS: AllSettings = {
  store_name: "My POS Store",
  store_address: "Karachi, Pakistan",
  store_phone: "+92 300 0000000",
  currency: "PKR",
  gst_number: "",
  receipt_footer: "Thank you for your purchase!",
  tax_rate: "17",
  max_cashier_discount: "10",
  session_timeout: "30",
  printer_name: "EPSON TM-T20III",
  paper_width: "80mm",
  alert_email: "",
  auto_print_receipt: true,
  email_receipt: false,
  show_gst_on_receipt: true,
  cash_payment: true,
  card_payment: true,
  bank_transfer: true,
  two_factor: false,
  require_pin_void: true,
  auto_cut: true,
  print_logo: false,
  low_stock_alert: true,
  daily_summary: true,
  order_notification: false,
  wallet_name: "",
  wallet_number: "",
};

export default function SettingsPage() {
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const appSettings = useAppSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [s, setS] = useState<AllSettings>(DEFAULTS);
  const [initialized, setInitialized] = useState(false);

  const { data: user } = useUser();
  const { data: savedSettings, isLoading: settingsLoading } = useSettings();
  const saveAllSettings = useSaveAllSettings();

  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    if (!savedSettings || initialized) return;
    setS({
      store_name: savedSettings.store_name ?? DEFAULTS.store_name,
      store_address: savedSettings.store_address ?? DEFAULTS.store_address,
      store_phone: savedSettings.store_phone ?? DEFAULTS.store_phone,
      currency: savedSettings.currency ?? DEFAULTS.currency,
      gst_number: savedSettings.gst_number ?? DEFAULTS.gst_number,
      receipt_footer: savedSettings.receipt_footer ?? DEFAULTS.receipt_footer,
      tax_rate: savedSettings.tax_rate ?? DEFAULTS.tax_rate,
      max_cashier_discount: savedSettings.max_cashier_discount ?? DEFAULTS.max_cashier_discount,
      session_timeout: savedSettings.session_timeout ?? DEFAULTS.session_timeout,
      printer_name: savedSettings.printer_name ?? DEFAULTS.printer_name,
      paper_width: savedSettings.paper_width ?? DEFAULTS.paper_width,
      alert_email: savedSettings.alert_email ?? DEFAULTS.alert_email,
      auto_print_receipt: savedSettings.auto_print_receipt === "true",
      email_receipt: savedSettings.email_receipt === "true",
      show_gst_on_receipt: savedSettings.show_gst_on_receipt === "true",
      cash_payment: savedSettings.cash_payment === "true",
      card_payment: savedSettings.card_payment === "true",
      bank_transfer: savedSettings.bank_transfer === "true",
      two_factor: savedSettings.two_factor === "true",
      require_pin_void: savedSettings.require_pin_void !== "false",
      auto_cut: savedSettings.auto_cut !== "false",
      print_logo: savedSettings.print_logo === "true",
      low_stock_alert: savedSettings.low_stock_alert !== "false",
      daily_summary: savedSettings.daily_summary !== "false",
      order_notification: savedSettings.order_notification === "true",
      wallet_name: savedSettings.wallet_name ?? DEFAULTS.wallet_name,
      wallet_number: savedSettings.wallet_number ?? DEFAULTS.wallet_number,
    });
    setInitialized(true);
  }, [savedSettings, initialized]);

  const set = (key: keyof AllSettings, value: string | boolean) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const payload: Record<string, string> = {};
    Object.entries(s).forEach(([key, value]) => {
      payload[key] = String(value);
    });
    await saveAllSettings.mutateAsync(payload);
  };

  const inp = (key: keyof AllSettings) => (
    <input
      type="text"
      value={String(s[key])}
      onChange={(e) => set(key, e.target.value)}
      className="border border-slate-200 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#702bf0] w-[220px] bg-white"
    />
  );

  const tog = (key: keyof AllSettings) => (
    <Toggle enabled={Boolean(s[key])} onChange={() => set(key, !s[key])} />
  );

  const SaveBtn = () => (
    <div className="mt-6 pt-4 border-t border-slate-100">
      <button onClick={handleSave} disabled={saveAllSettings.isPending || settingsLoading}
        className="bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-6 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
        {saveAllSettings.isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="w-full max-w-[1400px] h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-row shadow-xl relative">
        <div className="w-[280px] h-full shrink-0 flex flex-col pt-12 pb-6 px-6">
          <div className="flex flex-col ml-[18px] mb-[48px]">
            <span className="text-[28px] font-bold text-[#230ed8] leading-none tracking-tight">POS System</span>
            <span className="text-[13px] text-slate-400 font-medium mt-1">Management Console</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <SidebarItem icon={LayoutGrid} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={ShoppingCart} label="POS Terminal" href="/pos" />
            <SidebarItem icon={Receipt} label="Orders" href="/orders" />
            <SidebarItem icon={Package} label="Inventory" href="/inventory" />
            <SidebarItem icon={Users} label="Customers" href="/customers" />
            <SidebarItem icon={BarChart2} label="Reports" href="/reports" />
            <SidebarItem icon={Settings} label="Settings" active href="/settings" />
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 mx-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-[16px] bg-[#f8f7ff]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#702bf0] to-[#511ae8] flex items-center justify-center shrink-0">
                <span className="text-white text-[12px] font-bold">{user?.email?.charAt(0).toUpperCase() ?? "A"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">{appSettings.storeName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email ?? ""}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Settings</h1>
              <button
                  onClick={() => withLogoutLoading(handleLogout)}
                  disabled={logoutLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all text-[13px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {logoutLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  {logoutLoading ? "Logging out..." : "Logout"}
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            {settingsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-[#702bf0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex gap-6 h-full">
                <div className="w-[200px] shrink-0">
                  <div className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100">
                    {SETTINGS_TABS.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-left transition-all mb-1 last:mb-0",
                          activeTab === tab.id ? "bg-[#702bf0] text-white cursor-pointer" : "text-slate-500 hover:bg-slate-50 cursor-pointer"
                        )}>
                        <tab.icon size={17} />
                        <span className="text-[13px] font-semibold">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 overflow-y-auto scrollbar-hide">
                  {activeTab === "store" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Store Information</h2>
                      <SettingRow label="Store Name" description="Displayed on receipts and reports">{inp("store_name")}</SettingRow>
                      <SettingRow label="Address" description="Store physical address">{inp("store_address")}</SettingRow>
                      <SettingRow label="Phone" description="Contact number">{inp("store_phone")}</SettingRow>
                      <SettingRow label="Currency" description="All prices shown in this currency">{inp("currency")}</SettingRow>
                      <SettingRow label="GST Number" description="For tax invoice generation">{inp("gst_number")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                  {activeTab === "receipt" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Receipt Settings</h2>
                      <SettingRow label="Auto Print Receipt" description="Print receipt after every sale">{tog("auto_print_receipt")}</SettingRow>
                      <SettingRow label="Email Receipt" description="Send receipt to customer email">{tog("email_receipt")}</SettingRow>
                      <SettingRow label="Show GST on Receipt" description="Display GST breakdown on receipt">{tog("show_gst_on_receipt")}</SettingRow>
                      <SettingRow label="Receipt Footer" description="Custom message at bottom of receipt">{inp("receipt_footer")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                  {activeTab === "payment" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Payment Methods</h2>
                      <SettingRow label="Cash" description="Accept cash payments">{tog("cash_payment")}</SettingRow>
                      <SettingRow label="Card" description="Accept debit/credit card payments">{tog("card_payment")}</SettingRow>
                      <SettingRow label="Bank Transfer" description="Accept bank transfer payments">{tog("bank_transfer")}</SettingRow>
                      <SettingRow label="Wallet / Bank Name" description="e.g. JazzCash, Easypaisa, HBL">{inp("wallet_name")}</SettingRow>
                      <SettingRow label="Wallet / Account Number" description="Optional — shown to cashier during bank transfer">{inp("wallet_number")}</SettingRow>
                      <SettingRow label="GST Rate (%)" description="Applied to all taxable items">{inp("tax_rate")}</SettingRow>
                      <SettingRow label="Max Cashier Discount (%)" description="Maximum discount cashier can apply">{inp("max_cashier_discount")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                  {activeTab === "security" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Security</h2>
                      <SettingRow label="Two-Factor Authentication" description="Extra security for admin login">{tog("two_factor")}</SettingRow>
                      <SettingRow label="Session Timeout (minutes)" description="Auto logout cashier after inactivity">{inp("session_timeout")}</SettingRow>
                      <SettingRow label="Require PIN for Void" description="Cashier must enter PIN to void orders">{tog("require_pin_void")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                  {activeTab === "printer" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Printer Settings</h2>
                      <SettingRow label="Printer Name" description="Connected thermal printer">{inp("printer_name")}</SettingRow>
                      <SettingRow label="Paper Width" description="Receipt paper width in mm">{inp("paper_width")}</SettingRow>
                      <SettingRow label="Auto Cut Paper" description="Cut paper after printing receipt">{tog("auto_cut")}</SettingRow>
                      <SettingRow label="Print Logo" description="Print store logo on receipt">{tog("print_logo")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                  {activeTab === "notifications" && (
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Notifications</h2>
                      <SettingRow label="Low Stock Alert" description="Notify when product stock is low">{tog("low_stock_alert")}</SettingRow>
                      <SettingRow label="Daily Sales Summary" description="Send daily summary report">{tog("daily_summary")}</SettingRow>
                      <SettingRow label="New Order Sound" description="Play sound on new order">{tog("order_notification")}</SettingRow>
                      <SettingRow label="Alert Email" description="Send alerts to this email">{inp("alert_email")}</SettingRow>
                      <SaveBtn />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
