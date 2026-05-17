-- ترقية الحسابات الثلاثة إلى أدمن
-- شغّل هذا في SQL Editor بعد إنشاء الحسابات من Dashboard

UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('manager@fikr.com', 'dr.feryal@fikr.com', 'karrar@fikr.com')
);

-- التحقق من النتيجة
SELECT p.id, u.email, p.role, p.full_name
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('manager@fikr.com', 'dr.feryal@fikr.com', 'karrar@fikr.com');
