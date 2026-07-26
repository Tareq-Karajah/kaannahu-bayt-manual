import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Printer, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];
const n = (v: any) => parseFloat(String(v ?? 0)) || 0;

export default function CashClosingDetailsPage() {
  const [, setLocation] = useLocation();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [record, setRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRecord, setEditedRecord] = useState<any>(null);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRecordId(params.get("id"));
  }, []);

  const { data: records, isLoading, refetch } = trpc.cashClosing.getHistory.useQuery(
    { limit: 200 },
    { enabled: !!recordId }
  );

  const updateMutation = trpc.cashClosing.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditMode(false);
      setSaveMsg("تم تحديث السجل بنجاح");
      setTimeout(() => setSaveMsg(""), 3000);
    },
    onError: (error: any) => {
      setSaveMsg("خطأ: " + error.message);
    },
  });

  useEffect(() => {
    if (records && recordId) {
      const found = records.find((r: any) => String(r.id) === recordId);
      if (found) {
        setRecord(found);
        setEditedRecord({ ...found });
      }
    }
  }, [records, recordId]);

  const formatDate = (date: any) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (!d || isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-US");
    } catch { return "—"; }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedRecord((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editedRecord?.id) return;
    const closingDateStr =
      typeof editedRecord.closingDate === "string"
        ? editedRecord.closingDate.split("T")[0]
        : editedRecord.closingDate instanceof Date
        ? editedRecord.closingDate.toISOString().split("T")[0]
        : "";
    await updateMutation.mutateAsync({
      id: Number(editedRecord.id),
      employeeName: editedRecord.employeeName,
      closingDate: closingDateStr,
      cashIn: String(editedRecord.cashIn ?? ""),
      cash: String(editedRecord.cash ?? ""),
      visa: String(editedRecord.visa ?? ""),
      expenses: String(editedRecord.expenses ?? ""),
      notes: editedRecord.notes ?? "",
    });
  };

  if (!recordId || isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center" dir="rtl">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => setLocation("/cash-closing")} variant="outline" className="mb-4">
            <ArrowRight className="w-4 h-4 ml-2" /> العودة
          </Button>
          <Card className="p-6 text-center"><p className="text-gray-500">لم يتم العثور على السجل</p></Card>
        </div>
      </div>
    );
  }

  const disp = isEditMode ? editedRecord : record;
  const cashIn = n(disp.cashIn);
  const cash = n(disp.cash);
  const visa = n(disp.visa);
  const expenses = n(disp.expenses);
  // Use stored DB values (calculated correctly when saved)
  const total1 = n(disp.total1) || (cashIn + cash + visa);
  const systemReport = n(disp.systemReport) || (total1 - expenses);
  const visaMachine = n(disp.visaMachineReport);
  const visaWells = n(disp.visaWellsReport);
  const visaFoodOnTime = n(disp.visaFoodOnTimeReport);
  const total2 = n(disp.total2) || (visaMachine + visaWells + visaFoodOnTime);
  const cashCountTotal = n(disp.cashCountTotal);
  const dollarAmount = n(disp.dollarAmount);
  const dinarAmount = n(disp.dinarAmount);
  const cashFromDenominations = SHEKEL_DENOMINATIONS.reduce((sum, denom) => {
    const key = denom === 0.5 ? "shekelCoins05" : `shekelNotes${denom}`;
    return sum + denom * n(disp[key]);
  }, 0);
  // Use stored cashReport from DB - most accurate value
  const cashReport = n(disp.cashReport) || (cashCountTotal + cashFromDenominations + dollarAmount + dinarAmount + total2);
  const difference = n(disp.difference) !== 0 ? n(disp.difference) : (cashReport - systemReport);

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setLocation("/cash-closing")} variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" /> العودة
          </Button>
          <h1 className="text-2xl font-bold text-primary">تفاصيل تسكير الكاش</h1>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button onClick={handleSaveChanges} disabled={updateMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 ml-1" /> {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
                <Button onClick={() => { setIsEditMode(false); setEditedRecord({ ...record }); }} variant="outline">
                  <X className="w-4 h-4 ml-1" /> إلغاء
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditMode(true)} variant="outline">
                  <Edit2 className="w-4 h-4 ml-1" /> تعديل
                </Button>
                <Button onClick={() => window.print()} variant="outline">
                  <Printer className="w-4 h-4 ml-1" /> طباعة
                </Button>
              </>
            )}
          </div>
        </div>

        {saveMsg && (
          <div className={`p-3 rounded-lg text-center font-semibold ${saveMsg.startsWith("تم") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {saveMsg}
          </div>
        )}

        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">معلومات التسكير</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">اسم الموظف</p>
              {isEditMode ? (
                <input type="text" value={editedRecord.employeeName || ""} onChange={(e) => handleEditChange("employeeName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
              ) : (
                <p className="text-lg font-bold">{disp.employeeName}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ التسكير</p>
              {isEditMode ? (
                <input type="date" value={typeof editedRecord.closingDate === "string" ? editedRecord.closingDate.split("T")[0] : editedRecord.closingDate instanceof Date ? editedRecord.closingDate.toISOString().split("T")[0] : ""} onChange={(e) => handleEditChange("closingDate", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
              ) : (
                <p className="text-lg font-bold">{formatDate(disp.closingDate)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">الإيرادات</h2>
          <div className="grid grid-cols-3 gap-4">
            {([["cashIn", "كاش داخل", cashIn], ["cash", "كاش", cash], ["visa", "فيزا", visa]] as [string, string, number][]).map(([field, label, value]) => (
              <div key={field} className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{label}</p>
                {isEditMode ? (
                  <input type="number" value={editedRecord[field] ?? ""} onChange={(e) => handleEditChange(field, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-amber-900">{value.toFixed(2)}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
            <span className="font-semibold">مجموع 1 (الإيرادات)</span>
            <span className="text-xl font-bold text-amber-900">{total1.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between items-center bg-yellow-100 p-3 rounded-lg">
            <span className="font-semibold">مجموع (الكاش + الفيزا) بدون الكاش الداخل</span>
            <span className="text-xl font-bold text-yellow-900">{(cash + visa).toFixed(2)}</span>
          </div>
        </Card>

        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">المصاريف</h2>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">المصاريف</p>
            {isEditMode ? (
              <input type="number" value={editedRecord.expenses ?? ""} onChange={(e) => handleEditChange("expenses", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
            ) : (
              <p className="text-2xl font-bold text-amber-900">{expenses.toFixed(2)}</p>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
            <span className="font-semibold">تقرير السيستم (مجموع 1 - المصاريف)</span>
            <span className="text-xl font-bold text-amber-900">{systemReport.toFixed(2)}</span>
          </div>
        </Card>

        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">عد الكاش</h2>
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">إجمالي عد الكاش</p>
            <p className="text-2xl font-bold text-amber-900">{cashCountTotal.toFixed(2)}</p>
          </div>
          <h3 className="font-semibold text-amber-900 mb-3">الفئات النقدية</h3>
          <div className="grid grid-cols-3 gap-3">
            {SHEKEL_DENOMINATIONS.map((denom) => {
              const key = denom === 0.5 ? "shekelCoins05" : `shekelNotes${denom}`;
              const qty = n(disp[key]);
              return (
                <div key={denom} className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{denom} ₪</p>
                  {isEditMode ? (
                    <input type="number" value={editedRecord[key] ?? 0} onChange={(e) => handleEditChange(key, parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded mt-1" />
                  ) : (
                    <p className="font-bold text-amber-900">{qty} × {denom} = {(qty * denom).toFixed(2)}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
            <span className="font-semibold">إجمالي الكاش من الفئات</span>
            <span className="text-xl font-bold text-amber-900">{cashFromDenominations.toFixed(2)}</span>
          </div>
          {(dollarAmount > 0 || dinarAmount > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-amber-50 p-3 rounded-lg"><p className="text-sm text-gray-600">دولار</p><p className="font-bold text-amber-900">{dollarAmount.toFixed(2)}</p></div>
              <div className="bg-amber-50 p-3 rounded-lg"><p className="text-sm text-gray-600">دينار</p><p className="font-bold text-amber-900">{dinarAmount.toFixed(2)}</p></div>
            </div>
          )}
        </Card>

        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">تقارير الفيزا</h2>
          <div className="grid grid-cols-3 gap-4">
            {([["Visa Machine", visaMachine], ["Visa Wells", visaWells], ["Visa Food On Time", visaFoodOnTime]] as [string, number][]).map(([label, value]) => (
              <div key={label} className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-amber-900">{value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
            <span className="font-semibold">مجموع 2 (تقارير الفيزا)</span>
            <span className="text-xl font-bold text-amber-900">{total2.toFixed(2)}</span>
          </div>
        </Card>

        <Card className={`p-6 border-2 ${difference === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <h2 className={`text-xl font-bold mb-4 ${difference === 0 ? "text-green-900" : "text-red-900"}`}>التقرير النهائي</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span>تقرير الكاش</span><span className="font-bold">{cashReport.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>تقرير السيستم</span><span className="font-bold">{systemReport.toFixed(2)}</span></div>
            <div className={`flex justify-between p-4 rounded-lg ${difference === 0 ? "bg-green-100" : "bg-red-100"}`}>
              <span className="font-semibold text-lg">الفرق</span>
              <span className={`text-3xl font-bold ${difference === 0 ? "text-green-900" : "text-red-900"}`}>{difference.toFixed(2)}</span>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-100">
              {difference === 0 ? <span className="text-green-700 font-bold">متطابق تماماً</span> : <span className="text-red-700 font-bold">هناك فرق</span>}
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ملاحظات</h2>
          {isEditMode ? (
            <textarea value={editedRecord.notes || ""} onChange={(e) => handleEditChange("notes", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24" />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{disp.notes || "لا توجد ملاحظات"}</p>
          )}
        </Card>
      </div>
      <style>{"@media print { button { display: none !important; } }"}</style>
    </div>
  );
}
