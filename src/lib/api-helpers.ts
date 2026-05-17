import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// ─── Unified API Response ───────────────────────────────────────────
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  )
}

// ─── Admin Roles ────────────────────────────────────────────────────
const ADMIN_ROLES = ["admin", "general_manager", "owner"]
const OBSERVER_ROLES = [...ADMIN_ROLES, "observer"]

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role)
}

export function isObserverRole(role: string | null | undefined): boolean {
  return !!role && OBSERVER_ROLES.includes(role)
}

// ─── Auth Helpers ───────────────────────────────────────────────────
export interface AuthenticatedUser {
  id: string
  email: string
  role: string
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    return {
      id: user.id,
      email: user.email || "",
      role: profile?.role || "user",
    }
  } catch {
    return null
  }
}

// Higher-order: require authentication
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthenticatedUser()
    if (!user) {
      return apiError("غير مصرح. يرجى تسجيل الدخول", 401)
    }
    return handler(req, user)
  }
}

// Higher-order: require admin
export function withAdmin(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthenticatedUser()
    if (!user) {
      return apiError("غير مصرح. يرجى تسجيل الدخول", 401)
    }
    if (!isAdminRole(user.role)) {
      return apiError("ليس لديك صلاحية للوصول إلى هذا المورد", 403)
    }
    return handler(req, user)
  }
}

// ─── Rate Limiter (In-Memory) ───────────────────────────────────────
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = identifier

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  }
}

// Helper to get rate limit key from request
export function getRateLimitKey(req: NextRequest, userId?: string): string {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  return userId ? `user:${userId}` : `ip:${ip}`
}

// ─── Validation Helpers ─────────────────────────────────────────────
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `الحقل '${field}' مطلوب`
    }
  }
  return null
}

export function parseSearchParams(url: URL) {
  return {
    page: Math.max(1, parseInt(url.searchParams.get("page") || "1")),
    limit: Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20"))),
    status: url.searchParams.get("status"),
    search: url.searchParams.get("search"),
    sort: url.searchParams.get("sort") || "created_at",
    order: (url.searchParams.get("order") || "desc") as "asc" | "desc",
  }
}
