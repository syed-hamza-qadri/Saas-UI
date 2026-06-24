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
  BarChart2, Settings, ChevronRight, Search, Plus,
  Phone, Mail, Star, Edit2, Trash2, X,
} from "lucide-react";
import clsx from "clsx";
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from "@/lib/hooks/useCustomers";

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

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: CustomerForm = { name: "", phone: "", email: "" };

export default function CustomersPage() {
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const appSettings = useAppSettings();
  const fc = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  const { data: customers = [], isLoading } = useCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone ?? "").includes(searchQuery) ||
    (c.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedCustomers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = (c: typeof customers[0]) => {
    setForm({ name: c.name, phone: c.phone ?? "", email: c.email ?? "" });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateCustomer.mutateAsync({ id: editId, ...form });
    } else {
      await addCustomer.mutateAsync(form);
    }
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditId(null);
  };

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
            <SidebarItem icon={Users} label="Customers" active href="/customers" />
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

        <div className="flex-1 h-full flex flex-col relative z-0">
          <div className="px-[44px] pt-[44px] pb-[34px] shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">Customers</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search customers..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#f0f4fc] border border-slate-200 rounded-[14px] pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-[#702bf0] w-[220px]" />
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity cursor-pointer">
                  <Plus size={16} />Add Customer
                </button>
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
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Customer</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Contact</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Total Spent</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Loyalty Points</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Joined</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCustomers.map((customer, index) => (
                      <tr key={customer.id} className={clsx("border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors", index === pagedCustomers.length - 1 && "border-b-0")}>
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
                            {customer.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /><span className="text-[12px] text-slate-500">{customer.phone}</span></div>}
                            {customer.email && <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /><span className="text-[12px] text-slate-400">{customer.email}</span></div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-semibold text-[#702bf0]">{fc(customer.total_spent)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-[13px] font-semibold text-slate-700">{customer.loyalty_points} pts</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-400">
                          {new Date(customer.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(customer)} className="w-8 h-8 rounded-[10px] bg-[#f0f4fc] flex items-center justify-center hover:bg-[#e8e2ff] transition-colors cursor-pointer">
                              <Edit2 size={14} className="text-[#702bf0]" />
                            </button>
                            <button onClick={() => setDeleteConfirm(customer.id)} disabled={deleteCustomer.isPending} className="w-8 h-8 rounded-[10px] bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer">
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Users size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No customers found</p>
                  <button onClick={openAdd} className="mt-4 text-[#702bf0] text-sm font-semibold hover:underline">Add your first customer</button>
                </div>
              )}
              {!isLoading && filtered.length > 0 && (
                <div className="px-6 py-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-[#1e1b4b]">{editId ? "Edit Customer" : "Add Customer"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="Customer name" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="+92 300 0000000" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="customer@email.com" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200 cursor-pointer">Cancel</button>
                <button type="submit" disabled={addCustomer.isPending || updateCustomer.isPending}
                  className="flex-1 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-3 rounded-[14px] font-bold text-sm disabled:opacity-50 hover:opacity-90 cursor-pointer">
                  {addCustomer.isPending || updateCustomer.isPending ? "Saving..." : editId ? "Update" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-[18px] font-bold text-[#1e1b4b] text-center mb-2">Delete Customer?</h2>
            <p className="text-[13px] text-slate-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm">Cancel</button>
              <button onClick={async () => { await deleteCustomer.mutateAsync(deleteConfirm); setDeleteConfirm(null); }}
                disabled={deleteCustomer.isPending}
                className="flex-1 bg-red-500 text-white py-3 rounded-[14px] font-bold text-sm hover:bg-red-600 disabled:opacity-50 cursor-pointer">
                {deleteCustomer.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
