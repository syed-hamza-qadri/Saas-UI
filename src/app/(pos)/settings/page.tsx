"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Store, Receipt as ReceiptIcon,
  CreditCard, Shield, Printer, Bell,
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
  <button
    onClick={onChange}
    className={clsx(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      enabled ? "bg-[#702bf0]" : "bg-slate-200"
    )}
  >
    <span className={clsx(
      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
      enabled ? "translate-x-6" : "translate-x-1"
    )} />
  </button>
);

const SettingsInput = ({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) => (
  <input
    type="text"
    defaultValue={defaultValue}
    placeholder={placeholder}
    className="border border-slate-200 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#702bf0] w-[220px] bg-white"
  />
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [toggles, setToggles] = useState({
    printReceipt: true,
    emailReceipt: false,
    gstEnabled: true,
    cashPayment: true,
    cardPayment: true,
    bankTransfer: true,
    twoFactor: false,
    lowStockAlert: true,
    dailySummary: true,
    orderNotification: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="w-full max-w-[1400px] h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-row shadow-xl relative">

        {/* Sidebar */}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Settings</h1>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            <div className="flex gap-6 h-full">

              {/* Settings Tabs */}
              <div className="w-[200px] shrink-0">
                <div className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100">
                  {SETTINGS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-left transition-all mb-1 last:mb-0",
                        activeTab === tab.id
                          ? "bg-[#702bf0] text-white"
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <tab.icon size={17} />
                      <span className="text-[13px] font-semibold">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 overflow-y-auto scrollbar-hide">

                {activeTab === "store" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Store Information</h2>
                    <SettingRow label="Store Name" description="Displayed on receipts and reports">
                      <SettingsInput defaultValue="My POS Store" />
                    </SettingRow>
                    <SettingRow label="Address" description="Store physical address">
                      <SettingsInput defaultValue="Karachi, Pakistan" />
                    </SettingRow>
                    <SettingRow label="Phone" description="Contact number">
                      <SettingsInput defaultValue="+92 300 0000000" />
                    </SettingRow>
                    <SettingRow label="Currency" description="All prices shown in this currency">
                      <SettingsInput defaultValue="PKR" />
                    </SettingRow>
                    <SettingRow label="GST Number" description="For tax invoice generation">
                      <SettingsInput placeholder="Enter GST number" />
                    </SettingRow>
                  </div>
                )}

                {activeTab === "receipt" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Receipt Settings</h2>
                    <SettingRow label="Auto Print Receipt" description="Print receipt after every sale">
                      <Toggle enabled={toggles.printReceipt} onChange={() => toggle("printReceipt")} />
                    </SettingRow>
                    <SettingRow label="Email Receipt" description="Send receipt to customer email">
                      <Toggle enabled={toggles.emailReceipt} onChange={() => toggle("emailReceipt")} />
                    </SettingRow>
                    <SettingRow label="Show GST on Receipt" description="Display GST breakdown on receipt">
                      <Toggle enabled={toggles.gstEnabled} onChange={() => toggle("gstEnabled")} />
                    </SettingRow>
                    <SettingRow label="Receipt Footer" description="Custom message at bottom of receipt">
                      <SettingsInput defaultValue="Thank you for your purchase!" />
                    </SettingRow>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Payment Methods</h2>
                    <SettingRow label="Cash" description="Accept cash payments">
                      <Toggle enabled={toggles.cashPayment} onChange={() => toggle("cashPayment")} />
                    </SettingRow>
                    <SettingRow label="Card" description="Accept debit/credit card payments">
                      <Toggle enabled={toggles.cardPayment} onChange={() => toggle("cardPayment")} />
                    </SettingRow>
                    <SettingRow label="Bank Transfer" description="Accept bank transfer payments">
                      <Toggle enabled={toggles.bankTransfer} onChange={() => toggle("bankTransfer")} />
                    </SettingRow>
                    <SettingRow label="GST Rate" description="Applied to all taxable items">
                      <SettingsInput defaultValue="17%" />
                    </SettingRow>
                    <SettingRow label="Max Cashier Discount" description="Maximum discount cashier can apply">
                      <SettingsInput defaultValue="10%" />
                    </SettingRow>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Security</h2>
                    <SettingRow label="Two-Factor Authentication" description="Extra security for admin login">
                      <Toggle enabled={toggles.twoFactor} onChange={() => toggle("twoFactor")} />
                    </SettingRow>
                    <SettingRow label="Session Timeout" description="Auto logout cashier after inactivity">
                      <SettingsInput defaultValue="30 minutes" />
                    </SettingRow>
                    <SettingRow label="Admin PIN" description="PIN required for admin override actions">
                      <SettingsInput placeholder="Set admin PIN" />
                    </SettingRow>
                    <SettingRow label="Require PIN for Void" description="Cashier must enter PIN to void orders">
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                  </div>
                )}

                {activeTab === "printer" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Printer Settings</h2>
                    <SettingRow label="Printer Name" description="Connected thermal printer">
                      <SettingsInput defaultValue="EPSON TM-T20III" />
                    </SettingRow>
                    <SettingRow label="Paper Width" description="Receipt paper width in mm">
                      <SettingsInput defaultValue="80mm" />
                    </SettingRow>
                    <SettingRow label="Auto Cut Paper" description="Cut paper after printing receipt">
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow label="Print Logo" description="Print store logo on receipt">
                      <Toggle enabled={false} onChange={() => {}} />
                    </SettingRow>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1e1b4b] mb-4">Notifications</h2>
                    <SettingRow label="Low Stock Alert" description="Notify when product stock is low">
                      <Toggle enabled={toggles.lowStockAlert} onChange={() => toggle("lowStockAlert")} />
                    </SettingRow>
                    <SettingRow label="Daily Sales Summary" description="Send daily summary report">
                      <Toggle enabled={toggles.dailySummary} onChange={() => toggle("dailySummary")} />
                    </SettingRow>
                    <SettingRow label="New Order Sound" description="Play sound on new order">
                      <Toggle enabled={toggles.orderNotification} onChange={() => toggle("orderNotification")} />
                    </SettingRow>
                    <SettingRow label="Alert Email" description="Send alerts to this email">
                      <SettingsInput placeholder="admin@store.com" />
                    </SettingRow>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button className="bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-6 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
