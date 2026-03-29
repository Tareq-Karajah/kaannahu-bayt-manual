import React, { useState, useMemo } from "react";
import { Download, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  };
  notes: string;
}

export default function CashClosingForm() {
  const [records, setRecords] = useState<CashClosingRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CashClosingRecord>({
    id: "",
    employeeName: "",
    date: new Date().toISOString().split("T")[0],
    cashIn: 0,
    cash: 0,
    visa: 0,
    expenses: 0,
    drawerCount: 0,
    visaReports: {
      visaWells: 0,
      visaFoodOnTime: 0,
    },
    notes: "",
  });

  // الحسابات التلقائية
  const calculations = useMemo(() => {
    const total1 = formData.cash + formData.visa; // مجموع 1
    const systemReport = total1 - formData.expenses; // تقرير السيستم
    const total2 =
      formData.visaReports.visaWells + formData.visaReports.visaFoodOnTime; // مجموع 2
    const cashReport = formData.drawerCount + total2; // تقرير الكاش
    const difference = cashReport - systemReport; // الفرق

    return {
      total1,
      systemReport,
      total2,
      cashReport,
      difference,
    };
  }, [formData]);

  const handleAddRecord = () => {
    if (!formData.employeeName || !formData.date) {
      alert("يرجى إدخال اسم الموظف والتاريخ");
      return;
    }

    const newRecord = {
      ...formData,
      id: Date.now().toString(),
    };

    setRecords([...records, newRecord]);
    setFormData({
      id: "",
      employeeName: "",
      date: new Date().toISOString().split("T")[0],
      cashIn: 0,
      cash: 0,
      visa: 0,
      expenses: 0,
      drawerCount: 0,
      visaReports: {
        visaWells: 0,
        visaFoodOnTime: 0,
      },
      notes: "",
    });
    setShowForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  const handleExportToExcel = () => {
    if (records.length === 0) {
      alert("لا توجد سجلات للتصدير");
      return;
    }

    const exportData = records.map((record) => {
      const total1 = record.cash + record.visa;
      const systemReport = total1 - record.expenses;
      const total2 =
        record.visaReports.visaWells + record.visaReports.visaFoodOnTime;
      const cashReport = record.drawerCount + total2;
      const difference = cashReport - systemReport;

      return {
        "اسم الموظف": record.employeeName,
        "اليوم والتاريخ": new Date(record.date).toLocaleDateString("ar-SA"),
        "Cash In": record.cashIn,
        "Cash": record.cash,
        "Visa": record.visa,
        "مجموع 1 (Cash + Visa)": total1,
        "المصاريف": record.expenses,
        "تقرير السيستم": systemReport,
        "عد الكاش في الجرار": record.drawerCount,
        "Visa Wells": record.visaReports.visaWells,
        "Visa Food On Time": record.visaReports.visaFoodOnTime,
        "مجموع 2 (تقارير الفيزا)": total2,
        "تقرير الكاش": cashReport,
        "الفرق": difference,
        "ملاحظات": record.notes,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تسكير الكاش");

    // تنسيق الأعمدة
    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `تسكير_الكاش_${new Date().toLocaleDateString("ar-SA")}.xlsx`
    );
  };

  const handleExportSingleRecord = (record: CashClosingRecord) => {
    const total1 = record.cash + record.visa;
    const systemReport = total1 - record.expenses;
    const total2 =
      record.visaReports.visaWells + record.visaReports.visaFoodOnTime;
    const cashReport = record.drawerCount + total2;
    const difference = cashReport - systemReport;

    const exportData = [
      {
        "اسم الموظف": record.employeeName,
        "اليوم والتاريخ": new Date(record.date).toLocaleDateString("ar-SA"),
        "Cash In": record.cashIn,
        "Cash": record.cash,
        "Visa": record.visa,
        "مجموع 1 (Cash + Visa)": total1,
        "المصاريف": record.expenses,
        "تقرير السيستم": systemReport,
        "عد الكاش في الجرار": record.drawerCount,
        "Visa Wells": record.visaReports.visaWells,
        "Visa Food On Time": record.visaReports.visaFoodOnTime,
        "مجموع 2 (تقارير الفيزا)": total2,
        "تقرير الكاش": cashReport,
        "الفرق": difference,
        "ملاحظات": record.notes,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تسكير الكاش");

    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `تسكير_كاش_${record.employeeName}_${new Date(record.date).toLocaleDateString("ar-SA")}.xlsx`
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* رأس القسم */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          💰 نموذج تسكير الكاش اليومي
        </h2>
        <p className="text-green-700">
          نظام متقدم لتسكير الكاش مع حسابات تلقائية وتصدير Excel
        </p>
      </div>

      {/* أزرار التحكم */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Plus className="w-4 h-4 ml-2" />
          {showForm ? "إلغاء" : "إضافة تسكير جديد"}
        </Button>
        <Button
          onClick={handleExportToExcel}
          disabled={records.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
        >
          <Download className="w-4 h-4 ml-2" />
          تصدير الكل إلى Excel
        </Button>
      </div>

      {/* نموذج الإدخال */}
      {showForm && (
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <h3 className="text-lg font-bold mb-6 text-green-900">
            إدخال بيانات التسكير
          </h3>

          <div className="space-y-6">
            {/* البيانات الأساسية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف *
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم الموظف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اليوم والتاريخ *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* القسم الأول: Cash In */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">
                القسم الأول: Cash In
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash In
                  </label>
                  <input
                    type="number"
                    value={formData.cashIn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cashIn: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash
                  </label>
                  <input
                    type="number"
                    value={formData.cash}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cash: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa
                  </label>
                  <input
                    type="number"
                    value={formData.visa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المصاريف
                  </label>
                  <input
                    type="number"
                    value={formData.expenses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expenses: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* الحسابات التلقائية - القسم الأول */}
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">مجموع 1 (Cash + Visa)</p>
                    <p className="text-lg font-bold text-green-700">
                      {calculations.total1.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">تقرير السيستم</p>
                    <p className="text-lg font-bold text-green-700">
                      {calculations.systemReport.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* القسم الثاني: تقارير الفيزا */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">
                القسم الثاني: تقارير الفيزا والجرار
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عد الكاش في الجرار
                  </label>
                  <input
                    type="number"
                    value={formData.drawerCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        drawerCount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Wells
                  </label>
                  <input
                    type="number"
                    value={formData.visaReports.visaWells}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visaReports: {
                          ...formData.visaReports,
                          visaWells: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Food On Time
                  </label>
                  <input
                    type="number"
                    value={formData.visaReports.visaFoodOnTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visaReports: {
                          ...formData.visaReports,
                          visaFoodOnTime: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* الحسابات التلقائية - القسم الثاني */}
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">مجموع 2 (تقارير الفيزا)</p>
                    <p className="text-lg font-bold text-green-700">
                      {calculations.total2.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">تقرير الكاش</p>
                    <p className="text-lg font-bold text-green-700">
                      {calculations.cashReport.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">الفرق</p>
                    <p
                      className={`text-lg font-bold ${
                        calculations.difference === 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {calculations.difference.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* الملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="أضف أي ملاحظات مهمة"
                rows={3}
              />
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddRecord}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                حفظ التسكير
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* جدول السجلات */}
      {records.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">السجلات المحفوظة</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-right font-bold text-gray-700">
                    الموظف
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">
                    تقرير السيستم
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">
                    تقرير الكاش
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700">
                    الفرق
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const total1 = record.cash + record.visa;
                  const systemReport = total1 - record.expenses;
                  const total2 =
                    record.visaReports.visaWells +
                    record.visaReports.visaFoodOnTime;
                  const cashReport = record.drawerCount + total2;
                  const difference = cashReport - systemReport;

                  return (
                    <tr
                      key={record.id}
                      className={`border-b ${
                        difference === 0 ? "bg-green-50" : "bg-yellow-50"
                      } hover:bg-opacity-75 transition`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {record.employeeName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(record.date).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {systemReport.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {cashReport.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-3 font-bold ${
                          difference === 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {difference.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {difference === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleExportSingleRecord(record)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title="تصدير"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* رسالة عندما لا توجد سجلات */}
      {!showForm && records.length === 0 && (
        <Card className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">لا توجد سجلات حتى الآن</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول تسكير
          </Button>
        </Card>
      )}
    </div>
  );
}
