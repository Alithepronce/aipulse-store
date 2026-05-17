import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشروط والأحكام | نبض الذكاء - Ai Pulse",
  description: "الشروط والأحكام الخاصة بمنصة نبض الذكاء.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 max-w-4xl py-20 min-h-screen">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">الشروط والأحكام</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. مقدمة</h2>
            <p>
              مرحباً بكم في منصة "نبض الذكاء | Ai Pulse". تحكم هذه الشروط والأحكام استخدامك لموقعنا الإلكتروني والخدمات المقدمة من خلاله، والتي تشمل شراء الكورسات، الكتب الإلكترونية، والبرمجيات (المنتجات الرقمية).
              باستخدامك لموقعنا، فإنك توافق بشكل كامل على هذه الشروط. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. الحساب والتسجيل</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>يجب أن تكون المعلومات المقدمة أثناء التسجيل دقيقة وحديثة وكاملة.</li>
              <li>أنت مسؤول بالكامل عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك.</li>
              <li>يُمنع مشاركة حسابك مع أشخاص آخرين للوصول إلى المنتجات الرقمية المدفوعة. أي انتهاك لذلك قد يؤدي إلى إغلاق حسابك دون استرجاع أية أموال.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. الملكية الفكرية</h2>
            <p>
              جميع المحتويات المتوفرة على منصة "نبض الذكاء"، بما في ذلك (ولكن ليس على سبيل الحصر) النصوص، الرسومات، الشعارات، الفيديوهات، الكورسات، الكتب، والبرمجيات، هي ملك حصري للمنصة ومحمية بموجب قوانين حقوق الطبع والنشر الدولية.
            </p>
            <p className="mt-2 text-destructive font-medium">
              يُمنع منعاً باتاً إعادة بيع، توزيع، أو نشر أي من المنتجات الرقمية المتاحة على المنصة دون إذن كتابي مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. الاستخدام المقبول</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>تتعهد باستخدام الموقع لأغراض قانونية ومشروعة فقط.</li>
              <li>يُمنع محاولة التدخل في تشغيل الموقع أو محاولة الوصول غير المصرح به للأنظمة الخاصة بنا.</li>
              <li>يُمنع استخدام المنصة لنشر أي محتوى مسيء، ضار، أو ينتهك حقوق الآخرين.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. المدفوعات والأسعار</h2>
            <p>
              نقدم وسائل دفع آمنة ومعتمدة في العراق مثل زين كاش وغيرها. الأسعار المعروضة قابلة للتغيير في أي وقت، ولكن التغييرات لن تؤثر على الطلبات التي تم إتمامها بالفعل.
              في حالة الدفع اليدوي، يتطلب الأمر رفع صورة وصل التحويل (الرصيد) ليتم التحقق منه من قبل فريقنا قبل تفعيل المنتج في حسابك.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">6. إخلاء المسؤولية</h2>
            <p>
              يتم تقديم الخدمات والمنتجات الرقمية "كما هي". لا نقدم ضمانات صريحة أو ضمنية بأن المنتجات ستلبي متطلباتك الدقيقة أو أنها ستكون خالية من الأخطاء بشكل مطلق. 
              نحن غير مسؤولين عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدامك أو عدم قدرتك على استخدام منتجاتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">7. التعديلات</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر الشروط المحدثة على هذه الصفحة، ويعتبر استمرارك في استخدام الموقع بعد النشر موافقة منك على الشروط المعدلة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">8. تواصل معنا</h2>
            <p>
              إذا كان لديك أي استفسار بخصوص هذه الشروط، يمكنك التواصل معنا عبر وسائل التواصل المتاحة في المنصة أو من خلال البريد الإلكتروني الخاص بالدعم.
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground text-center">
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>
    </div>
  );
}
