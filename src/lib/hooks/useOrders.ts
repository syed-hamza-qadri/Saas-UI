import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import toast from "react-hot-toast";

const supabase = createClient();

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    staleTime: 15 * 1000,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: {
        order_number: string;
        customer_id?: string;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        status: "completed";
        payment_method: "cash" | "card" | "bank_transfer" | "split";
        notes?: string;
      };
      items: {
        product_id: string;
        product_name: string;
        quantity: number;
        unit_price: number;
        discount: number;
        subtotal: number;
      }[];
    }) => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      // Reduce stock concurrently — uses the existing reduce_stock function
      await Promise.all(
        items.map((i) =>
          supabase.rpc("reduce_stock", {
            p_product_id: i.product_id,
            p_quantity: i.quantity,
          })
        )
      );

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      if (status === "voided" || status === "refunded") {
        await supabase.rpc("restore_stock", { p_order_id: id });
      }
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useOrderItems = (orderId: string | null) => {
  return useQuery({
    queryKey: ["order_items", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orderId,
  });
};