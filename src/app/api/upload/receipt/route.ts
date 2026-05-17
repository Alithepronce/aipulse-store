import { NextRequest } from "next/server"
import { apiResponse, apiError, withAuth, rateLimit, getRateLimitKey, type AuthenticatedUser } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export const POST = withAuth(async (req: NextRequest, user: AuthenticatedUser) => {
  // Rate limit: 3 uploads per minute
  const rl = rateLimit(getRateLimitKey(req, user.id) + ":upload", 3, 60_000)
  if (!rl.allowed) {
    return apiError("عدد كبير من المحاولات. يرجى الانتظار", 429)
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("لم يتم تحديد ملف")
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiError("حجم الملف يجب أن لا يتجاوز 5 ميغابايت")
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return apiError("نوع الملف غير مدعوم. يُقبل: JPG, PNG, WebP, GIF, PDF")
    }

    const supabase = await createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return apiError("فشل في رفع الملف. يرجى المحاولة مرة أخرى", 500)
    }

    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName)

    return apiResponse({ url: urlData.publicUrl }, 201)
  } catch (err) {
    console.error("Receipt upload error:", err)
    return apiError("خطأ في الخادم أثناء رفع الإيصال", 500)
  }
})
