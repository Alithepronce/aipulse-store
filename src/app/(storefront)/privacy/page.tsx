import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | نبض الذكاء - Ai Pulse",
  description: "سياسة الخصوصية وكيفية تعاملنا مع بياناتك في منصة نبض الذكاء.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 max-w-4xl py-20 min-h-screen">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">سياسة الخصوصية</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. مقدمة</h2>
            <p>
              في "نبض الذكاء | Ai Pulse"، نأخذ خصوصيتك على محمل الجد. تشرح سياسة الخصوصية هذه كيف نقوم بجمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا والخدمات المرتبطة به.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. البيانات التي نجمعها</h2>
            <p>نحن نجمع أنواعاً معينة من المعلومات لتوفير وتحسين خدماتنا، وتشمل:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>البيانات الشخصية:</strong> مثل الاسم، البريد الإلكتروني، ورقم الهاتف (عند التسجيل أو الشراء).</li>
              <li><strong>بيانات الدفع:</strong> في حالة الدفع اليدوي، قد نجمع صور وصولات التحويل بغرض تأكيد العمليات.</li>
              <li><strong>بيانات الاستخدام:</strong> مثل الصفحات التي تزورها، نوع المتصفح، وعنوان الـ IP لتحسين تجربة المستخدم.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. كيف نستخدم البيانات</h2>
            <p>نحن نستخدم معلوماتك للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>إنشاء وإدارة حسابك وتوفير إمكانية الوصول إلى الكورسات والمنتجات المشتراة.</li>
              <li>معالجة المعاملات المالية وتأكيد الطلبات.</li>
              <li>التواصل معك لتقديم الدعم الفني أو إرسال إشعارات هامة تتعلق بحسابك.</li>
              <li>تحسين أداء الموقع وتجربة المستخدم بشكل عام.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. مشاركة البيانات</h2>
            <p>
              نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي جهة خارجية. قد نشارك بياناتك فقط في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل الموقع (مثل خدمات الاستضافة وقواعد البيانات الآمنة).</li>
              <li>استجابةً للطلبات القانونية أو للامتثال للقانون.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. أمان البيانات</h2>
            <p>
              نتخذ إجراءات أمنية تقنية وتنظيمية صارمة (مثل التشفير وبروتوكولات النقل الآمن) لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإتلاف. ورغم ذلك، لا يوجد نظام آمن بنسبة 100%، لذا لا يمكننا ضمان الأمان المطلق.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">6. حقوقك</h2>
            <p>
              يحق لك الوصول إلى معلوماتك الشخصية وتعديلها أو طلب حذفها من خلال إعدادات حسابك أو بالتواصل معنا. سنبذل جهدنا لتلبية طلبك وفقاً لما تقتضيه القوانين.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">7. التعديلات على السياسة</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات هنا مع تحديث تاريخ المراجعة.
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
