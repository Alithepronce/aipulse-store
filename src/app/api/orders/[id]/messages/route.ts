import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  getAuthenticatedUser,
  isAdminRole,
  rateLimit,
  getRateLimitKey,
} from "@/lib/api-helpers"

// GET /api/orders/[id]/messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)

  const { id } = await params
  const supabase = await createClient()

  // Verify user has access to this order
  if (!isAdminRole(user.role)) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!order) return apiError("غير مصرح بالوصول لهذا الطلب", 403)
  }

  const { data, error } = await supabase
    .from("order_messages")
    .select("*, profiles(full_name, role)")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  if (error) {
    return apiError("حدث خطأ أثناء جلب الرسائل", 500, error.message)
  }

  return apiResponse(data || [])
}

// POST /api/orders/[id]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)

  // Rate limit: 10 messages per minute
  const rl = rateLimit(getRateLimitKey(req, user.id) + ":msg", 10, 60_000)
  if (!rl.allowed) {
    return apiError(
      `تم تجاوز الحد الأقصى للرسائل. حاول مجدداً بعد ${Math.ceil(rl.resetIn / 1000)} ثانية`,
      429
    )
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { message, file_url, is_delivery } = body

    if (!message?.trim() && !file_url) {
      return apiError("يجب إدخال رسالة أو إرفاق ملف")
    }

    const supabase = await createClient()

    // Verify user has access to this order
    if (!isAdminRole(user.role)) {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (!order) return apiError("غير مصرح بالوصول لهذا الطلب", 403)
    }

    const { data, error } = await supabase
      .from("order_messages")
      .insert({
        order_id: id,
        user_id: user.id,
        message: message?.trim() || null,
        file_url: file_url || null,
        is_delivery: isAdminRole(user.role) ? (is_delivery || false) : false,
      })
      .select("*, profiles(full_name, role)")
      .single()

    if (error) {
      return apiError("حدث خطأ أثناء إرسال الرسالة", 500, error.message)
    }

    return apiResponse(data, 201)
  } catch {
    return apiError("بيانات غير صالحة", 400)
  }
}
