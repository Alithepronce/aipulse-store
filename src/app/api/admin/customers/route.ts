import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  getAuthenticatedUser,
  isAdminRole,
  parseSearchParams,
} from "@/lib/api-helpers"

// GET /api/admin/customers - List all customers
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) return apiError("ليس لديك صلاحية", 403)

  const supabase = await createClient()
  const { page, limit, search } = parseSearchParams(new URL(req.url))
  const offset = (page - 1) * limit

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at", { count: "exact" })
    .eq("role", "user")

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return apiError("حدث خطأ أثناء جلب العملاء", 500, error.message)
  }

  // Get order counts for each customer
  const customerIds = (data || []).map((c) => c.id)
  let orderCounts: Record<string, number> = {}

  if (customerIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("user_id")
      .in("user_id", customerIds)

    if (orders) {
      orderCounts = orders.reduce((acc: Record<string, number>, o) => {
        acc[o.user_id] = (acc[o.user_id] || 0) + 1
        return acc
      }, {})
    }
  }

  const customers = (data || []).map((c) => ({
    ...c,
    orders_count: orderCounts[c.id] || 0,
  }))

  return apiResponse({
    customers,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
