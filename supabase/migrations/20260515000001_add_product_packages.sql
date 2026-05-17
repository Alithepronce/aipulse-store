-- =========================================
-- 1. جدول باقات المنتجات (Product Packages)
-- =========================================
CREATE TABLE IF NOT EXISTS product_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'الأساسية', 'الاحترافية'
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  delivery_time_days INTEGER,
  features JSONB DEFAULT '[]', -- Array of feature strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product packages" ON product_packages FOR SELECT USING (true);
CREATE POLICY "Managers can manage product packages" ON product_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner'))
);

-- =========================================
-- 2. تحديث جدول تفاصيل الطلبات (Order Items)
-- =========================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES product_packages(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_packages_product_id ON product_packages(product_id);
