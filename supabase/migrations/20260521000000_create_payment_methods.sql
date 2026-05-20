-- إنشاء جدول بوابات الدفع (Payment Methods) لتمكين المسؤول من إدارتها
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💳',
  number TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إعداد سياسات الأمان (Row Level Security)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- السياسات:
-- 1. يسمح للجميع بمشاهدة وسائل الدفع النشطة (أو للمسؤول بمشاهدة الكل)
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
CREATE POLICY "Anyone can view active payment methods" ON payment_methods 
  FOR SELECT 
  USING (
    is_active = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('general_manager', 'owner', 'admin')
    )
  );

-- 2. يسمح فقط للمدراء والملاك بإجراء كافة التعديلات والإضافة والحذف
DROP POLICY IF EXISTS "Managers can manage payment methods" ON payment_methods;
CREATE POLICY "Managers can manage payment methods" ON payment_methods 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('general_manager', 'owner', 'admin')
    )
  );

-- إدراج بوابات الدفع الافتراضية للمنصة
INSERT INTO payment_methods (id, name, icon, number, instructions, is_active, is_custom)
VALUES 
  (
    'zaincash', 
    'زين كاش', 
    '💳', 
    '07801234567', 
    'حوّل المبلغ إلى الرقم أعلاه عبر تطبيق زين كاش، ثم ارفع صورة الإيصال للتحقق التلقائي السريع', 
    true, 
    false
  ),
  (
    'fastpay', 
    'فاست باي', 
    '⚡', 
    '07901234567', 
    'استخدم تطبيق FastPay لتحويل المبلغ إلى الرقم أعلاه، ثم ارفع صورة الإيصال للتحقق التلقائي السريع', 
    true, 
    false
  ),
  (
    'fib', 
    'FIB', 
    '🏦', 
    'IBAN: IQ12 FIBR 0012 3456 7890', 
    'حوّل عبر تطبيق FIB أو فرع المصرف الأقرب إليك، ثم ارفع صورة الإيصال للتحقق التلقائي السريع', 
    true, 
    false
  ),
  (
    'mastercard', 
    'ماستركارد', 
    '💎', 
    'يرجى التواصل للحصول على رابط الدفع', 
    'سيتم إرسال رابط دفع آمن عبر البريد الإلكتروني خلال دقائق', 
    true, 
    false
  )
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name, 
  icon = EXCLUDED.icon, 
  number = EXCLUDED.number, 
  instructions = EXCLUDED.instructions;
