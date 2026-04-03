# Project TODO

## Phase 1: Core Setup ✅
- [x] بناء موقع ويب عربي كامل بتصميم Warm Minimalism مع دعم RTL شامل
- [x] إنشاء 15 قسماً تشغيلياً منظماً
- [x] نظام بحث حي متقدم
- [x] Sidebar ثابت مع drawer على الموبايل
- [x] نظام Accordion للأقسام الفرعية
- [x] نظام طباعة محسّن
- [x] تصحيح شامل للأخطاء الإملائية

## Phase 2: Database Integration ✅
- [x] ترقية المشروع إلى full-stack مع قاعدة بيانات MySQL
- [x] إنشاء جداول cashClosings و dailyStatistics
- [x] إنشاء helper functions للتعامل مع قاعدة البيانات
- [x] إنشاء tRPC procedures لتسكير الكاش والإحصائيات
- [x] كتابة اختبارات vitest للدوال الأساسية

## Phase 3: Cash Closing System ✅
- [x] نموذج تسكير الكاش المتقدم مع حسابات تلقائية
- [x] عد الكاش التفصيلي (جميع فئات الشيكل + دولار + دينار)
- [x] تقارير الفيزا (ويلز، فود أون تايم، الماكنة)
- [x] تصدير Excel
- [x] إنشاء مكون CashClosingFormDB مع تكامل قاعدة البيانات

## Phase 4: Expiry Tracking System ⏳
- [ ] إنشاء جداول Drizzle لتتبع الصلاحية (products, expiry_batches)
- [ ] إضافة helper functions في server/db.ts لعمليات CRUD
- [ ] إضافة tRPC procedures لتتبع الصلاحية
- [ ] ربط ExpiryTrackerDB بقاعدة البيانات عبر tRPC
- [x] إنشاء واجهة إدخال البيانات (ExpiryTrackerDB component)

## Phase 5: Material Tracking System ⏳
- [ ] إنشاء جداول قاعدة البيانات:
  - [ ] recipes (الوصفات)
  - [ ] recipe_ingredients (مكونات الوصفات)
  - [ ] sales (المبيعات)
  - [ ] waste_log (سجل الهدر)
- [ ] إضافة helper functions لعمليات CRUD
- [ ] إنشاء tRPC procedures للمواد والهدر
- [ ] إنشاء واجهات إدخال البيانات

## Phase 6: Analytics Dashboard ⏳
- [ ] إنشاء لوحة معلومات تحليلية:
  - [ ] رسوم بيانية للمبيعات والمصاريف
  - [ ] تحليل الهدر (نسب، أسباب، اتجاهات)
  - [ ] مقارنة المدخلات بالاستهلاك المحسوب
  - [ ] تنبيهات ذكية للهدر الزائد

## Phase 7: Testing & Deployment ⏳
- [ ] اختبار شامل لجميع الميزات
- [ ] تحسين الأداء والـ SEO
- [ ] حفظ checkpoint نهائي
- [ ] نشر الموقع

## Known Issues
- TypeScript LSP warnings في server/routers.ts (لا تؤثر على البناء الفعلي)
- ExpiryTrackerDB يحتوي على بيانات hardcoded ويحتاج ربط بقاعدة البيانات
- قد تحتاج إلى تحديث baseline-browser-mapping

## Notes
- البناء يعمل بنجاح رغم تحذيرات TypeScript
- جميع الاختبارات تمر بنجاح
- قاعدة البيانات جاهزة للاستخدام
- تم إنشاء مكونات UI جاهزة للربط بقاعدة البيانات
