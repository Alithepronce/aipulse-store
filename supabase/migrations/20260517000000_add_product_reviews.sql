-- جدول مراجعات وتقييمات المنتجات
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- سياسات الأمان (Row Level Security)
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON product_reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON product_reviews;

CREATE POLICY "Anyone can view reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON product_reviews FOR INSERT WITH CHECK (true);

-- الدالة والمشغل لتحديث التقييم العام للمنتج
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET rating = (SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) FROM product_reviews WHERE product_id = NEW.product_id),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM product_reviews WHERE product_id = OLD.product_id), 0),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = OLD.product_id)
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON product_reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();
