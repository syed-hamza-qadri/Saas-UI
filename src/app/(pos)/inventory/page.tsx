"use client";

import React, { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/Pagination";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { useLoadingButton } from "@/lib/hooks/useLoadingButton";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Search, Plus,
  Edit2, Trash2, AlertTriangle, Eye, EyeOff, X,
} from "lucide-react";
import clsx from "clsx";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useToggleProductVisibility } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAppSettings, useCurrency } from "@/components/providers/settings-provider";

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

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  price: string;
  cost: string;
  category_id: string;
  stock_qty: string;
  low_stock_threshold: string;
  is_active: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "", sku: "", barcode: "", price: "", cost: "",
  category_id: "", stock_qty: "", low_stock_threshold: "10", is_active: true,
};

export default function InventoryPage() {
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const fc = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const appSettings = useAppSettings();
  const { data: user } = useUser();
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleVisibility = useToggleProductVisibility();

  const allCategories = ["All", ...categories.map((c) => c.name)];

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || categories.find((c) => c.id === p.category_id)?.name === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reset to page 1 when filters or search change
  useEffect(() => { setPage(1); }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowStockCount = products.filter((p) => p.stock_qty <= appSettings.lowStockThreshold).length;

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = (p: typeof products[0]) => {
    setForm({
      name: p.name, sku: p.sku, barcode: p.barcode ?? "",
      price: String(p.price), cost: String(p.cost),
      category_id: p.category_id ?? "", stock_qty: String(p.stock_qty),
      low_stock_threshold: "10", is_active: p.is_active,
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, sku: form.sku, barcode: form.barcode || undefined,
      price: Number(form.price), cost: Number(form.cost),
      category_id: form.category_id || "",
      stock_qty: Number(form.stock_qty),
      is_active: form.is_active,
    };
    if (editId) {
      await updateProduct.mutateAsync({ id: editId, ...payload });
    } else {
      await addProduct.mutateAsync(payload);
    }
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
    } finally {
      setDeleteConfirm(null);
    }
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
            <SidebarItem icon={Package} label="Inventory" active href="/inventory" />
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-[28px] font-bold text-[#1e1b4b] tracking-tight">Inventory</h1>
                {lowStockCount > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-[13px] text-amber-600 font-medium">{lowStockCount} items low on stock</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-[14px] pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-[#702bf0] shadow-sm w-[220px]"
                  />
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity cursor-pointer">
                  <Plus size={16} />
                  Add Product
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
            <div className="flex gap-2">
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={clsx("px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all cursor-pointer",
                    activeCategory === cat ? "bg-[#702bf0] text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                  )}>
                  {cat}
                </button>
              ))}
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
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Product</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">SKU</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Category</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Price</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Cost</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Stock</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Status</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Show in POS</th>
                      <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((product, index) => {
                      const isLow = product.stock_qty <= appSettings.lowStockThreshold;
                      const catName = categories.find((c) => c.id === product.category_id)?.name ?? "—";
                      return (
                        <tr key={product.id} className={clsx("border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors", index === pagedProducts.length - 1 && "border-b-0")}>
                          <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">{product.name}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-400 font-mono">{product.sku}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-500">{catName}</td>
                          <td className="px-6 py-4 text-[13px] font-semibold text-[#702bf0]">{fc(product.price)}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-500">{fc(product.cost)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isLow && <AlertTriangle size={14} className="text-amber-500" />}
                              <span className={clsx("text-[13px] font-semibold", isLow ? "text-amber-600" : "text-slate-700")}>{product.stock_qty}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={clsx("px-3 py-1 rounded-full text-[12px] font-semibold", isLow ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                              {isLow ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleVisibility.mutate({ id: product.id, is_active: !product.is_active })}
                              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all",
                                product.is_active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer" : "bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer"
                              )}>
                              {product.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                              {product.is_active ? "Visible" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-[10px] bg-[#f0f4fc] flex items-center justify-center hover:bg-[#e8e2ff] transition-colors cursor-pointer">
                                <Edit2 size={14} className="text-[#702bf0]" />
                              </button>
                              <button onClick={() => setDeleteConfirm(product.id)} disabled={deleteProduct.isPending} className="w-8 h-8 rounded-[10px] bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer">
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Package size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No products found</p>
                  <button onClick={openAdd} className="mt-4 text-[#702bf0] text-sm font-semibold hover:underline">Add your first product</button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-[#1e1b4b]">{editId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="Product name" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">SKU *</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="e.g. BEV001" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Selling Price (PKR) *</label>
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Purchase Cost (PKR)</label>
                  <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Stock Quantity *</label>
                  <input required type="number" min="0" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="0" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Barcode</label>
                  <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0]" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-[12px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#702bf0] bg-white">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#702bf0]" />
                <label htmlFor="is_active" className="text-[13px] font-semibold text-slate-600">Show in POS Terminal</label>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={addProduct.isPending || updateProduct.isPending}
                  className="flex-1 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-3 rounded-[14px] font-bold text-sm disabled:opacity-50 hover:opacity-90 cursor-pointer">
                  {addProduct.isPending || updateProduct.isPending ? "Saving..." : editId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-[18px] font-bold text-[#1e1b4b] text-center mb-2">Delete Product?</h2>
            <p className="text-[13px] text-slate-400 text-center mb-6">This action cannot be undone. The product will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200 cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteProduct.isPending}
                className="flex-1 bg-red-500 text-white py-3 rounded-[14px] font-bold text-sm hover:bg-red-600 disabled:opacity-50 cursor-pointer">
                {deleteProduct.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
