"use client";

import React from "react";
import {
  LayoutGrid,
  Users,
  FileText,
  MessageSquare,
  MessageSquareMore,
  Sparkles,
  Mic,
  BookOpen,
  Newspaper,
  DollarSign,
  CircleDollarSign,
  Megaphone,
  Menu,
  Equal,
  ChevronRight,
  Image as ImageIcon,
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

// --- Data ---
const barData = [
  { name: "Feb", users: 4300 },
  { name: "Mar", users: 5000 },
  { name: "Apr", users: 2600 },
  { name: "May", users: 4000 },
  { name: "Jun", users: 1800 },
  { name: "Jul", users: 3100 },
];

const lineData = [
  { name: "1", v1: 2000, v2: 1500, v3: 2500, v4: 1800 },
  { name: "2", v1: 1900, v2: 2400, v3: 3100, v4: 2100 },
  { name: "3", v1: 2200, v2: 1500, v3: 2900, v4: 1200 },
  { name: "4", v1: 2800, v2: 2200, v3: 3500, v4: 1700 },
  { name: "5", v1: 3200, v2: 2800, v3: 4000, v4: 2400 },
  { name: "6", v1: 3000, v2: 2500, v3: 3800, v4: 2200 },
];

// --- Subcomponents ---

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) => {
  return (
    <div
      className={clsx(
        "flex flex-row items-center justify-between px-[20px] py-[14px] cursor-pointer transition-colors duration-200 group mb-[4px]",
        active
          ? "bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white rounded-[24px]"
          : "text-slate-600 hover:bg-slate-50 rounded-[24px]"
      )}
    >
      <div className="flex flex-row items-center gap-[18px]">
        <Icon size={22} strokeWidth={1.75} className={clsx(active ? "text-white" : "text-[#7b8396] group-hover:text-slate-700")} />
        <span className={clsx("text-[16px] font-semibold tracking-tight", active ? "text-white" : "text-[#5e687b] group-hover:text-slate-800")}>{label}</span>
      </div>
      {!active && <ChevronRight size={18} strokeWidth={2} className="text-[#c1c6d4] group-hover:text-slate-400" />}
    </div>
  );
};

const TopCard = ({
  icon: Icon,
  iconColor,
  title,
  value,
  trend,
  trendPositive,
}: {
  icon: any;
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

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="relative z-50">
        <div className="bg-[#1e1b4b] text-white text-[13px] p-3 rounded-xl shadow-xl min-w-[150px]">
          <p className="mb-1 text-slate-200">
            New User <span className="text-white font-semibold">: {payload[0].value / 10}K</span>
          </p>
          <p className="text-emerald-400 font-medium">
            ↑ 49% <span className="text-slate-300 font-normal">than last month</span>
          </p>
        </div>
        <div className="absolute left-1/2 bottom-[-6px] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e1b4b]"></div>
      </div>
    );
  }
  return null;
};

// --- Page Layout ---

export default function AppDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-[1400px] h-full sm:h-[860px] bg-white rounded-[2.5rem] overflow-hidden flex flex-row shadow-xl relative">
        
        {/* --- Sidebar --- */}
        <div className="w-[320px] h-full shrink-0 flex flex-col pt-12 pb-6 px-6 relative z-10">
          {/* Logo */}
          <div className="flex flex-col ml-[18px] mb-[48px] mr-12">
            <div className="text-[44px] font-bold text-[#230ed8] leading-none tracking-[-0.04em] flex items-baseline">
              <span className="relative">
                <span className="absolute -left-[6px] top-[19px] w-[14px] h-[5px] bg-[#230ed8] rounded-full rotate-[65deg] transform origin-right"></span>
                p
              </span>
              anze
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <SidebarItem icon={LayoutGrid} label="Overview" active />
            <div className="mt-4">
              <SidebarItem icon={Users} label="Personal" />
              <SidebarItem icon={FileText} label="Use Cases Templates" />
              <SidebarItem icon={MessageSquareMore} label="Chat Templates" />
              <SidebarItem icon={Sparkles} label="AI Features" />
              <SidebarItem icon={Mic} label="AI Voices" />
              <SidebarItem icon={Newspaper} label="Blogs" />
              <SidebarItem icon={CircleDollarSign} label="Subscriptions" />
              <SidebarItem icon={Megaphone} label="Marketing" />
              <SidebarItem icon={Equal} label="Menus" />
            </div>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Overview</h1>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <TopCard
              icon={Users}
              iconColor="text-[#702bf0]"
              title="Users"
              value="430"
              trend="32.54%"
              trendPositive={true}
            />
            <TopCard
              icon={CircleDollarSign}
              iconColor="text-[#702bf0]"
              title="Subscriptions"
              value="360"
              trend="32.54%"
              trendPositive={false}
            />
            <TopCard
              icon={ImageIcon}
              iconColor="text-[#702bf0]"
              title="Generated Images"
              value="43,583"
              trend="20.50%"
              trendPositive={true}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[460px]">
            {/* Bar Chart Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex flex-row items-center justify-between mb-8 px-2">
                <h3 className="text-[24px] font-bold text-[#1a1438] tracking-tight">Total New Users</h3>
                <div className="bg-slate-50 text-slate-500 px-4 py-2 flex items-center justify-center gap-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                  6 months <ChevronRight size={14} className="rotate-90 ml-1" />
                </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 13 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94a3b8", fontSize: 13 }} 
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'transparent'}}/>
                    <Bar dataKey="users" radius={[12, 12, 12, 12]} barSize={48}>
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === "Mar" ? "#8b5cf6" : "#f5f3ff"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center mt-6">
                <div className="flex items-center gap-2 text-[14px] text-slate-600 font-medium">
                  <div className="w-3 h-3 rounded-md bg-purple-500"></div>
                  Total New Registered Users
                </div>
              </div>
            </div>

            {/* Line Chart Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
              <div className="flex flex-row items-center justify-between mb-8 px-2">
                <h3 className="text-[24px] font-bold text-[#1a1438] tracking-tight">Total New Users</h3>
              </div>

              <div className="flex-1 w-full min-h-0 ml-[-12px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" vertical={true} horizontal={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 13 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94a3b8", fontSize: 13 }} 
                      tickFormatter={(value) => `${value / 1000}K`}
                    />
                    <Line type="linear" dataKey="v1" stroke="#3b82f6" strokeWidth={2} dot={{r: 4, fill: "white", stroke: "#3b82f6", strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="linear" dataKey="v2" stroke="#f97316" strokeWidth={2} dot={{r: 4, fill: "white", stroke: "#f97316", strokeWidth: 2}} />
                    <Line type="linear" dataKey="v3" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2}} />
                    <Line type="linear" dataKey="v4" stroke="#a855f7" strokeWidth={2} dot={{r: 4, fill: "white", stroke: "#a855f7", strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-4">
               {/* Optional Legend for accuracy, though clipped in image */}
              </div>
            </div>

          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
