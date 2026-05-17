import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  getAuthenticatedUser,
  isAdminRole,
  validateRequired,
  parseSearchParams,
} from "@/lib/api-helpers"

// GET /api/products - List products
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { page, limit, search, order } = parseSearchParams(new URL(req.url))
  const offset = (page - 1) * limit

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })

  // Check if user is admin - if not, only show active products
  const user = await getAuthenticatedUser()
  if (!user || !isAdminRole(user.role)) {
    query = query.eq("is_active", true)
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const category = new URL(req.url).searchParams.get("category")
  if (category) {
    query = query.eq("category", category)
  }

  query = query
    .order("created_at", { ascending: order === "asc" })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return apiError("حدث خطأ أثناء جلب المنتجات", 500, error.message)
  }

  return apiResponse({
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

// POST /api/products - Create product (admin only)
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return apiError("غير مصرح", 401)
  if (!isAdminRole(user.role)) {
    return apiError("ليس لديك صلاحية لإضافة منتجات", 403)
  }

  try {
    const body = await req.json()
    const validationError = validateRequired(body, ["title", "price"])
    if (validationError) return apiError(validationError)

    const { title, description, price, category, cover_image, file_url, is_active, rating, review_count } = body

    // Validate category
    const validCategories = ["كورسات أونلاين", "كتب إلكترونية", "برامج"]
    if (category && !validCategories.includes(category)) {
      return apiError("تصنيف المنتج غير صالح")
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .insert({
        title,
        description: description || null,
        price: Number(price),
        category: category || null,
        cover_image: cover_image || null,
        file_url: file_url || null,
        rating: rating !== undefined ? Number(rating) : 0,
        review_count: review_count !== undefined ? Number(review_count) : 0,
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) {
      return apiError("حدث خطأ أثناء إنشاء المنتج", 500, error.message)
    }

    return apiResponse(data, 201)
  } catch {
    return apiError("بيانات المنتج غير صالحة", 400)
  }
}
