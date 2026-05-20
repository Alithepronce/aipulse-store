import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  apiResponse,
  apiError,
  validateRequired,
  withAdmin
} from "@/lib/api-helpers"

const defaultPaymentMethods = [
  {
    id: "zaincash",
    name: "زين كاش",
    icon: "💳",
    number: "07801234567",
    instructions: "حوّل المبلغ إلى الرقم أعلاه عبر تطبيق زين كاش، ثم ارفع صورة الإيصال للتحقق التلقائي السريع",
    is_active: true,
    is_custom: false
  },
  {
    id: "fastpay",
    name: "فاست باي",
    icon: "⚡",
    number: "07901234567",
    instructions: "استخدم تطبيق FastPay لتحويل المبلغ إلى الرقم أعلاه، ثم ارفع صورة الإيصال للتحقق التلقائي السريع",
    is_active: true,
    is_custom: false
  },
  {
    id: "fib",
    name: "FIB",
    icon: "🏦",
    number: "IBAN: IQ12 FIBR 0012 3456 7890",
    instructions: "حوّل عبر تطبيق FIB أو فرع المصرف الأقرب إليك، ثم ارفع صورة الإيصال للتحقق التلقائي السريع",
    is_active: true,
    is_custom: false
  },
  {
    id: "mastercard",
    name: "ماستركارد",
    icon: "💎",
    number: "يرجى التواصل للحصول على رابط الدفع",
    instructions: "سيتم إرسال رابط دفع آمن عبر البريد الإلكتروني خلال دقائق",
    is_active: true,
    is_custom: false
  }
]

// GET /api/admin/payment-methods - List all payment methods
export const GET = withAdmin(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.warn("Table payment_methods might be missing or DB error:", error.message)
      // Check if table missing (commonly PG error code 42P01 in postgrest)
      const isTableMissing = error.code === "42P01" || error.message.includes("does not exist")
      
      return apiResponse({
        methods: defaultPaymentMethods,
        table_missing: isTableMissing,
        error_message: error.message
      })
    }

    return apiResponse({
      methods: data || [],
      table_missing: false
    })
  } catch (err: any) {
    console.error("Unhandled error in GET payment-methods:", err)
    return apiResponse({
      methods: defaultPaymentMethods,
      table_missing: true,
      error_message: err?.message || "Unknown error"
    })
  }
})

// POST /api/admin/payment-methods - Create a new custom payment method
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const validationError = validateRequired(body, ["name", "number"])
    if (validationError) return apiError(validationError)

    const { name, icon, number, instructions, is_active } = body
    // Generate a unique ID for custom method
    const id = "custom_" + Math.random().toString(36).substr(2, 9)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({
        id,
        name,
        icon: icon || "💳",
        number,
        instructions: instructions || "",
        is_active: is_active !== false,
        is_custom: true
      })
      .select()
      .single()

    if (error) {
      return apiError("حدث خطأ أثناء إضافة وسيلة الدفع", 500, error.message)
    }

    return apiResponse(data, 201)
  } catch (err: any) {
    return apiError("بيانات الطلب غير صالحة", 400, err?.message)
  }
})

// PUT /api/admin/payment-methods - Update an existing payment method
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const validationError = validateRequired(body, ["id", "name", "number"])
    if (validationError) return apiError(validationError)

    const { id, name, icon, number, instructions, is_active } = body

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("payment_methods")
      .update({
        name,
        icon: icon || "💳",
        number,
        instructions: instructions || "",
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return apiError("حدث خطأ أثناء تحديث وسيلة الدفع", 500, error.message)
    }

    return apiResponse(data)
  } catch (err: any) {
    return apiError("بيانات الطلب غير صالحة", 400, err?.message)
  }
})

// DELETE /api/admin/payment-methods - Delete a custom payment method
export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return apiError("معرف وسيلة الدفع مطلوب")

    const supabase = await createClient()
    
    // First check if it is a custom method. Standard ones shouldn't be deleted entirely, or can be.
    // Let's allow deletion if the record is custom, or just perform deletion.
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id)

    if (error) {
      return apiError("حدث خطأ أثناء حذف وسيلة الدفع", 500, error.message)
    }

    return apiResponse({ message: "تم حذف وسيلة الدفع بنجاح" })
  } catch (err: any) {
    return apiError("حدث خطأ في الطلب", 400, err?.message)
  }
})
