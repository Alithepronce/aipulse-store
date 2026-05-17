-- =========================================
-- 1. جدول التقييمات (Reviews)
-- =========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- يمنع التقييم المتكرر لنفس المنتج من نفس المستخدم
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unapproved reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id AND is_approved = false);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner'))
);
CREATE POLICY "Observer can view all reviews" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'observer')
);

-- =========================================
-- 2. جدول المفضلة (Wishlists)
-- =========================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlists" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlists" ON wishlists FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wishlists" ON wishlists FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner'))
);

-- =========================================
-- 3. جدول مراسلات الطلبات (Order Messages)
-- =========================================
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  file_url TEXT,
  is_delivery BOOLEAN DEFAULT false, -- يحدد ما إذا كانت هذه الرسالة هي التسليم النهائي للملفات
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for own orders" ON order_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_messages.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert messages for own orders" ON order_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_messages.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order messages" ON order_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner'))
);
CREATE POLICY "Observer can view all order messages" ON order_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'observer')
);

-- =========================================
-- 4. Storage Bucket: مرفقات الطلبات والتسليمات
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_attachments', 'order_attachments', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload attachments for own orders" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments for own orders" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all order attachments" ON storage.objects;

-- Note: folder structure expected: order_id/filename
CREATE POLICY "Users can upload attachments for own orders" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'order_attachments' AND
    EXISTS (SELECT 1 FROM orders WHERE orders.id::text = (storage.foldername(name))[1] AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can view attachments for own orders" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'order_attachments' AND
    EXISTS (SELECT 1 FROM orders WHERE orders.id::text = (storage.foldername(name))[1] AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order attachments" ON storage.objects
  FOR ALL USING (
    bucket_id = 'order_attachments' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner', 'admin'))
  );
