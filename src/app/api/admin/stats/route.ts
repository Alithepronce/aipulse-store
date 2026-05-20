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

  // Generate dynamic chart data based on orders in the last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const monthlyOrdersResult = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .eq("status", "approved")
    .gte("created_at", sixMonthsAgo.toISOString())

  const monthlyData: Record<string, { sales: number; orders: number }> = {}
  const monthNames = [
    "كانون الثاني",
    "شباط",
    "آذار",
    "نيسان",
    "أيار",
    "حزيران",
    "تموز",
    "آب",
    "أيلول",
    "تشرين الأول",
    "تشرين الثاني",
    "كانون الأول"
  ]

  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const mName = monthNames[d.getMonth()]
    monthlyData[mName] = { sales: 0, orders: 0 }
  }

  // Populate data from orders
  if (monthlyOrdersResult.data) {
    monthlyOrdersResult.data.forEach((order) => {
      const orderDate = new Date(order.created_at)
      const mName = monthNames[orderDate.getMonth()]
      if (monthlyData[mName] !== undefined) {
        monthlyData[mName].sales += Number(order.total_amount || 0)
        monthlyData[mName].orders += 1
      }
    })
  }

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    sales: data.sales,
    orders: data.orders
  }))

  return apiResponse({
    totalOrders: ordersResult.count || 0,
    totalProducts: productsResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalRevenue,
    pendingOrders: pendingOrders.count || 0,
    recentOrders: recentResult.data || [],
    chartData,
  })
}
