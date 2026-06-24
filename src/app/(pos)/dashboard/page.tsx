"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { useLoadingButton } from "@/lib/hooks/useLoadingButton";
import {
  LayoutGrid,
  Users,
  CircleDollarSign,
  ShoppingCart,
  Receipt,
  Package,
  BarChart2,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import clsx from "clsx";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import { useAppSettings, useCurrency } from "@/components/providers/settings-provider";

// --- Data ---
const lineData = [
  { name: "Mon", cash: 45000, card: 32000, transfer: 18000 },
  { name: "Tue", cash: 38000, card: 41000, transfer: 22000 },
  { name: "Wed", cash: 52000, card: 28000, transfer: 15000 },
  { name: "Thu", cash: 61000, card: 35000, transfer: 28000 },
  { name: "Fri", cash: 48000, card: 55000, transfer: 31000 },
  { name: "Sat", cash: 72000, card: 48000, transfer: 19000 },
];

// --- Subcomponents ---

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

const TopCard = ({
  icon: Icon,
  iconColor,
  title,
  value,
  trend,
  trendPositive,
}: {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
}) => {
  return (
    <div className="bg-white rounded-[26px] p-[26px] flex flex-col h-[200px] shadow-[0_4px_30px_rgba(35,14,216,0.04)] relative overflow-hidden">
      <div>
        <Icon size={24} strokeWidth={1.75} className={clsx("mb-4", iconColor)} />
        <h3 className="text-[#5e687b] font-semibold text-[16px] tracking-tight mb-1">{title}</h3>
        <p className="text-[36px] font-bold text-[#1a1438] tracking-tight">{value}</p>
      </div>

      <div className="flex flex-row items-center gap-3 pt-1 mt-auto text-[15px]">
        <span className="text-[#8e98ab] font-medium tracking-tight text-[15px]">Last 30 days</span>
        {trend && (
          <div
            className={clsx(
              "px-3 py-1.5 rounded-full flex flex-row items-center font-bold text-[13px]",
              trendPositive
                ? "bg-[#e2f8ec] text-[#10b981]"
                : "bg-[#ffeef0] text-[#f43f5e]"
            )}
          >
            <span className="mr-1 text-[13px]">{trendPositive ? "↑" : "↓"}</span> {trend}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
  const appSettings = useAppSettings();
  if (active && payload && payload.length) {
    return (
      <div className="relative z-50">
        <div className="bg-[#1e1b4b] text-white text-[13px] p-3 rounded-xl shadow-xl min-w-[160px]">
          <p className="mb-1 text-slate-200">
            Sales: <span className="text-white font-semibold">{appSettings.currency} {payload[0].value.toLocaleString("en-PK")}</span>
          </p>
          <p className="text-emerald-400 font-medium">↑ vs last month</p>
        </div>
        <div className="absolute left-1/2 bottom-[-6px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e1b4b]"></div>
      </div>
    );
  }
  return null;
};

// --- Page Layout ---

export default function AppDashboard() {
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const fc = useCurrency();
  const appSettings = useAppSettings();
  const formatSalesTooltip = (value: unknown) => [`${appSettings.currency} ${Number(value ?? 0).toLocaleString("en-PK")}`, "Sales"];

  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(appSettings.lowStockThreshold);
  const { data: user } = useUser();

  const barData = stats?.weeklyChartData ?? [
    { name: "Sun", sales: 0 },
    { name: "Mon", sales: 0 },
    { name: "Tue", sales: 0 },
    { name: "Wed", sales: 0 },
    { name: "Thu", sales: 0 },
    { name: "Fri", sales: 0 },
    { name: "Sat", sales: 0 },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="w-full max-w-[1400px] h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-row shadow-xl relative">
        
        {/* --- Sidebar --- */}
        <div className="w-[320px] h-full shrink-0 flex flex-col pt-12 pb-6 px-6 relative z-10">
          {/* Logo */}
          <div className="flex flex-col ml-[18px] mb-[48px]">
            <span className="text-[28px] font-bold text-[#230ed8] leading-none tracking-tight">
              POS System
            </span>
            <span className="text-[13px] text-slate-400 font-medium mt-1">Management Console</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <SidebarItem icon={LayoutGrid} label="Dashboard" active href="/dashboard" />
            <SidebarItem icon={ShoppingCart} label="POS Terminal" href="/pos" />
            <SidebarItem icon={Receipt} label="Orders" href="/orders" />
            <SidebarItem icon={Package} label="Inventory" href="/inventory" />
            <SidebarItem icon={Users} label="Customers" href="/customers" />
            <SidebarItem icon={BarChart2} label="Reports" href="/reports" />
            <SidebarItem icon={Settings} label="Settings" href="/settings" />
          </div>

          {/* User Profile */}
          <div className="mt-auto pt-4 border-t border-slate-100 mx-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-[16px] bg-[#f8f7ff]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#702bf0] to-[#511ae8] flex items-center justify-center shrink-0">
                <span className="text-white text-[12px] font-bold">
                  {user?.email?.charAt(0).toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">{appSettings.storeName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email ?? ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0 flex items-center justify-between">
            <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Dashboard</h1>
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

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <TopCard
              icon={ShoppingCart}
              iconColor="text-[#702bf0]"
              title="Today's Orders"
              value={statsLoading ? "..." : String(stats?.todayOrderCount ?? 0)}
              trend="vs yesterday"
              trendPositive={true}
            />
            <TopCard
              icon={CircleDollarSign}
              iconColor="text-[#702bf0]"
              title="Today's Revenue"
              value={statsLoading ? "..." : fc(stats?.todayRevenue ?? 0)}
              trend="vs yesterday"
              trendPositive={true}
            />
            <TopCard
              icon={Package}
              iconColor="text-[#702bf0]"
              title="Low Stock Items"
              value={statsLoading ? "..." : String(stats?.lowStockCount ?? 0)}
              trend="need restock"
              trendPositive={false}
            />
          </div>

          {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6 mt-6">

              {/* Weekly Sales Index */}
              <div className="col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#1e1b4b]">Weekly Sales Index</h3>
                  <span className="text-[12px] text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-medium">Current Week</span>
                </div>
                <div className="flex-1 w-full" style={{ minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={barData} barSize={28} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={formatSalesTooltip} />
                      <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                        {barData.map((_, index) => (
                          <Cell key={index} fill={index === 2 ? "#702bf0" : "#c4b5fd"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Live Transactions */}
              <div className="col-span-1 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#1e1b4b]">Live Transactions</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] text-emerald-600 font-medium">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {(stats?.recentOrders ?? []).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-b-0">
                      <div>
                        <p className="text-[13px] font-bold text-slate-700">#{tx.order_number.slice(-4)}</p>
                        <p className="text-[12px] text-slate-400 capitalize">{tx.payment_method.replace("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-[#702bf0]">{fc(Number(tx.total))}</p>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                  {(stats?.recentOrders ?? []).length === 0 && !statsLoading && (
                    <p className="text-[13px] text-slate-300 text-center py-4">No transactions yet</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
