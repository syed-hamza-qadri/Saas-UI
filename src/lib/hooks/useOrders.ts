import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import toast from "react-hot-toast";
import { getFriendlyError } from "@/lib/utils/errors";

const supabase = createClient();

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    staleTime: 5 * 60 * 1000,
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
        order_number?: string;
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
      const { data, error } = await supabase.rpc("create_order_atomic", {
        p_order: JSON.stringify({
          ...order,
          order_number: undefined,
        }),
        p_items: JSON.stringify(items),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    },
    onError: (error: Error) => {
      toast.error(getFriendlyError(error));
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      if (status === "voided" || status === "refunded") {
        const { error } = await supabase.rpc("void_order_atomic", {
          p_order_id: id,
          p_status: status,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error(getFriendlyError(error));
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