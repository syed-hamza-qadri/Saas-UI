"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
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
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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

type Period = "Today" | "This Week" | "This Month";

const useReportsData = (period: Period) => {
  return useQuery({
    queryKey: ["reports", period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      if (period === "Today") {
        startDate = new Date(now); startDate.setHours(0, 0, 0, 0);
      } else if (period === "This Week") {
        startDate = new Date(now); startDate.setDate(now.getDate() - 7);
      } else {
        startDate = new Date(now); startDate.setDate(1); startDate.setHours(0, 0, 0, 0);
      }

      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, subtotal, tax, payment_method, created_at, status")
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString());

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal")
        .in("order_id", (orders ?? []).map((o) => o.id));

      const { data: allMonthlyOrders } = await supabase
        .from("orders")
        .select("total, created_at")
        .eq("status", "completed")
        .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

      const totalRevenue = (orders ?? []).reduce((s, o) => s + Number(o.total), 0);
      const totalOrders = (orders ?? []).length;

      const paymentMap: Record<string, number> = {};
      (orders ?? []).forEach((o) => {
        const m = o.payment_method.replace("_", " ");
        paymentMap[m] = (paymentMap[m] ?? 0) + Number(o.total);
      });

      const productMap: Record<string, { sales: number; revenue: number }> = {};
      (orderItems ?? []).forEach((i) => {
        if (!productMap[i.product_name]) productMap[i.product_name] = { sales: 0, revenue: 0 };
        productMap[i.product_name].sales += i.quantity;
        productMap[i.product_name].revenue += Number(i.subtotal);
      });
      const topProducts = Object.entries(productMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyMap: Record<string, number> = {};
      (orders ?? []).forEach((o) => {
        const day = days[new Date(o.created_at).getDay()];
        dailyMap[day] = (dailyMap[day] ?? 0) + Number(o.total);
      });
      const dailyChartData = days.map((d) => ({ day: d, revenue: dailyMap[d] ?? 0 }));

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap: Record<string, number> = {};
      (allMonthlyOrders ?? []).forEach((o) => {
        const m = monthNames[new Date(o.created_at).getMonth()];
        monthlyMap[m] = (monthlyMap[m] ?? 0) + Number(o.total);
      });
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return monthNames[d.getMonth()];
      });
      const monthlyChartData = last6Months.map((m) => ({ month: m, revenue: monthlyMap[m] ?? 0 }));

      const totalPayments = Object.values(paymentMap).reduce((s, v) => s + v, 0);
      const paymentSummary = Object.entries(paymentMap).map(([method, amount]) => ({
        method,
        amount,
        percent: totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0,
      }));

      return { totalRevenue, totalOrders, dailyChartData, monthlyChartData, topProducts, paymentSummary };
    },
    refetchInterval: 60000,
  });
};

const PERIOD_TABS: Period[] = ["Today", "This Week", "This Month"];
const PAYMENT_COLORS: Record<string, string> = {
  "cash": "bg-[#702bf0]",
  "card": "bg-blue-400",
  "bank transfer": "bg-emerald-400",
};

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("This Week");
  const { data, isLoading } = useReportsData(activePeriod);

  const { data: user } = useUser();
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const summaryCards = [
    { label: "Total Revenue", value: formatCurrency(data?.totalRevenue ?? 0), icon: TrendingUp, positive: true },
    { label: "Total Orders", value: String(data?.totalOrders ?? 0), icon: ShoppingBag, positive: true },
    { label: "Avg Order Value", value: data?.totalOrders ? formatCurrency((data.totalRevenue) / data.totalOrders) : formatCurrency(0), icon: TrendingDown, positive: true },
    { label: "Payment Methods", value: String(data?.paymentSummary.length ?? 0), icon: CreditCard, positive: true },
  ];

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
            <SidebarItem icon={BarChart2} label="Reports" active href="/reports" />
            <SidebarItem icon={Settings} label="Settings" href="/settings" />
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 mx-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-[16px] bg-[#f8f7ff]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#702bf0] to-[#511ae8] flex items-center justify-center shrink-0">
                <span className="text-white text-[12px] font-bold">
                  {user?.email?.charAt(0).toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">Admin</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email ?? ""}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Reports</h1>
              <div className="flex items-center gap-3">
                {PERIOD_TABS.map((tab) => (
                  <button key={tab} onClick={() => setActivePeriod(tab)}
                    className={clsx("px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all",
                      activePeriod === tab ? "bg-[#702bf0] text-white" : "bg-[#f0f4fc] text-slate-500 hover:bg-slate-200"
                    )}>
                    {tab}
                  </button>
                ))}
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90">
                  <Download size={15} />Export
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all text-[13px] font-semibold"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-[#702bf0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] text-slate-400 font-medium">{card.label}</span>
                        <card.icon size={18} className="text-[#702bf0]" />
                      </div>
                      <p className="text-[22px] font-bold text-[#1e1b4b]">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Daily Revenue (PKR)</h3>
                    <div className="w-full" style={{ minHeight: 0, height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={data?.dailyChartData ?? []} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                          <Tooltip formatter={(value: unknown) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Revenue"]} />
                          <Bar dataKey="revenue" fill="#702bf0" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Monthly Revenue Trend</h3>
                    <div className="w-full" style={{ minHeight: 0, height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={data?.monthlyChartData ?? []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                          <Tooltip formatter={(value: unknown) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Revenue"]} />
                          <Line type="monotone" dataKey="revenue" stroke="#702bf0" strokeWidth={2.5} dot={{ r: 4, fill: "white", stroke: "#702bf0", strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Top Products</h3>
                    {(data?.topProducts ?? []).length === 0 ? (
                      <p className="text-slate-300 text-sm text-center py-8">No sales data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {(data?.topProducts ?? []).map((product, i) => (
                          <div key={product.name} className="flex items-center gap-3">
                            <span className="text-[13px] font-bold text-slate-300 w-5">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-[13px] font-medium text-slate-700">{product.name}</span>
                                <span className="text-[13px] font-semibold text-[#702bf0]">{formatCurrency(product.revenue)}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-[#702bf0] to-[#511ae8] h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, (product.sales / ((data?.topProducts[0]?.sales ?? 1))) * 100)}%` }} />
                              </div>
                            </div>
                            <span className="text-[12px] text-slate-400 w-14 text-right">{product.sales} sold</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[15px] font-bold text-[#1e1b4b] mb-4">Payment Summary</h3>
                    {(data?.paymentSummary ?? []).length === 0 ? (
                      <p className="text-slate-300 text-sm text-center py-8">No payment data yet</p>
                    ) : (
                      <div className="space-y-4">
                        {(data?.paymentSummary ?? []).map((item) => (
                          <div key={item.method}>
                            <div className="flex justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={clsx("w-2.5 h-2.5 rounded-full", PAYMENT_COLORS[item.method.toLowerCase()] ?? "bg-slate-400")} />
                                <span className="text-[13px] font-medium text-slate-600 capitalize">{item.method}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[13px] font-semibold text-slate-700">{formatCurrency(item.amount)}</span>
                                <span className="text-[12px] text-slate-400 w-8 text-right">{item.percent}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className={clsx("h-2 rounded-full", PAYMENT_COLORS[item.method.toLowerCase()] ?? "bg-slate-400")}
                                style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-100 flex justify-between">
                          <span className="text-[13px] font-semibold text-slate-500">Total</span>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-slate-400" />
                            <span className="text-[14px] font-bold text-[#1e1b4b]">{formatCurrency(data?.totalRevenue ?? 0)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
