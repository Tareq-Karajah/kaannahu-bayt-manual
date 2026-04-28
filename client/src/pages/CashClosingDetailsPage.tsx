import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Download, Printer, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import * as XLSX from "xlsx";

const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];

export default function CashClosingDetailsPage() {
  const [, setLocation] = useLocation();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [record, setRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRecord, setEditedRecord] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setRecordId(id);
  }, []);

  const { data: records, isLoading, refetch } = trpc.cashClosing.getHistory.useQuery(
    { limit: 100 },
    { enabled: !!recordId }
  );

  const updateMutation = trpc.cashClosing.save.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditMode(false);
      alert("تم تحديث السجل بنجاح");
    },
    onError: (error) => {
      alert(`خطأ في تحديث البيانات: ${error.message}`);
    },
  });

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
        setEditedRecord({ ...found, closingDate: dateObj });
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

  const handleEditChange = (field: string, value: any) => {
    setEditedRecord({
      ...editedRecord,
      [field]: value,
    });
  };

  const handleDenominationChange = (denom: number, value: number) => {
    setEditedRecord({
      ...editedRecord,
      [denom === 0.5 ? "shekelCoins05" : `shekelNotes${denom}`]: value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      await updateMutation.mutateAsync({
        id: editedRecord.id,
        employeeName: editedRecord.employeeName,
        closingDate: editedRecord.closingDate,
        cashIn: editedRecord.cashIn,
        cash: editedRecord.cash,
        visa: editedRecord.visa,
        expenses: editedRecord.expenses,
        drawerCount: editedRecord.drawerCount,
        visaWells: editedRecord.visaWells,
        visaFoodOnTime: editedRecord.visaFoodOnTime,
        visaMachine: editedRecord.visaMachine,
        notes: editedRecord.notes,
      });
    } catch (error) {
      console.error("Error saving:", error);
    }
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
        <Button onClick={() => setLocation("/cash-closing")}>العودة</Button>
      </div>
    );
  }

  const displayRecord = isEditMode ? editedRecord : record;
  const n = (v: any) => parseFloat(String(v || 0)) || 0;
  const total1 = n(displayRecord.cashIn) + n(displayRecord.cash) + n(displayRecord.visa);
  const systemReport = total1 - n(displayRecord.expenses);
  const total2 = n(displayRecord.visaWellsReport ?? displayRecord.visaWells) + n(displayRecord.visaFoodOnTimeReport ?? displayRecord.visaFoodOnTime) + n(displayRecord.visaMachineReport ?? displayRecord.visaMachine);
  const cashFromDenominations = SHEKEL_DENOMINATIONS.reduce((sum: number, denom: number) => {
    const fieldName = denom === 0.5 ? "shekelCoins05" : `shekelNotes${denom}`;
    return sum + (denom * n(displayRecord[fieldName]));
  }, 0);
  const drawerTotal = n(displayRecord.cashCountTotal ?? displayRecord.drawerCount) + n(displayRecord.dollarAmount) + n(displayRecord.dinarAmount);
  const cashReport = drawerTotal + cashFromDenominations + total2;
  const difference = cashReport - systemReport;

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button onClick={() => setLocation("/cash-closing")} variant="outline" className="mb-4">
              <ArrowRight className="w-4 h-4 ml-2" /> العودة
            </Button>
            <h1 className="text-3xl font-bold text-green-900">تفاصيل تسكير الكاش</h1>
            <p className="text-gray-600 mt-1">{displayRecord.employeeName} - {formatDate(displayRecord.closingDate)}</p>
          </div>
          <div className="space-x-2 flex gap-2">
            {!isEditMode ? (
              <>
                <Button onClick={() => window.print()} className="bg-gray-600 hover:bg-gray-700 text-white">
                  <Printer className="w-4 h-4 ml-2" /> طباعة
                </Button>
                <Button onClick={() => setIsEditMode(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Edit2 className="w-4 h-4 ml-2" /> تعديل
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditMode(false)} className="bg-gray-500 hover:bg-gray-600 text-white">
                  <X className="w-4 h-4 ml-2" /> إلغاء
                </Button>
                <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 ml-2" /> حفظ
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <Card className="p-6 bg-green-50 border-2 border-green-200">
          <h2 className="text-xl font-bold text-green-900 mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">اسم الموظف</p>
              {isEditMode ? (
                <input
                  type="text"
                  value={editedRecord.employeeName}
                  onChange={(e) => handleEditChange("employeeName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-lg font-semibold">{displayRecord.employeeName}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">اليوم والتاريخ</p>
              {isEditMode ? (
                <input
                  type="date"
                  value={displayRecord.closingDate.toISOString().split("T")[0]}
                  onChange={(e) => handleEditChange("closingDate", new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-lg font-semibold">{formatDate(displayRecord.closingDate)}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 1: System Report */}
        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">القسم الأول: تقرير السيستم</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Cash In</p>
              {isEditMode ? (
                <input
                  type="number"
                  value={editedRecord.cashIn}
                  onChange={(e) => handleEditChange("cashIn", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-2xl font-bold text-blue-900">{displayRecord.cashIn?.toFixed(2)}</p>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Cash</p>
              {isEditMode ? (
                <input
                  type="number"
                  value={editedRecord.cash}
                  onChange={(e) => handleEditChange("cash", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-2xl font-bold text-blue-900">{displayRecord.cash?.toFixed(2)}</p>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Visa</p>
              {isEditMode ? (
                <input
                  type="number"
                  value={editedRecord.visa}
                  onChange={(e) => handleEditChange("visa", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-2xl font-bold text-blue-900">{displayRecord.visa?.toFixed(2)}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span>مجموع 1</span><span className="font-bold">{total1.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span>المصاريف</span>
              {isEditMode ? (
                <input
                  type="number"
                  value={editedRecord.expenses}
                  onChange={(e) => handleEditChange("expenses", parseFloat(e.target.value))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-lg"
                />
              ) : (
                <span className="font-bold text-red-600">{displayRecord.expenses?.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between bg-blue-100 p-3 rounded-lg"><span>تقرير السيستم</span><span className="font-bold">{systemReport.toFixed(2)}</span></div>
          </div>
        </Card>

        {/* Section 2: Cash Count */}
        <Card className="p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">القسم الثاني: عد الكاش والفيزا</h2>

          {/* Cash Denominations */}
          <div className="mb-6">
            <h3 className="font-semibold text-amber-900 mb-3">عد الكاش في الجرار</h3>
            <div className="grid grid-cols-3 gap-2">
              {SHEKEL_DENOMINATIONS.map((denom) => {
                const fieldName = denom === 0.5 ? "shekelCoins05" : `shekelNotes${denom}`;
                const value = displayRecord[fieldName] || 0;
                return (
                  <div key={denom} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-600">فئة {denom} شيكل</p>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleDenominationChange(denom, parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <p className="text-lg font-bold text-amber-900">{value}</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
              <span className="font-semibold">إجمالي الكاش من الفئات</span>
              <span className="text-xl font-bold text-amber-900">{cashFromDenominations.toFixed(2)}</span>
            </div>
          </div>

          {/* Visa Reports */}
          <div className="border-t-2 border-amber-200 pt-4">
            <h3 className="font-semibold text-amber-900 mb-3">تقرير الفيزا</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Visa Wells</p>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editedRecord.visaWells}
                    onChange={(e) => handleEditChange("visaWells", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-2xl font-bold text-amber-900">{displayRecord.visaWells?.toFixed(2)}</p>
                )}
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Visa Food On Time</p>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editedRecord.visaFoodOnTime}
                    onChange={(e) => handleEditChange("visaFoodOnTime", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-2xl font-bold text-amber-900">{displayRecord.visaFoodOnTime?.toFixed(2)}</p>
                )}
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Visa Machine</p>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editedRecord.visaMachine}
                    onChange={(e) => handleEditChange("visaMachine", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-2xl font-bold text-amber-900">{displayRecord.visaMachine?.toFixed(2)}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center bg-amber-100 p-3 rounded-lg">
              <span className="font-semibold">مجموع 2 (تقارير الفيزا)</span>
              <span className="text-xl font-bold text-amber-900">{total2.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Final Report */}
        <Card className={`p-6 border-2 ${difference === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <h2 className={`text-xl font-bold mb-4 ${difference === 0 ? "text-green-900" : "text-red-900"}`}>التقرير النهائي</h2>
          <div className="space-y-4">
            <div className="flex justify-between"><span>تقرير الكاش</span><span className="font-bold">{cashReport.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>تقرير السيستم</span><span className="font-bold">{systemReport.toFixed(2)}</span></div>
            <div className={`flex justify-between p-4 rounded-lg ${difference === 0 ? "bg-green-100" : "bg-red-100"}`}>
              <span className="font-semibold text-lg">الفرق</span>
              <span className={`text-3xl font-bold ${difference === 0 ? "text-green-900" : "text-red-900"}`}>{difference.toFixed(2)}</span>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-100">
              <p className="text-lg font-bold">{difference === 0 ? <span className="text-green-700">✓ متطابق تماماً</span> : <span className="text-red-700">⚠️ هناك فرق</span>}</p>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ملاحظات</h2>
          {isEditMode ? (
            <textarea
              value={editedRecord.notes || ""}
              onChange={(e) => handleEditChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{displayRecord.notes || "لا توجد ملاحظات"}</p>
          )}
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white; }
          button { display: none; }
          input, textarea { border: none; background: white; }
        }
      `}</style>
    </div>
  );
}
