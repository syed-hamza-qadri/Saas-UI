"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  LayoutGrid, ShoppingCart, Receipt, Package, Users,
  BarChart2, Settings, ChevronRight, Search, Plus,
  Edit2, Trash2, AlertTriangle,
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

interface MockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock_qty: number;
  low_stock_threshold: number;
}

const MOCK_PRODUCTS: MockProduct[] = [
  { id: "1", name: "Mineral Water 500ml", sku: "BEV001", category: "Beverages", price: 50, cost: 30, stock_qty: 150, low_stock_threshold: 20 },
  { id: "2", name: "Green Tea", sku: "BEV002", category: "Beverages", price: 120, cost: 70, stock_qty: 8, low_stock_threshold: 15 },
  { id: "3", name: "Orange Juice 1L", sku: "BEV003", category: "Beverages", price: 180, cost: 110, stock_qty: 45, low_stock_threshold: 10 },
  { id: "4", name: "Chicken Burger", sku: "FOD001", category: "Food", price: 350, cost: 200, stock_qty: 30, low_stock_threshold: 10 },
  { id: "5", name: "Veggie Wrap", sku: "FOD002", category: "Food", price: 280, cost: 160, stock_qty: 5, low_stock_threshold: 10 },
  { id: "6", name: "Cheese Pizza Slice", sku: "FOD003", category: "Food", price: 220, cost: 130, stock_qty: 40, low_stock_threshold: 10 },
  { id: "7", name: "Lays Chips Classic", sku: "SNK001", category: "Snacks", price: 60, cost: 40, stock_qty: 200, low_stock_threshold: 30 },
  { id: "8", name: "Kurkure Masala", sku: "SNK002", category: "Snacks", price: 40, cost: 25, stock_qty: 12, low_stock_threshold: 30 },
  { id: "9", name: "Milk 1L", sku: "DAI001", category: "Dairy", price: 160, cost: 100, stock_qty: 60, low_stock_threshold: 15 },
  { id: "10", name: "Yogurt 500g", sku: "DAI002", category: "Dairy", price: 120, cost: 75, stock_qty: 4, low_stock_threshold: 15 },
  { id: "11", name: "Croissant", sku: "BAK001", category: "Bakery", price: 90, cost: 50, stock_qty: 35, low_stock_threshold: 10 },
  { id: "12", name: "Chocolate Muffin", sku: "BAK002", category: "Bakery", price: 110, cost: 65, stock_qty: 28, low_stock_threshold: 10 },
];

const CATEGORIES = ["All", "Beverages", "Food", "Snacks", "Dairy", "Bakery"];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockCount = MOCK_PRODUCTS.filter((p) => p.stock_qty <= p.low_stock_threshold).length;

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
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white px-5 py-2.5 rounded-[14px] font-semibold text-[14px] hover:opacity-90 transition-opacity">
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all",
                    activeCategory === cat
                      ? "bg-[#702bf0] text-white shadow-sm"
                      : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                  )}
                >
                  {cat}
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
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Product</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">SKU</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Category</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Price</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Cost</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Stock</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, index) => {
                    const isLow = product.stock_qty <= product.low_stock_threshold;
                    return (
                      <tr
                        key={product.id}
                        className={clsx(
                          "border-b border-slate-50 hover:bg-[#f8f7ff] transition-colors",
                          index === filtered.length - 1 && "border-b-0"
                        )}
                      >
                        <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">{product.name}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-400 font-mono">{product.sku}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">{product.category}</td>
                        <td className="px-6 py-4 text-[13px] font-semibold text-[#702bf0]">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">{formatCurrency(product.cost)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle size={14} className="text-amber-500" />}
                            <span className={clsx("text-[13px] font-semibold", isLow ? "text-amber-600" : "text-slate-700")}>
                              {product.stock_qty}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[12px] font-semibold",
                            isLow ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          )}>
                            {isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-[10px] bg-[#f0f4fc] flex items-center justify-center hover:bg-[#e8e2ff] transition-colors">
                              <Edit2 size={14} className="text-[#702bf0]" />
                            </button>
                            <button className="w-8 h-8 rounded-[10px] bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Package size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
