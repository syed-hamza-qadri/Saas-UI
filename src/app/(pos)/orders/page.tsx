"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Search, Eye,
} from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils/currency";

// --- Sidebar ---
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

// --- Mock Data ---
type OrderStatus = "completed" | "pending" | "refunded" | "voided";
type PaymentMethod = "cash" | "card" | "bank_transfer";

interface MockOrder {
  id: string;
  order_number: string;
  customer: string;
  items: number;
  total: number;
  payment: PaymentMethod;
  status: OrderStatus;
  date: string;
}

const MOCK_ORDERS: MockOrder[] = [
  { id: "1", order_number: "ORD-001", customer: "Ahmed Khan", items: 4, total: 1250, payment: "cash", status: "completed", date: "21 Jun 2026, 10:30" },
  { id: "2", order_number: "ORD-002", customer: "Sara Ali", items: 2, total: 480, payment: "card", status: "completed", date: "21 Jun 2026, 10:45" },
  { id: "3", order_number: "ORD-003", customer: "Walk-in", items: 6, total: 2100, payment: "cash", status: "pending", date: "21 Jun 2026, 11:00" },
  { id: "4", order_number: "ORD-004", customer: "Bilal Raza", items: 1, total: 350, payment: "card", status: "completed", date: "21 Jun 2026, 11:20" },
  { id: "5", order_number: "ORD-005", customer: "Fatima Malik", items: 3, total: 890, payment: "bank_transfer", status: "refunded", date: "21 Jun 2026, 11:45" },
  { id: "6", order_number: "ORD-006", customer: "Walk-in", items: 5, total: 1670, payment: "cash", status: "completed", date: "21 Jun 2026, 12:00" },
  { id: "7", order_number: "ORD-007", customer: "Usman Tariq", items: 2, total: 560, payment: "card", status: "voided", date: "21 Jun 2026, 12:30" },
  { id: "8", order_number: "ORD-008", customer: "Ayesha Siddiqui", items: 7, total: 3240, payment: "bank_transfer", status: "completed", date: "21 Jun 2026, 13:00" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  refunded: "bg-blue-50 text-blue-700",
  voided: "bg-red-50 text-red-600",
};

const FILTER_TABS = ["All", "Completed", "Pending", "Refunded", "Voided"] as const;

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesFilter = activeFilter === "All" || order.status === activeFilter.toLowerCase();
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <SidebarItem icon={Receipt} label="Orders" active href="/orders" />
            <SidebarItem icon={Package} label="Inventory" href="/inventory" />
            <SidebarItem icon={Users} label="Customers" href="/customers" />
            <SidebarItem icon={BarChart2} label="Reports" href="/reports" />
            <SidebarItem icon={Settings} label="Settings" href="/settings" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[28px] font-bold text-[#1e1b4b] tracking-tight">Orders</h1>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 rounded-[14px] pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-[#702bf0] shadow-sm w-[240px]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={clsx(
                    "px-5 py-2 rounded-[12px] text-[13px] font-semibold transition-all",
                    activeFilter === tab
                      ? "bg-[#702bf0] text-white shadow-sm"
                      : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Order #</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Customer</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Items</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Total</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Payment</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Date</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={clsx(
                        "border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors",
                        index === filteredOrders.length - 1 && "border-b-0"
                      )}
                    >
                      <td className="px-6 py-4 text-[13px] font-bold text-[#702bf0]">{order.order_number}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-700">{order.customer}</td>
                      <td className="px-6 py-4 text-[13px] text-slate-500">{order.items} items</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 capitalize">{order.payment.replace("_", " ")}</td>
                      <td className="px-6 py-4">
                        <span className={clsx("px-3 py-1 rounded-full text-[12px] font-semibold capitalize", STATUS_STYLES[order.status])}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-400">{order.date}</td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 rounded-[10px] bg-[#f0f4fc] flex items-center justify-center hover:bg-[#e8e2ff] transition-colors">
                          <Eye size={15} className="text-[#702bf0]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Receipt size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
