import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import * as XLSX from "xlsx";

interface CashClosingRecord {
  id: string;
  employeeName: string;
  date: string;
  cashIn: number;
  cash: number;
  visa: number;
  expenses: number;
  drawerCount: number;
  visaReports: {
    visaWells: number;
    visaFoodOnTime: number;
    visaMachine: number;
  };
  cashDenominations: {
    [key: number]: number;
  };
  dollarAmount: number;
  dinarAmount: number;
  notes: string;
}

const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];

export default function CashClosingDetailsPage() {
  const [, setLocation] = useLocation();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [record, setRecord] = useState<CashClosingRecord | null>(null);

  // Get record ID from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setRecordId(id);
  }, []);

  // Fetch the specific record
  const { data: records, isLoading } = trpc.cashClosing.getHistory.useQuery(
    { limit: 100 },
    { enabled: !!recordId }
  );

  useEffect(() => {
    if (records && recordId) {
      const found = records.find((r: any) => r.id.toString() === recordId) as any;
      if (found) {
        setRecord({
          id: found.id.toString(),
          employeeName: found.employeeName,
          date: found.date,
          cashIn: parseFloat(String(found.cashIn || 0)),
          cash: parseFloat(String(found.cash || 0)),
          visa: parseFloat(String(found.visa || 0)),
          expenses: parseFloat(String(found.expenses || 0)),
          drawerCount: parseFloat(String(found.drawerCount || 0)),
          visaReports: {
            visaWells: parseFloat(String(found.visaWells || 0)),
            visaFoodOnTime: parseFloat(String(found.visaFoodOnTime || 0)),
            visaMachine: parseFloat(String(found.visaMachine || 0)),
          },
          cashDenominations: {
            200: parseFloat(String(found.shekelNotes200 || 0)),
            100: parseFloat(String(found.shekelNotes100 || 0)),
            50: parseFloat(String(found.shekelNotes50 || 0)),
            20: parseFloat(String(found.shekelNotes20 || 0)),
            10: parseFloat(String(found.shekelNotes10 || 0)),
            5: parseFloat(String(found.shekelNotes5 || 0)),
            2: parseFloat(String(found.shekelCoins2 || 0)),
            1: parseFloat(String(found.shekelCoins1 || 0)),
            0.5: parseFloat(String(found.shekelCoins05 || 0)),
          },
          dollarAmount: parseFloat(String(found.dollarAmount || 0)),
          dinarAmount: parseFloat(String(found.dinarAmount || 0)),
          notes: found.notes || "",
        });
      }
    }
  }, [records, recordId]);

  const calculateCashFromDenominations = (denominations: any) => {
    return Object.entries(denominations).reduce((sum, [denom, count]: any) => {
      return sum + parseFloat(denom) * count;
    }, 0);
  };

  if (!recordId) {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setLocation("/cash-closing")}
            className="mb-6"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <Card className="p-8 text-center">
            <p className="text-red-600">لم يتم العثور على السجل المطلوب</p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setLocation("/cash-closing")}
            className="mb-6"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <Card className="p-8 text-center">
            <p className="text-red-600">لم يتم العثور على السجل</p>
          </Card>
        </div>
      </div>
    );
  }

  // Calculations
  const total1 = record.cashIn + record.cash + record.visa;
  const systemReport = total1 - record.expenses;
  const total2 =
    record.visaReports.visaWells +
    record.visaReports.visaFoodOnTime +
    record.visaReports.visaMachine;
  const cashFromDenominations = calculateCashFromDenominations(record.cashDenominations);
  const drawerTotal =
    record.drawerCount + cashFromDenominations + record.dollarAmount + record.dinarAmount;
  const cashReport = drawerTotal + total2;
  const difference = cashReport - systemReport;

  const exportToExcel = () => {
    const data = [
      ["تقرير تسكير الكاش"],
      [],
      ["اسم الموظف", record.employeeName],
      ["اليوم والتاريخ", new Date(record.date).toLocaleDateString("ar-SA")],
      [],
      ["القسم الأول: تقرير السيستم"],
      ["Cash In", record.cashIn],
      ["Cash", record.cash],
      ["Visa", record.visa],
      ["مجموع 1 (Cash In + Cash + Visa)", total1],
      ["المصاريف", record.expenses],
      ["تقرير السيستم", systemReport],
      [],
      ["القسم الثاني: عد الكاش والفيزا"],
      ["عد الكاش في الجرار"],
      ...SHEKEL_DENOMINATIONS.map((denom) => [
        `فئة ${denom} شيكل`,
        record.cashDenominations[denom] || 0,
      ]),
      ["إجمالي الكاش من الفئات", cashFromDenominations],
      ["الدولار", record.dollarAmount],
      ["الدينار", record.dinarAmount],
      ["إجمالي عد الكاش", drawerTotal],
      [],
      ["تقرير الفيزا"],
      ["Visa Wells", record.visaReports.visaWells],
      ["Visa Food On Time", record.visaReports.visaFoodOnTime],
      ["Visa Machine", record.visaReports.visaMachine],
      ["مجموع 2 (تقارير الفيزا)", total2],
      [],
      ["تقرير الكاش = (عد الكاش + مجموع 2)", cashReport],
      ["الفرق = (تقرير الكاش - تقرير السيستم)", difference],
      [],
      ["الحالة", difference === 0 ? "متطابق ✓" : `فرق: ${difference}`],
      [],
      ["ملاحظات", record.notes],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تسكير الكاش");

    ws["!cols"] = [{ wch: 30 }, { wch: 20 }];

    XLSX.writeFile(
      wb,
      `تسكير_كاش_${record.employeeName}_${record.date}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button
              onClick={() => setLocation("/cash-closing")}
              variant="outline"
              className="mb-4"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <h1 className="text-3xl font-bold text-green-900">تفاصيل تسكير الكاش</h1>
            <p className="text-gray-600 mt-1">
              {record.employeeName} - {new Date(record.date).toLocaleDateString("ar-SA")}
            </p>
          </div>
          <div className="space-x-2 flex gap-2">
            <Button
              onClick={exportToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 print:space-y-4">
          {/* Basic Info */}
          <Card className="p-6 bg-green-50 border-2 border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">المعلومات الأساسية</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">اسم الموظف</p>
                <p className="text-lg font-semibold text-foreground">{record.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">اليوم والتاريخ</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(record.date).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 1: System Report */}
          <Card className="p-6 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">القسم الأول: تقرير السيستم</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Cash In</p>
                  <p className="text-2xl font-bold text-blue-900">{record.cashIn.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Cash</p>
                  <p className="text-2xl font-bold text-blue-900">{record.cash.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Visa</p>
                  <p className="text-2xl font-bold text-blue-900">{record.visa.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t-2 border-blue-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">مجموع 1 (Cash In + Cash + Visa)</span>
                  <span className="text-lg font-bold text-blue-900">{total1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">المصاريف</span>
                  <span className="text-lg font-bold text-red-600">{record.expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                  <span className="text-gray-800 font-semibold">تقرير السيستم</span>
                  <span className="text-2xl font-bold text-blue-900">{systemReport.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Cash Count */}
          <Card className="p-6 border-2 border-amber-200">
            <h2 className="text-xl font-bold text-amber-900 mb-4">القسم الثاني: عد الكاش والفيزا</h2>

            {/* Cash Denominations */}
            <div className="mb-6">
              <h3 className="font-semibold text-amber-900 mb-3">عد الكاش في الجرار</h3>
              <div className="grid grid-cols-3 gap-2">
                {SHEKEL_DENOMINATIONS.map((denom) => (
                  <div key={denom} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-600">فئة {denom} شيكل</p>
                    <p className="text-lg font-bold text-amber-900">
                      {record.cashDenominations[denom] || 0}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
                <span className="font-semibold">إجمالي الكاش من الفئات</span>
                <span className="text-xl font-bold text-amber-900">{cashFromDenominations.toFixed(2)}</span>
              </div>
            </div>

            {/* Other Currencies */}
            <div className="mb-6 border-t-2 border-amber-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الدولار</p>
                  <p className="text-2xl font-bold text-amber-900">{record.dollarAmount.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الدينار</p>
                  <p className="text-2xl font-bold text-amber-900">{record.dinarAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
                <span className="font-semibold">إجمالي عد الكاش</span>
                <span className="text-xl font-bold text-amber-900">{drawerTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Visa Reports */}
            <div className="border-t-2 border-amber-200 pt-4">
              <h3 className="font-semibold text-amber-900 mb-3">تقرير الفيزا</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Visa Wells</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {record.visaReports.visaWells.toFixed(2)}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Visa Food On Time</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {record.visaReports.visaFoodOnTime.toFixed(2)}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Visa Machine</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {record.visaReports.visaMachine.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
                <span className="font-semibold">مجموع 2 (تقارير الفيزا)</span>
                <span className="text-xl font-bold text-amber-900">{total2.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Final Report */}
          <Card
            className={`p-6 border-2 ${
              difference === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                difference === 0 ? "text-green-900" : "text-red-900"
              }`}
            >
              التقرير النهائي
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">تقرير الكاش = (عد الكاش + مجموع 2)</span>
                <span className="text-2xl font-bold text-amber-900">{cashReport.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">تقرير السيستم</span>
                <span className="text-2xl font-bold text-blue-900">{systemReport.toFixed(2)}</span>
              </div>
              <div
                className={`flex justify-between items-center p-4 rounded-lg ${
                  difference === 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span className="font-semibold text-lg">الفرق</span>
                <span
                  className={`text-3xl font-bold ${
                    difference === 0 ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {difference.toFixed(2)}
                </span>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-100">
                <p className="text-lg font-bold">
                  {difference === 0 ? (
                    <span className="text-green-700">✓ متطابق تماماً</span>
                  ) : (
                    <span className="text-red-700">⚠️ هناك فرق</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {record.notes && (
            <Card className="p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ملاحظات</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:space-y-4 > * + * {
            margin-top: 1rem;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
