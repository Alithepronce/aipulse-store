import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع | نبض الذكاء - Ai Pulse",
  description: "سياسة الاسترجاع الخاصة بالمنتجات الرقمية في منصة نبض الذكاء.",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-6 max-w-4xl py-20 min-h-screen">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">سياسة الاسترجاع</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <div className="p-4 bg-primary/10 border-r-4 border-primary rounded-l-lg mb-6 text-foreground font-medium">
              نظراً لطبيعة المنتجات المعروضة في منصتنا (كورسات، كتب إلكترونية، برمجيات) والتي تعتبر "منتجات رقمية قابلة للتحميل أو الوصول الفوري"، فإن القاعدة العامة هي عدم إمكانية استرجاع الأموال بعد إتمام عملية الشراء وتفعيل المنتج في حسابك.
            </div>
            <p>
              نهدف في "نبض الذكاء | Ai Pulse" إلى تقديم محتوى احترافي وموثوق. نرجو منك قراءة وصف المنتج ومميزاته بعناية قبل إتمام عملية الشراء لضمان أنه يلبي احتياجاتك.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. الحالات الاستثنائية (متى يمكن استرجاع الأموال؟)</h2>
            <p>نحن نتفهم أن بعض الظروف قد تكون خارجة عن إرادتك، لذلك ننظر في طلبات الاسترجاع حصرياً في الحالات التالية:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>خلل تقني جسيم:</strong> إذا كان هناك خلل تقني من جانبنا يمنعك بشكل كامل من الوصول إلى المنتج الرقمي الذي اشتريته ولم نتمكن من حله خلال 72 ساعة من إبلاغنا.</li>
              <li><strong>منتج غير مطابق تماماً:</strong> إذا كان محتوى المنتج مختلفاً جذرياً وبشكل واضح عن الوصف المقدم في صفحة المنتج بالموقع.</li>
              <li><strong>دفع مكرر بالخطأ:</strong> إذا حدث خطأ وتم سحب المبلغ أو التحويل أكثر من مرة لنفس المنتج في نفس الوقت.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. متى لا نقبل طلبات الاسترجاع؟</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>تغيير الرأي بعد شراء المنتج الرقمي وتفعيله.</li>
              <li>عدم القدرة على استخدام المنتج بسبب عدم توفر المتطلبات التقنية الأساسية لديك (مثل سرعة إنترنت، جهاز غير مدعوم، أو عدم امتلاك المعرفة الأساسية إذا كان المنتج يتطلب ذلك وتم التنويه عنه).</li>
              <li>قيام المستخدم بمخالفة شروط وأحكام الموقع (مثل مشاركة الحساب مع أشخاص آخرين).</li>
              <li>تجاوز مدة 7 أيام من تاريخ عملية الشراء.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. آلية طلب الاسترجاع</h2>
            <p>إذا كنت تعتقد أنك مؤهل لاسترجاع الأموال بناءً على الحالات الاستثنائية المذكورة أعلاه، يرجى اتباع الخطوات التالية:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>التواصل مع فريق الدعم الفني عبر القنوات الرسمية خلال مدة أقصاها 7 أيام من تاريخ الشراء.</li>
              <li>تزويدنا برقم الطلب، اسم المنتج، وتوضيح دقيق لسبب طلب الاسترجاع مع إرفاق أدلة (مثل صور أو فيديو للخلل التقني).</li>
              <li>سيقوم فريقنا بمراجعة الطلب والرد عليك خلال 2-4 أيام عمل.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. كيفية استرداد المبالغ</h2>
            <p>
              في حال الموافقة على طلب الاسترجاع، سيتم إعادة المبلغ بنفس طريقة الدفع الأصلية المستخدمة (مثل زين كاش). قد يستغرق وصول المبلغ إليك عدة أيام عمل وفقاً لسياسات مزود خدمة الدفع. 
              عند الموافقة على الاسترجاع، سيتم إلغاء وصولك الفوري للمنتج المسترجع.
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
