import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiResponse } from "@/lib/api-helpers"

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

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (error) {
      console.warn("Falling back to default payment methods due to DB error:", error.message)
      return apiResponse(defaultPaymentMethods)
    }

    // If the database has no methods (e.g. empty table), use defaults
    if (!data || data.length === 0) {
      return apiResponse(defaultPaymentMethods)
    }

    return apiResponse(data)
  } catch (err) {
    console.error("Unhandled error in payment-methods API:", err)
    return apiResponse(defaultPaymentMethods)
  }
}
