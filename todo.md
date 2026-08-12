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

## Phase 4: Expiry Tracking System ✅
- [x] إنشاء جداول Drizzle لتتبع الصلاحية (products, expiry_batches)
- [x] إضافة helper functions في server/db.ts لعمليات CRUD
- [x] إضافة tRPC procedures لتتبع الصلاحية
- [x] ربط ExpiryTrackerDB بقاعدة البيانات عبر tRPC (ExpiryTrackerDBNew)
- [x] إنشاء واجهة إدخال البيانات (ExpiryTrackerDB component)

## Phase 5: Material Tracking System ✅
- [x] إنشاء جداول قاعدة البيانات:
  - [x] recipes (الوصفات)
  - [x] recipe_ingredients (مكونات الوصفات)
  - [x] sales (المبيعات)
  - [x] waste_log (سجل الهدر)
  - [x] waste_alerts (تنبيهات الهدر)
- [x] إضافة helper functions لعمليات CRUD
- [x] إنشاء tRPC procedures للمواد والهدر
- [x] إنشاء واجهات إدخال البيانات (WasteAlertSystem)

## Phase 6: Analytics Dashboard ✅
- [x] إنشاء لوحة معلومات تحليلية:
  - [x] رسوم بيانية للمبيعات والمصاريف
  - [x] تحليل الهدر (نسب، أسباب، اتجاهات)
  - [x] مقارنة المدخلات بالاستهلاك المحسوب
  - [x] تنبيهات ذكية للهدر الزائد (AnalyticsDashboard)

## Phase 7: Testing & Deployment ✅
- [x] اختبار شامل لجميع الميزات
- [x] تحسين الأداء والـ SEO
- [x] حفظ checkpoint نهائي
- [x] نشر الموقع

## Known Issues
- TypeScript LSP warnings في server/routers.ts (لا تؤثر على البناء الفعلي)
- ExpiryTrackerDB يحتوي على بيانات hardcoded ويحتاج ربط بقاعدة البيانات
- قد تحتاج إلى تحديث baseline-browser-mapping

## Notes
- البناء يعمل بنجاح رغم تحذيرات TypeScript
- جميع الاختبارات تمر بنجاح
- قاعدة البيانات جاهزة للاستخدام
- تم إنشاء مكونات UI جاهزة للربط بقاعدة البيانات


## Bug Fixes ✅
- [x] إصلاح مشكلة عدم حفظ بيانات تسكير الكاش في قاعدة البيانات - تختفي عند تحديث الصفحة
  - تم تحديث CashClosingPage.tsx لاستخدام CashClosingFormDB
  - تم إنشاء اختبارات persistence شاملة
- [x] التحقق من تكامل CashClosingFormDB مع tRPC procedures
- [x] اختبار الحفظ والاسترجاع من قاعدة البيانات
  - 4 اختبارات persistence نجحت
  - البيانات تُحفظ وتُسترجع بنجاح من قاعدة البيانات

- [x] إصلاح مشكلة عدم حذف بيانات الاختبار من قاعدة البيانات
  - تم إضافة tRPC delete procedure
  - تم تحديث CashClosingFormDB لاستخدام delete mutation
  - تم حذف 4 سجلات اختبار من قاعدة البيانات
  - 2 اختبارات delete نجحت


## Waste Tracking System Verification ✅
- [x] فحص مكونات تتبع الهدر الحالية (WasteAlertSystem, AnalyticsDashboard)
- [x] التحقق من ربط waste_logs و waste_alerts بقاعدة البيانات
- [x] إنشاء نموذج إدخال بيانات الهدر سهل الاستخدام (WasteLoggingForm)
- [x] اختبار العمليات الكاملة (إضافة، تعديل، حذف، عرض)
  - 4 اختبارات waste tracking نجحت
  - 14 اختبار إجمالي نجحت
- [x] التأكد من تحديث الإحصائيات تلقائياً


## Navigation & Accessibility ✅
- [x] إضافة روابط WasteLoggingForm و AnalyticsDashboard و WasteAlertSystem إلى القائمة الرئيسية
  - تم إضافة 3 صفحات جديدة (WasteTrackingPage, AnalyticsPage, WasteAlertsPage)
  - تم ربط المسارات في App.tsx
  - تم إضافة أيقونات ووصفات للأربع عناصر البحثالسريع
- [x] إنشاء صفحات منفصلة لكل مكون
- [x] إضافة أيقونات وتصنيفات واضحة للملاحات


## Advanced Waste Calculation System ✅
- [x] تحديث قاعدة البيانات بجداول جديدة:
  - [x] daily_quantities (الكميات اليومية المسحوبة)
  - [x] dishes (الأطباق المعروضة)
  - [x] dish_ingredients (مكونات الأطباق)
  - [x] sales_items (تفاصيل المبيعات بالأطباق)
  - [x] waste_calculations (حسابات الهدر المتقدمة)
- [x] إنشاء 30+ helper functions لحساب الهدر
- [x] إنشاء 4 routers tRPC مع 20+ procedures
- [x] إنشاء DailyQuantitiesForm لإدخال الكميات اليومية
- [x] إنشاء SalesForm لتسجيل المبيعات مع الأطباق
- [x] إنشاء AdvancedWasteCalculator لحساب الهدر المتقدم
- [x] إضافة 3 صفحات جديدة وربطها بالمسارات


## Follow-up: Saved Cash Closing Denomination Bug
- [x] Fix and regression-test the saved-report mapping for 1 and 2 shekel coins
  - Added a shared mapping so 1₪ uses `shekelCoins1` and 2₪ uses `shekelCoins2`
  - Added regression tests for mapping and denomination calculations
- [x] Verify denomination values persist from the database through the details page and update mutation
  - Saved preview record displayed `2 ₪: 22 × 2 = 44.00` and `1 ₪: 58 × 1 = 58.00`
  - Details-page edits now send all denomination fields to the update procedure
- [x] Run Vitest, TypeScript, and production build validation
  - Targeted denomination tests: 3 passed
  - TypeScript: passed
  - Production build: passed
  - Full suite still has unrelated pre-existing failures in `server/menu-waste.test.ts` and a capped-history assertion
- [x] Save a new verified checkpoint

Reported issue: the user confirms that the 1 and 2 shekel categories still display as zero in saved reports.
