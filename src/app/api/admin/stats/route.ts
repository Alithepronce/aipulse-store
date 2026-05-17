import { createClient } from "@/lib/supabase/server"
import { apiResponse, apiError, getAuthenticatedUser, isAdminRole } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) return apiError("ليس لديك صلاحية", 403)

  const supabase = await createClient()

  const [ordersResult, productsResult, usersResult, revenueResult, recentResult] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("orders").select("total_amount").eq("status", "approved"),
    supabase.from("orders")
      .select("id, status, total_amount, created_at, payment_method, profiles!orders_user_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueResult.data || []).reduce(
    (sum, o) => sum + Number(o.total_amount || 0), 0
  )

  const pendingOrders = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")

  return apiResponse({
    totalOrders: ordersResult.count || 0,
    totalProducts: productsResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalRevenue,
    pendingOrders: pendingOrders.count || 0,
    recentOrders: recentResult.data || [],
  })
}
