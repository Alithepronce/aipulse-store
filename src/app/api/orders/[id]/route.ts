import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  getAuthenticatedUser,
  isAdminRole,
} from "@/lib/api-helpers"

// GET /api/orders/[id] - Get single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)

  const { id } = await params
  const supabase = await createClient()

  let query = supabase
    .from("orders")
    .select(
      `*, profiles!orders_user_id_fkey(full_name, phone), order_items(id, price, product:products(id, title, cover_image, file_url))`
    )
    .eq("id", id)

  // Non-admin can only see their own orders
  if (!isAdminRole(user.role)) {
    query = query.eq("user_id", user.id)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return apiError("الطلب غير موجود", 404)
  }

  return apiResponse(data)
}

// PATCH /api/orders/[id] - Update order (admin only: approve/reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) {
    return apiError("ليس لديك صلاحية لتحديث الطلبات", 403)
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { status, admin_notes } = body

    // Validate status
    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return apiError("حالة الطلب غير صالحة")
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return apiError("حدث خطأ أثناء تحديث الطلب", 500, error.message)
    }

    // If order approved, send an automatic system message
    if (status === "approved") {
      await supabase.from("order_messages").insert({
        order_id: id,
        user_id: user.id,
        message: "✅ تم الموافقة على طلبك! سيتم إرسال المنتج قريباً.",
        is_delivery: false,
      })
    } else if (status === "rejected") {
      await supabase.from("order_messages").insert({
        order_id: id,
        user_id: user.id,
        message: `❌ للأسف تم رفض الطلب.${admin_notes ? ` السبب: ${admin_notes}` : ""}`,
        is_delivery: false,
      })
    }

    return apiResponse(data)
  } catch {
    return apiError("بيانات غير صالحة", 400)
  }
}
