import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const useDashboardStats = (lowStockThreshold = 10) => {
  return useQuery({
    queryKey: ["dashboard_stats", lowStockThreshold],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: todayOrders, error: ordersError } = await supabase
        .from("orders")
        .select("total, status")
        .gte("created_at", todayISO)
        .eq("status", "completed");
      if (ordersError) throw ordersError;

      const { data: lowStock, error: stockError } = await supabase
        .from("products")
        .select("id, stock_qty, low_stock_threshold")
        .lte("stock_qty", lowStockThreshold)
        .eq("is_active", true);
      if (stockError) throw stockError;

      const { data: recentOrders, error: recentError } = await supabase
        .from("orders")
        .select("id, order_number, total, payment_method, status, created_at")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(4);
      if (recentError) throw recentError;

      const { data: weeklyData, error: weeklyError } = await supabase
        .from("orders")
        .select("total, created_at")
        .eq("status", "completed")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      if (weeklyError) throw weeklyError;

      const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
      const todayOrderCount = (todayOrders ?? []).length;
      const lowStockCount = (lowStock ?? []).length;

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyMap: Record<string, number> = {};
      (weeklyData ?? []).forEach((o) => {
        const day = days[new Date(o.created_at).getDay()];
        weeklyMap[day] = (weeklyMap[day] ?? 0) + Number(o.total);
      });
      const weeklyChartData = days.map((day) => ({ name: day, sales: weeklyMap[day] ?? 0 }));

      return {
        todayRevenue,
        todayOrderCount,
        lowStockCount,
        recentOrders: recentOrders ?? [],
        weeklyChartData,
      };
    },
    refetchInterval: 30000,
  });
};
