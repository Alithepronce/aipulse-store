import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  getAuthenticatedUser,
  isAdminRole,
  rateLimit,
  getRateLimitKey,
  validateRequired,
  parseSearchParams,
} from "@/lib/api-helpers"

// GET /api/orders - List orders
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)

  const supabase = await createClient()
  const { page, limit, status, search, order } = parseSearchParams(new URL(req.url))
  const offset = (page - 1) * limit

  let query = supabase
    .from("orders")
    .select(
      `*, profiles!orders_user_id_fkey(full_name, phone, email:id), order_items(id, price, product:products(title, cover_image))`,
      { count: "exact" }
    )

  // Non-admin users can only see their own orders
  if (!isAdminRole(user.role)) {
    query = query.eq("user_id", user.id)
  }

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("status", status)
  }

  if (search) {
    // Search by order ID prefix
    query = query.ilike("id", `${search}%`)
  }

  query = query
    .order("created_at", { ascending: order === "asc" })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return apiError("حدث خطأ أثناء جلب الطلبات", 500, error.message)
  }

  return apiResponse({
    orders: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

// POST /api/orders - Create new order
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح. يرجى تسجيل الدخول", 401)

  // Rate limit: 5 orders per minute
  const rl = rateLimit(getRateLimitKey(req, user.id), 5, 60_000)
  if (!rl.allowed) {
    return apiError(
      `تم تجاوز الحد الأقصى للطلبات. حاول مجدداً بعد ${Math.ceil(rl.resetIn / 1000)} ثانية`,
      429
    )
  }

  try {
    const body = await req.json()
    const validationError = validateRequired(body, [
      "payment_method",
      "total_amount",
      "items",
    ])
    if (validationError) return apiError(validationError)

    const { payment_method, total_amount, items, payment_receipt_url } = body

    // Validate payment method
    const validMethods = ["zaincash", "fastpay", "fib", "mastercard"]
    if (!validMethods.includes(payment_method)) {
      return apiError("طريقة الدفع غير صالحة")
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return apiError("يجب اختيار منتج واحد على الأقل")
    }

    const supabase = await createClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        payment_method,
        payment_receipt_url: payment_receipt_url || null,
        total_amount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      return apiError("حدث خطأ أثناء إنشاء الطلب", 500, orderError.message)
    }

    // Create order items
    const orderItems = items.map((item: { product_id: string; price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      // Rollback: delete the order if items fail
      await supabase.from("orders").delete().eq("id", order.id)
      return apiError("حدث خطأ أثناء إضافة المنتجات للطلب", 500, itemsError.message)
    }

    return apiResponse({ order }, 201)
  } catch {
    return apiError("بيانات الطلب غير صالحة", 400)
  }
}
