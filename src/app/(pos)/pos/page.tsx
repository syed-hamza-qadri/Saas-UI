"use client";

import React, { useState, useRef, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { useLoadingButton } from "@/lib/hooks/useLoadingButton";
import {
  Search, ShoppingCart, Trash2, Plus, Minus, User,
  CreditCard, Banknote, Building2, X, ChevronRight,
  LayoutGrid, Receipt, Package, Users, BarChart2,
  Settings, Barcode, Tag,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { calculateSubtotal, calculateTotal } from "@/lib/utils/tax";
import { useAppSettings, useCurrency } from "@/components/providers/settings-provider";
import type { CartItem } from "@/types";
import { useActiveProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { useCustomers } from "@/lib/hooks/useCustomers";

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

const PaymentModal = ({
  total, onClose, onConfirm, appSettings, isPending
}: { total: number; onClose: () => void; onConfirm: (method: string) => void; appSettings: { cashPayment: boolean; cardPayment: boolean; bankTransfer: boolean; walletName: string; walletNumber: string; currency: string; }, isPending?: boolean }) => {
  const fc = useCurrency();
  const availableMethods = [
    { id: "cash", label: "Cash", enabled: appSettings.cashPayment },
    { id: "card", label: "Card", enabled: appSettings.cardPayment },
    { id: "bank_transfer", label: "Bank", enabled: appSettings.bankTransfer },
  ].filter(m => m.enabled);
  
  const [method, setMethod] = useState<"cash" | "card" | "bank_transfer">(
    availableMethods[0]?.id as "cash" | "card" | "bank_transfer" ?? "cash"
  );
  const [cashReceived, setCashReceived] = useState("");
  const change = method === "cash" ? Math.max(0, Number(cashReceived) - total) : 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-bold text-[#1e1b4b]">Charge Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>
        <div className="bg-[#f0f4fc] rounded-[16px] p-4 mb-6 text-center">
          <p className="text-slate-500 text-sm mb-1">Total Amount</p>
          <p className="text-[36px] font-bold text-[#1e1b4b]">{fc(total)}</p>
        </div>
        {availableMethods.length === 0 && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl text-center">
              <p className="text-slate-500 text-sm mb-4">No payment methods are enabled. Please enable at least one in Settings.</p>
              <button onClick={onClose} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-[14px] font-bold text-sm cursor-pointer">Close</button>
            </div>
          </div>
        )}
        <p className="text-slate-500 text-sm font-medium mb-3">Payment Method</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: "cash", label: "Cash", icon: Banknote, enabled: appSettings.cashPayment },
            { id: "card", label: "Card", icon: CreditCard, enabled: appSettings.cardPayment },
            { id: "bank_transfer", label: "Bank", icon: Building2, enabled: appSettings.bankTransfer },
          ].filter(m => m.enabled).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setMethod(id as "cash" | "card" | "bank_transfer")} disabled={isPending}
              className={clsx("flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 transition-all",
                method === id ? "border-[#702bf0] bg-[#f5f0ff] cursor-pointer disabled:opacity-50" : "border-slate-200 hover:border-slate-300 cursor-pointer disabled:opacity-50"
              )}>
              <Icon size={22} className={method === id ? "text-[#702bf0]" : "text-slate-400"} />
              <span className={clsx("text-[13px] font-semibold", method === id ? "text-[#702bf0]" : "text-slate-500")}>{label}</span>
            </button>
          ))}
        </div>
        
        {method === "bank_transfer" && (appSettings.walletName || appSettings.walletNumber) && (
  <div className="mb-4 bg-emerald-50 rounded-[12px] px-4 py-3">
    {appSettings.walletName && <p className="text-[12px] text-emerald-500 font-medium">{appSettings.walletName}</p>}
    {appSettings.walletNumber && <p className="text-[14px] font-bold text-emerald-700">{appSettings.walletNumber}</p>}
  </div>
)}
        {method === "cash" && (
          <div className="mb-6">
            <label className="text-slate-500 text-sm font-medium mb-2 block">Cash Received ({appSettings.currency})</label>
            <input type="number" min={0} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Enter amount"
              className="w-full border-2 border-slate-200 rounded-[12px] px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-[#702bf0]" />
            {Number(cashReceived) > 0 && (
              <div className="mt-3 flex justify-between items-center bg-emerald-50 rounded-[12px] px-4 py-3">
                <span className="text-emerald-700 font-medium text-sm">Change</span>
                <span className="text-emerald-700 font-bold text-[16px]">{fc(change)}</span>
              </div>
            )}
          </div>
        )}
        <button onClick={() => onConfirm(method)}
          disabled={availableMethods.length === 0 || (method === "cash" && Number(cashReceived) < total) || isPending}
          className="w-full bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-4 rounded-[16px] font-bold text-[16px] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer">
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

const ReceiptModal = ({ items, subtotal, tax, discount, total, method, orderNumber, onClose, appSettings }: {
  items: CartItem[]; subtotal: number; tax: number; discount: number;
  total: number; method: string; orderNumber: string; onClose: () => void;
  appSettings: { taxRate: number; receiptFooter: string; storeName: string; currency: string; };
}) => {
  const fc = useCurrency();
  const { loading: printLoading, withLoading: withPrintLoading } = useLoadingButton();
  return (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold text-[#1e1b4b]">{appSettings.storeName}</h2>
        <p className="text-slate-400 text-sm">Receipt</p>
        <p className="text-slate-500 text-xs mt-1">Order #{orderNumber}</p>
        <p className="text-slate-400 text-xs">{new Date().toLocaleString("en-PK")}</p>
      </div>
      <div className="border-t border-dashed border-slate-200 mb-4" />
      {items.map((item) => (
        <div key={item.product_id} className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[13px] font-medium text-slate-700">{item.name}</p>
            <p className="text-[12px] text-slate-400">{item.quantity} x {appSettings.currency} {Number(item.price).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[13px] font-semibold text-slate-700">{appSettings.currency} {Number(item.subtotal).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      ))}
      <div className="border-t border-dashed border-slate-200 mt-4 mb-4" />
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{appSettings.currency} {Number(subtotal).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        {discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>- {appSettings.currency} {Number(discount).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
        <div className="flex justify-between text-sm text-slate-500"><span>GST ({Math.round(appSettings.taxRate * 100)}%)</span><span>{appSettings.currency} {Number(tax).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between font-bold text-[#1e1b4b] text-[15px] pt-1 border-t border-slate-100"><span>Total</span><span>{appSettings.currency} {Number(total).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-sm text-slate-500"><span>Payment</span><span className="capitalize">{method.replace("_", " ")}</span></div>
      </div>
      {appSettings.receiptFooter && (
        <p className="text-center text-[11px] text-slate-400 mt-2 mb-4">{appSettings.receiptFooter}</p>
      )}
      <div className="flex gap-3">
        <button onClick={() => withPrintLoading(async () => window.print())} disabled={printLoading} className="flex-1 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-3 rounded-[14px] font-bold text-sm hover:opacity-90 cursor-pointer disabled:opacity-50">{printLoading ? "Printing..." : "Print"}</button>
        <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-[14px] font-bold text-sm hover:bg-slate-200">Close</button>
      </div>
    </div>
  </div>
);
};

export default function POSTerminal() {
  const { loading: logoutLoading, withLoading: withLogoutLoading } = useLoadingButton();
  const fc = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const appSettings = useAppSettings();

  const { data: user } = useUser();
  const { data: customers = [] } = useCustomers();
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone ?? "").includes(customerSearch)
  );

  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: products = [], isLoading } = useActiveProducts();
  const { data: categories = [] } = useCategories();
  const createOrder = useCreateOrder();

  useEffect(() => { barcodeRef.current?.focus(); }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_qty) {
          toast.error(`Only ${product.stock_qty} in stock`);
          return prev;
        }
        return prev.map((i) => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: calculateSubtotal(i.price, i.quantity + 1) } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, discount: 0, subtotal: calculateSubtotal(product.price, 1) }];
    });
  };

  const updateQty = (product_id: string, qty: number) => {
    if (qty <= 0) { setCartItems((prev) => prev.filter((i) => i.product_id !== product_id)); return; }
    const product = products.find((p) => p.id === product_id);
    if (product && qty > product.stock_qty) {
      toast.error(`Only ${product.stock_qty} in stock`);
      return;
    }
    setCartItems((prev) => prev.map((i) => i.product_id === product_id ? { ...i, quantity: qty, subtotal: calculateSubtotal(i.price, qty) } : i));
  };

  const removeFromCart = (product_id: string) => setCartItems((prev) => prev.filter((i) => i.product_id !== product_id));

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const product = products.find((p) => p.barcode === barcodeInput);
      if (product) addToCart(product);
      setBarcodeInput("");
    }
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmount = Math.min(subtotal * (discountPercent / 100), subtotal * appSettings.maxCashierDiscount);
  const tax = Math.round((subtotal - discountAmount) * appSettings.taxRate * 100) / 100;
  const total = calculateTotal(subtotal, tax, discountAmount);

  const handleConfirmPayment = async (method: string) => {
    try {
      const orderId = await createOrder.mutateAsync({
        order: {
          customer_id: selectedCustomer?.id,
          subtotal,
          tax,
          discount: discountAmount,
          total,
          status: "completed",
          payment_method: method as "cash" | "card" | "bank_transfer" | "split",
        },
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount: item.discount,
          subtotal: item.subtotal,
        })),
      });
      const supabase = createClient();
      const { data: orderData } = await supabase
        .from("orders")
        .select("order_number")
        .eq("id", orderId)
        .single();
      setPaymentMethod(method);
      setOrderNumber(orderData?.order_number ?? String(orderId).slice(-6));
      setShowPayment(false);
      setShowReceipt(true);
    } catch {
      // error handled by mutation onError
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCartItems([]);
    setDiscountPercent(0);
    setPaymentMethod("");
    setSelectedCustomer(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-200 to-purple-300 flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="w-full max-w-[1400px] h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-row shadow-xl relative">

        {/* Sidebar */}
        <div className="w-[280px] h-full shrink-0 flex flex-col pt-12 pb-6 px-6 relative z-10">
          <div className="flex flex-col ml-[18px] mb-[48px]">
            <span className="text-[28px] font-bold text-[#230ed8] leading-none tracking-tight">POS System</span>
            <span className="text-[13px] text-slate-400 font-medium mt-1">Management Console</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <SidebarItem icon={LayoutGrid} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={ShoppingCart} label="POS Terminal" active href="/pos" />
            <SidebarItem icon={Receipt} label="Orders" href="/orders" />
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
        <div className="flex-1 h-full flex flex-row bg-[#f0f4fc] overflow-hidden">

          {/* Left: Products Panel */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[26px] font-bold text-[#1e1b4b] tracking-tight">POS Terminal</h1>
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
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search products..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[14px] pl-11 pr-4 py-3 text-[14px] focus:outline-none focus:border-[#702bf0] shadow-sm" />
              </div>
              <div className="relative">
                <Barcode size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={barcodeRef} type="text" placeholder="Scan barcode..." value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeEnter}
                  className="bg-white border border-slate-200 rounded-[14px] pl-11 pr-4 py-3 text-[14px] focus:outline-none focus:border-[#702bf0] shadow-sm w-[180px]" />
              </div>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setSelectedCategory("all")}
                className={clsx("px-4 py-2 rounded-[12px] text-[13px] font-semibold whitespace-nowrap transition-all",
                  selectedCategory === "all" ? "bg-[#702bf0] text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 cursor-pointer")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={clsx("px-4 py-2 rounded-[12px] text-[13px] font-semibold whitespace-nowrap transition-all",
                    selectedCategory === cat.id ? "bg-[#702bf0] text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 cursor-pointer")}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide pt-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-[#702bf0] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <button key={product.id} onClick={() => product.stock_qty > 0 && addToCart(product)}
                      disabled={product.stock_qty === 0}
                      className={clsx(
                        "bg-white rounded-[18px] p-4 text-left transition-all border cursor-pointer",
                        product.stock_qty === 0
                          ? "opacity-50 cursor-not-allowed border-slate-100"
                          : "hover:shadow-md hover:border-[#702bf0]/30 border-slate-100 group"
                      )}>
                      <p className="text-[13px] font-semibold text-slate-700 mb-1 line-clamp-2 leading-tight">{product.name}</p>
                      <p className="text-[11px] text-slate-400 mb-2">{product.sku}</p>
                      <p className="text-[14px] font-bold text-[#702bf0]">{fc(product.price)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={clsx("w-2 h-2 rounded-full",
                          product.stock_qty === 0 ? "bg-red-400" :
                          product.stock_qty > 20 ? "bg-emerald-400" : "bg-amber-400"
                        )} />
                        <span className="text-[11px] text-slate-400">
                          {product.stock_qty === 0 ? "Out of Stock" : `Stock: ${product.stock_qty}`}
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-3 flex flex-col items-center justify-center h-40 text-slate-400">
                      <Package size={40} className="mb-3 opacity-30" />
                      <p className="text-sm">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart Panel */}
          <div className="w-[340px] shrink-0 bg-white flex flex-col h-full shadow-lg">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-bold text-[#1e1b4b]">Current Order</h2>
                <div className="w-7 h-7 rounded-full bg-[#702bf0] flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">{cartItems.length}</span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  className="w-full flex items-center gap-3 bg-[#f0f4fc] rounded-[12px] px-4 py-2.5 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <User size={16} className="text-slate-400" />
                  {selectedCustomer ? (
                    <span className="text-[13px] text-[#702bf0] font-semibold flex-1 text-left">{selectedCustomer.name}</span>
                  ) : (
                    <span className="text-[13px] text-slate-400 font-medium flex-1 text-left">Select Customer (optional)</span>
                  )}
                  {selectedCustomer && (
                    <div
                      role="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); setShowCustomerSearch(false); }}
                      className="text-slate-300 hover:text-red-400 cursor-pointer"
                    >
                      <X size={14} />
                    </div>
                  )}
                </button>
                {showCustomerSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[16px] shadow-xl border border-slate-100 z-20 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search by name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-3 py-2 text-[13px] focus:outline-none bg-[#f0f4fc] rounded-[10px]"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-[13px] text-slate-300 text-center py-4">No customers found</p>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button key={c.id}
                            onClick={() => { setSelectedCustomer({ id: c.id, name: c.name, phone: c.phone ?? "" }); setShowCustomerSearch(false); setCustomerSearch(""); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f7ff] transition-colors text-left border-b border-slate-50 last:border-b-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#702bf0] to-[#511ae8] flex items-center justify-center shrink-0">
                              <span className="text-white text-[11px] font-bold">{c.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-slate-700">{c.name}</p>
                              {c.phone && <p className="text-[11px] text-slate-400">{c.phone}</p>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <ShoppingCart size={48} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs mt-1">Add products to get started</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 mb-3 bg-[#f8f9fc] rounded-[14px] p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-700 truncate">{item.name}</p>
                      <p className="text-[12px] text-slate-400">{fc(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                        <Minus size={12} />
                      </button>
                      <span className="text-[13px] font-bold text-slate-700 w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-[#702bf0]">{fc(item.subtotal)}</p>
                      <button onClick={() => removeFromCart(item.product_id)} className="text-slate-300 hover:text-red-400 mt-0.5 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Tag size={16} className="text-slate-400" />
                <div className="flex-1">
                  <label className="text-[12px] text-slate-400 font-medium">Discount % (max {appSettings.maxCashierDiscount * 100}%)</label>
                  <input type="number" min={0} max={appSettings.maxCashierDiscount * 100} value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(Number(e.target.value), appSettings.maxCashierDiscount * 100))}
                    className="w-full border border-slate-200 rounded-[10px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#702bf0] mt-1" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[13px] text-slate-500"><span>Subtotal</span><span>{appSettings.currency} {Number(subtotal).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-[13px] text-emerald-600"><span>Discount ({discountPercent}%)</span><span>- {fc(discountAmount)}</span></div>}
                <div className="flex justify-between text-[13px] text-slate-500"><span>GST ({Math.round(appSettings.taxRate * 100)}%)</span><span>{appSettings.currency} {Number(tax).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between font-bold text-[#1e1b4b] text-[15px] pt-2 border-t border-slate-100"><span>Total</span><span>{appSettings.currency} {Number(total).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCartItems([]); setDiscountPercent(0); }} disabled={cartItems.length === 0}
                  className="flex-none px-4 py-3 rounded-[14px] bg-slate-100 text-slate-500 font-semibold text-sm hover:bg-slate-200 disabled:opacity-40 cursor-pointer">
                  Clear
                </button>
                <button onClick={() => setShowPayment(true)}
                  disabled={cartItems.length === 0 || createOrder.isPending}
                  className="flex-1 bg-gradient-to-r from-[#702bf0] to-[#511ae8] text-white py-3 rounded-[14px] font-bold text-[15px] disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer">
                  {createOrder.isPending ? "Processing..." : `Charge ${cartItems.length > 0 ? fc(total) : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && <PaymentModal total={total} onClose={() => setShowPayment(false)} onConfirm={handleConfirmPayment} appSettings={appSettings} isPending={createOrder.isPending} />}
      {showReceipt && <ReceiptModal items={cartItems} subtotal={subtotal} tax={tax} discount={discountAmount} total={total} method={paymentMethod} orderNumber={orderNumber} onClose={handleCloseReceipt} appSettings={appSettings} />}
    </div>
  );
}
