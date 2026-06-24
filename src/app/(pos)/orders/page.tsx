"use client";

import React, { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/Pagination";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSettings, useCurrency } from "@/components/providers/settings-provider";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { useLoadingButton } from "@/lib/hooks/useLoadingButton";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Search, Eye, RotateCcw, XCircle,
} from "lucide-react";
import clsx from "clsx";
import { useOrders, useOrderItems, useUpdateOrderStatus } from "@/lib/hooks/useOrders";

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

type OrderStatus = "completed" | "pending" | "refunded" | "voided";

const STATUS_STYLES: Record<OrderStatus, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  refunded: "bg-blue-50 text-blue-700",
  voided: "bg-red-50 text-red-600",
};

const FILTER_TABS = ["All", "Completed", "Pending", "Refunded", "Voided"] as const;

export default function OrdersPage() {
  const { loading: printLoading, withLoading: withPrintLoading } = useLoadingButton();
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const appSettings = useAppSettings();
  const fc = useCurrency();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: user } = useUser();
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [viewOrder, setViewOrder] = useState<typeof orders[0] | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "voided" | "refunded" } | null>(null);
  const { data: orderItems = [], isLoading: itemsLoading } = useOrderItems(viewOrder?.id ?? null);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === "All" || order.status === activeFilter.toLowerCase();
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Reset to page 1 when filters or search change
  useEffect(() => { setPage(1); }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[28px] font-bold text-[#1e1b4b] tracking-tight">Orders</h1>
              <div className="flex items-center gap-3">
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
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {FILTER_TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveFilter(tab)}
                    className={clsx("px-5 py-2 rounded-[12px] text-[13px] font-semibold transition-all cursor-pointer",
                      activeFilter === tab ? "bg-[#702bf0] text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                    )}>
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-slate-400 font-medium">{filteredOrders.length} orders</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f0f4fc] rounded-tl-[2.5rem] px-[44px] py-[34px]">
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-100">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-[#702bf0] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Order #</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Subtotal</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Tax</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Total</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Payment</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Status</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Date</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order, index) => {
                      const status = order.status as OrderStatus;
                      return (
                        <tr key={order.id} className={clsx("border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors", index === pagedOrders.length - 1 && "border-b-0")}>
                          <td className="px-6 py-4 text-[13px] font-bold text-[#702bf0]">#{order.order_number.slice(-4)}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-600">{order.subtotal.toLocaleString("en-PK")}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-500">{order.tax.toLocaleString("en-PK")}</td>
                          <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">{order.total.toLocaleString("en-PK")}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-500 capitalize">{order.payment_method.replace("_", " ")}</td>
                          <td className="px-6 py-4">
                            <span className={clsx("px-3 py-1 rounded-full text-[12px] font-semibold capitalize", STATUS_STYLES[status])}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-400 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setViewOrder(order)} className="w-8 h-8 rounded-[10px] bg-[#f0f4fc] flex items-center justify-center hover:bg-[#e8e2ff] transition-colors cursor-pointer">
                                <Eye size={15} className="text-[#702bf0]" />
                              </button>
                              {order.status === "completed" && (
                                <>
                                  <button onClick={() => setActionConfirm({ id: order.id, action: "refunded" })}
                                    className="w-8 h-8 rounded-[10px] bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer" title="Refund">
                                    <RotateCcw size={14} className="text-blue-500" />
                                  </button>
                                  <button onClick={() => setActionConfirm({ id: order.id, action: "voided" })}
                                    className="w-8 h-8 rounded-[10px] bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer" title="Void">
                                    <XCircle size={14} className="text-red-500" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!isLoading && filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Receipt size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No orders found</p>
                </div>
              )}
              {!isLoading && filteredOrders.length > 0 && (
                <div className="px-6 py-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={filteredOrders.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {viewOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-[20px] font-bold text-[#1e1b4b]">{appSettings.storeName}</h2>
              <p className="text-slate-400 text-sm">Order Receipt</p>
              <p className="text-slate-500 text-xs mt-1">#{viewOrder.order_number.slice(-4)}</p>
              <p className="text-slate-400 text-xs">{new Date(viewOrder.created_at).toLocaleString("en-PK")}</p>
            </div>
            <div className="border-t border-dashed border-slate-200 mb-4" />
            {itemsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#702bf0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-medium text-slate-700">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">{item.quantity} x {fc(Number(item.unit_price))}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-700">{fc(Number(item.subtotal))}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-dashed border-slate-200 mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span><span>{fc(Number(viewOrder.subtotal))}</span>
              </div>
              {viewOrder.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span><span>- {fc(Number(viewOrder.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>GST (17%)</span><span>{fc(Number(viewOrder.tax))}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1e1b4b] text-[15px] pt-2 border-t border-slate-100">
                <span>Total</span><span>{fc(Number(viewOrder.total))}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Payment</span><span className="capitalize">{viewOrder.payment_method.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Status</span>
                <span className={clsx("px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize", STATUS_STYLES[viewOrder.status as OrderStatus])}>
                  {viewOrder.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => withPrintLoading(async () => window.print())} disabled={printLoading} className="flex-1 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-3 rounded-[14px] font-bold text-sm hover:opacity-90 cursor-pointer disabled:opacity-50">{printLoading ? "Printing..." : "Print"}</button>
              <button onClick={() => setViewOrder(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
      {actionConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-2xl">
            <div className={clsx("flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4",
              actionConfirm.action === "voided" ? "bg-red-50" : "bg-blue-50"
            )}>
              {actionConfirm.action === "voided"
                ? <XCircle size={24} className="text-red-500" />
                : <RotateCcw size={24} className="text-blue-500" />
              }
            </div>
            <h2 className="text-[18px] font-bold text-[#1e1b4b] text-center mb-2 capitalize">
              {actionConfirm.action === "voided" ? "Void Order?" : "Refund Order?"}
            </h2>
            <p className="text-[13px] text-slate-400 text-center mb-6">
              Stock will be restored automatically. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActionConfirm(null)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateStatus.mutateAsync({ id: actionConfirm.id, status: actionConfirm.action });
                  setActionConfirm(null);
                }}
                disabled={updateStatus.isPending}
                className={clsx("flex-1 text-white py-3 rounded-[14px] font-bold text-sm disabled:opacity-50",
                  actionConfirm.action === "voided" ? "bg-red-500 hover:bg-red-600 cursor-pointer" : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                )}>
                {updateStatus.isPending ? "Processing..." : actionConfirm.action === "voided" ? "Void Order" : "Refund Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
