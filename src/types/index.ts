export interface Category {
	id: string;
	name: string;
	color: string;
}

export interface Product {
	id: string;
	name: string;
	sku: string;
	barcode?: string;
	price: number;
	cost: number;
	category_id: string;
	stock_qty: number;
	image_url?: string;
	is_active: boolean;
	created_at: string;
}

export interface CartItem {
	product_id: string;
	name: string;
	price: number;
	quantity: number;
	discount: number;
	subtotal: number;
}

export interface Customer {
	id: string;
	name: string;
	phone: string;
	email?: string;
	loyalty_points: number;
	total_spent: number;
	created_at: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "manager" | "cashier";
	pin_hash: string;
	active: boolean;
	created_at: string;
}

export interface Order {
	id: string;
	order_number: string;
	cashier_id: string;
	customer_id?: string;
	subtotal: number;
	tax: number;
	discount: number;
	total: number;
	status: "pending" | "completed" | "refunded" | "voided";
	payment_method: "cash" | "card" | "bank_transfer" | "split";
	notes?: string;
	created_at: string;
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	unit_price: number;
	discount: number;
	subtotal: number;
}

export interface Payment {
	id: string;
	order_id: string;
	method: "cash" | "card" | "bank_transfer";
	amount: number;
	reference?: string;
	status: "success" | "failed" | "refunded";
	created_at: string;
}

export interface AuditLog {
	id: string;
	user_id: string;
	action: string;
	table_name: string;
	record_id: string;
	old_value?: Record<string, unknown>;
	new_value?: Record<string, unknown>;
	created_at: string;
}
