"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Search, Plus,
  Phone, Mail, Star,
} from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils/currency";

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

interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  last_visit: string;
}

const MOCK_CUSTOMERS: MockCustomer[] = [
  { id: "1", name: "Ahmed Khan", phone: "+92 300 1234567", email: "ahmed@email.com", total_orders: 24, total_spent: 18500, loyalty_points: 185, last_visit: "21 Jun 2026" },
  { id: "2", name: "Sara Ali", phone: "+92 301 2345678", email: "sara@email.com", total_orders: 15, total_spent: 12300, loyalty_points: 123, last_visit: "20 Jun 2026" },
  { id: "3", name: "Bilal Raza", phone: "+92 302 3456789", email: "bilal@email.com", total_orders: 8, total_spent: 6700, loyalty_points: 67, last_visit: "19 Jun 2026" },
  { id: "4", name: "Fatima Malik", phone: "+92 303 4567890", email: "fatima@email.com", total_orders: 31, total_spent: 28900, loyalty_points: 289, last_visit: "21 Jun 2026" },
  { id: "5", name: "Usman Tariq", phone: "+92 304 5678901", email: "usman@email.com", total_orders: 5, total_spent: 3200, loyalty_points: 32, last_visit: "18 Jun 2026" },
  { id: "6", name: "Ayesha Siddiqui", phone: "+92 305 6789012", email: "ayesha@email.com", total_orders: 42, total_spent: 45600, loyalty_points: 456, last_visit: "21 Jun 2026" },
  { id: "7", name: "Hassan Sheikh", phone: "+92 306 7890123", email: "hassan@email.com", total_orders: 12, total_spent: 9800, loyalty_points: 98, last_visit: "17 Jun 2026" },
  { id: "8", name: "Zara Hussain", phone: "+92 307 8901234", email: "zara@email.com", total_orders: 19, total_spent: 16200, loyalty_points: 162, last_visit: "20 Jun 2026" },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <SidebarItem icon={Users} label="Customers" active href="/customers" />
            <SidebarItem icon={BarChart2} label="Reports" href="/reports" />
            <SidebarItem icon={Settings} label="Settings" href="/settings" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Customers</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#f0f4fc] border border-slate-200 rounded-[14px] pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-[#702bf0] w-[220px]"
                  />
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity">
                  <Plus size={16} />
                  Add Customer
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Customer</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Contact</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Orders</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Total Spent</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Loyalty Points</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className={clsx(
                        "border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors cursor-pointer",
                        index === filtered.length - 1 && "border-b-0"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#702bf0] to-[#511ae8] flex items-center justify-center shrink-0">
                            <span className="text-white text-[13px] font-bold">{customer.name.charAt(0)}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-slate-700">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-[12px] text-slate-500">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-[12px] text-slate-400">{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#702bf0]">{formatCurrency(customer.total_spent)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-[13px] font-semibold text-slate-700">{customer.loyalty_points} pts</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-400">{customer.last_visit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Users size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No customers found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
