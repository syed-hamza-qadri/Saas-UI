"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Download,
  TrendingUp, TrendingDown, ShoppingBag, CreditCard,
} from "lucide-react";
import clsx from "clsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
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

const weeklyData = [
  { day: "Mon", revenue: 45000, orders: 18 },
  { day: "Tue", revenue: 62000, orders: 24 },
  { day: "Wed", revenue: 38000, orders: 15 },
  { day: "Thu", revenue: 71000, orders: 28 },
  { day: "Fri", revenue: 55000, orders: 22 },
  { day: "Sat", revenue: 89000, orders: 35 },
  { day: "Sun", revenue: 43000, orders: 17 },
];

const monthlyData = [
  { month: "Jan", revenue: 380000 },
  { month: "Feb", revenue: 420000 },
  { month: "Mar", revenue: 510000 },
  { month: "Apr", revenue: 390000 },
  { month: "May", revenue: 480000 },
  { month: "Jun", revenue: 620000 },
];

const SUMMARY_CARDS = [
  { label: "Today's Revenue", value: formatCurrency(48320), change: "+12.5%", positive: true, icon: TrendingUp },
  { label: "This Week", value: formatCurrency(403000), change: "+8.2%", positive: true, icon: BarChart2 },
  { label: "This Month", value: formatCurrency(1620000), change: "-3.1%", positive: false, icon: TrendingDown },
  { label: "Total Orders", value: "1,284", change: "+5.7%", positive: true, icon: ShoppingBag },
];

const TOP_PRODUCTS = [
  { name: "Chicken Burger", sales: 142, revenue: 49700 },
  { name: "Orange Juice 1L", sales: 118, revenue: 21240 },
  { name: "Mineral Water 500ml", sales: 210, revenue: 10500 },
  { name: "Cheese Pizza Slice", sales: 98, revenue: 21560 },
  { name: "Milk 1L", sales: 87, revenue: 13920 },
];

const PERIOD_TABS = ["Today", "This Week", "This Month"] as const;

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<string>("This Week");
  const formatRevenueTooltip = (value: unknown) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Revenue"];

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
            <SidebarItem icon={BarChart2} label="Reports" active href="/reports" />
            <SidebarItem icon={Settings} label="Settings" href="/settings" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Reports</h1>
              <div className="flex items-center gap-3">
                {PERIOD_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePeriod(tab)}
                    className={clsx(
                      "px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all",
                      activePeriod === tab
                        ? "bg-[#702bf0] text-white"
                        : "bg-[#f0f4fc] text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {tab}
                  </button>
                ))}
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity">
                  <Download size={15} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {SUMMARY_CARDS.map((card) => (
                <div key={card.label} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-slate-400 font-medium">{card.label}</span>
                    <card.icon size={18} className="text-[#702bf0]" />
                  </div>
                  <p className="text-[22px] font-bold text-[#1e1b4b] mb-1">{card.value}</p>
                  <div className="flex items-center gap-1">
                    <span className={clsx("text-[12px] font-semibold px-2 py-0.5 rounded-full", card.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                      {card.change}
                    </span>
                    <span className="text-[12px] text-slate-400">vs last period</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Daily Revenue (PKR)</h3>
                <div className="w-full" style={{ minHeight: 0, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={weeklyData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={formatRevenueTooltip} />
                      <Bar dataKey="revenue" fill="#702bf0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Monthly Revenue Trend</h3>
                <div className="w-full" style={{ minHeight: 0, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={formatRevenueTooltip} />
                      <Line type="monotone" dataKey="revenue" stroke="#702bf0" strokeWidth={2.5} dot={{ r: 4, fill: "white", stroke: "#702bf0", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Products + Payment Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Top Products</h3>
                <div className="space-y-3">
                  {TOP_PRODUCTS.map((product, i) => (
                    <div key={product.name} className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-slate-300 w-5">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-[13px] font-medium text-slate-700">{product.name}</span>
                          <span className="text-[13px] font-semibold text-[#702bf0]">{formatCurrency(product.revenue)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-[#702bf0] to-[#511ae8] h-1.5 rounded-full"
                            style={{ width: `${(product.sales / 210) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[12px] text-slate-400 w-14 text-right">{product.sales} sold</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Payment Summary</h3>
                <div className="space-y-4">
                  {[
                    { method: "Cash", amount: 820000, percent: 52, color: "bg-[#702bf0]" },
                    { method: "Card", amount: 510000, percent: 32, color: "bg-blue-400" },
                    { method: "Bank Transfer", amount: 250000, percent: 16, color: "bg-emerald-400" },
                  ].map((item) => (
                    <div key={item.method}>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-2.5 h-2.5 rounded-full", item.color)} />
                          <span className="text-[13px] font-medium text-slate-600">{item.method}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-semibold text-slate-700">{formatCurrency(item.amount)}</span>
                          <span className="text-[12px] text-slate-400 w-8 text-right">{item.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={clsx("h-2 rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex justify-between">
                    <span className="text-[13px] font-semibold text-slate-500">Total</span>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-[#1e1b4b]">{formatCurrency(1580000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
