import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import * as XLSX from "xlsx";

const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];

export default function CashClosingDetailsPage() {
  const [, setLocation] = useLocation();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setRecordId(id);
  }, []);

  const { data: records, isLoading } = trpc.cashClosing.getHistory.useQuery(
    { limit: 100 },
    { enabled: !!recordId }
  );

  useEffect(() => {
    if (records && recordId) {
      const found = records.find((r: any) => r.id.toString() === recordId);
      if (found) {
        let dateObj: Date;
        if (typeof found.closingDate === "string") {
          dateObj = new Date(found.closingDate);
        } else if (found.closingDate instanceof Date) {
          dateObj = found.closingDate;
        } else if (found.closingDate) {
          dateObj = new Date(found.closingDate);
        } else {
          dateObj = new Date();
        }
        setRecord({ ...found, closingDate: dateObj });
      }
    }
  }, [records, recordId]);

  const formatDate = (date: any) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "تاريخ غير صحيح";
      return dateObj.toLocaleDateString("en-US");
    } catch {
      return "تاريخ غير صحيح";
    }
  };

  if (!recordId || isLoading) return <div className="min-h-screen bg-background p-4 flex items-center justify-center" dir="rtl"><p>جاري التحميل...</p></div>;
  if (!record) return <div className="min-h-screen bg-background p-4" dir="rtl"><Button onClick={() => setLocation("/cash-closing")}>العودة</Button></div>;

  const total1 = record.cashIn + record.cash + record.visa;
  const systemReport = total1 - record.expenses;
  const total2 = record.visaWells + record.visaFoodOnTime + record.visaMachine;
  const cashFromDenominations = SHEKEL_DENOMINATIONS.reduce((sum: number, denom: number) => sum + (denom * (record[`shekelNotes${denom}` as keyof typeof record] || 0)), 0);
  const drawerTotal = record.drawerCount + cashFromDenominations + record.dollarAmount + record.dinarAmount;
  const cashReport = drawerTotal + total2;
  const difference = cashReport - systemReport;

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button onClick={() => setLocation("/cash-closing")} variant="outline" className="mb-4">
              <ArrowRight className="w-4 h-4 ml-2" /> العودة
            </Button>
            <h1 className="text-3xl font-bold text-green-900">تفاصيل تسكير الكاش</h1>
            <p className="text-gray-600 mt-1">{record.employeeName} - {formatDate(record.closingDate)}</p>
          </div>
        </div>

        <Card className="p-6 bg-green-50 border-2 border-green-200">
          <h2 className="text-xl font-bold text-green-900 mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-600">اسم الموظف</p><p className="text-lg font-semibold">{record.employeeName}</p></div>
            <div><p className="text-sm text-gray-600">اليوم والتاريخ</p><p className="text-lg font-semibold">{formatDate(record.closingDate)}</p></div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">القسم الأول: تقرير السيستم</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Cash In</p><p className="text-2xl font-bold text-blue-900">{record.cashIn?.toFixed(2)}</p></div>
            <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Cash</p><p className="text-2xl font-bold text-blue-900">{record.cash?.toFixed(2)}</p></div>
            <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Visa</p><p className="text-2xl font-bold text-blue-900">{record.visa?.toFixed(2)}</p></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span>مجموع 1</span><span className="font-bold">{total1.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>المصاريف</span><span className="font-bold text-red-600">{record.expenses?.toFixed(2)}</span></div>
            <div className="flex justify-between bg-blue-100 p-3 rounded-lg"><span>تقرير السيستم</span><span className="font-bold">{systemReport.toFixed(2)}</span></div>
          </div>
        </Card>

        <Card className={`p-6 border-2 ${difference === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <h2 className={`text-xl font-bold mb-4 ${difference === 0 ? "text-green-900" : "text-red-900"}`}>التقرير النهائي</h2>
          <div className="space-y-4">
            <div className="flex justify-between"><span>تقرير الكاش</span><span className="font-bold">{cashReport.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>تقرير السيستم</span><span className="font-bold">{systemReport.toFixed(2)}</span></div>
            <div className={`flex justify-between p-4 rounded-lg ${difference === 0 ? "bg-green-100" : "bg-red-100"}`}>
              <span className="font-semibold">الفرق</span>
              <span className={`text-3xl font-bold ${difference === 0 ? "text-green-900" : "text-red-900"}`}>{difference.toFixed(2)}</span>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-100">
              <p className="text-lg font-bold">{difference === 0 ? <span className="text-green-700">✓ متطابق تماماً</span> : <span className="text-red-700">⚠️ هناك فرق</span>}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
