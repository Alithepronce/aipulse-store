import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiResponse, apiError, getAuthenticatedUser, isAdminRole } from "@/lib/api-helpers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) return apiError("ليس لديك صلاحية", 403)

  const { id } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.category !== undefined) updateData.category = body.category
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image
    if (body.file_url !== undefined) updateData.file_url = body.file_url
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.rating !== undefined) updateData.rating = Number(body.rating)
    if (body.review_count !== undefined) updateData.review_count = Number(body.review_count)

    const supabase = await createClient()
    const { data, error } = await supabase.from("products").update(updateData).eq("id", id).select().single()
    if (error) return apiError("خطأ في التحديث", 500, error.message)
    return apiResponse(data)
  } catch {
    return apiError("بيانات غير صالحة", 400)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) return apiError("ليس لديك صلاحية", 403)

  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from("products").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return apiError("خطأ في الحذف", 500, error.message)
  return apiResponse({ deleted: true })
}
