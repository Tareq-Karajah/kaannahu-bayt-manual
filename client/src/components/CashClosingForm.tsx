"use client";

import { useState, useMemo } from "react";
import { Download, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";

// فئات الشيكل
const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];

interface CashDenominations {
  [key: number]: number; // key: denomination, value: count
}

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
  cashDenominations: CashDenominations;
  dollarAmount: number;
  dinarAmount: number;
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
      visaMachine: 0,
    },
    cashDenominations: SHEKEL_DENOMINATIONS.reduce(
      (acc, denom) => {
        acc[denom] = 0;
        return acc;
      },
      {} as CashDenominations
    ),
    dollarAmount: 0,
    dinarAmount: 0,
    notes: "",
  });

  // حساب إجمالي الكاش من الفئات
  const calculateCashFromDenominations = (denominations: CashDenominations) => {
    return Object.entries(denominations).reduce(
      (total, [denom, count]) => total + parseFloat(denom) * count,
      0
    );
  };

  // الحسابات التلقائية
  const calculations = useMemo(() => {
    const total1 = formData.cashIn + formData.cash + formData.visa; // مجموع 1
    const systemReport = total1 - formData.expenses; // تقرير السيستم
    const total2 =
      formData.visaReports.visaWells +
      formData.visaReports.visaFoodOnTime +
      formData.visaReports.visaMachine; // مجموع 2
    const drawerTotal =
      formData.drawerCount +
      calculateCashFromDenominations(formData.cashDenominations) +
      formData.dollarAmount +
      formData.dinarAmount;
    const cashReport = drawerTotal + total2; // تقرير الكاش
    const difference = cashReport - systemReport; // الفرق

    return {
      total1,
      systemReport,
      total2,
      drawerTotal,
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
        visaMachine: 0,
      },
      cashDenominations: SHEKEL_DENOMINATIONS.reduce(
        (acc, denom) => {
          acc[denom] = 0;
          return acc;
        },
        {} as CashDenominations
      ),
      dollarAmount: 0,
      dinarAmount: 0,
      notes: "",
    });
    setShowForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  const exportToExcel = (record: CashClosingRecord) => {
    const total1 = record.cashIn + record.cash + record.visa;
    const systemReport = total1 - record.expenses;
    const total2 =
      record.visaReports.visaWells +
      record.visaReports.visaFoodOnTime +
      record.visaReports.visaMachine;
    const drawerTotal =
      record.drawerCount +
      calculateCashFromDenominations(record.cashDenominations) +
      record.dollarAmount +
      record.dinarAmount;
    const cashReport = drawerTotal + total2;
    const difference = cashReport - systemReport;

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
      ["إجمالي الكاش من الفئات", calculateCashFromDenominations(record.cashDenominations)],
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

  const exportAllToExcel = () => {
    if (records.length === 0) {
      alert("لا توجد سجلات للتصدير");
      return;
    }

    const allData: any[] = [];

    records.forEach((record, index) => {
      const total1 = record.cashIn + record.cash + record.visa;
      const systemReport = total1 - record.expenses;
      const total2 =
        record.visaReports.visaWells +
        record.visaReports.visaFoodOnTime +
        record.visaReports.visaMachine;
      const drawerTotal =
        record.drawerCount +
        calculateCashFromDenominations(record.cashDenominations) +
        record.dollarAmount +
        record.dinarAmount;
      const cashReport = drawerTotal + total2;
      const difference = cashReport - systemReport;

      allData.push({
        "اسم الموظف": record.employeeName,
        "اليوم والتاريخ": new Date(record.date).toLocaleDateString("ar-SA"),
        "Cash In": record.cashIn,
        "Cash": record.cash,
        "Visa": record.visa,
        "مجموع 1 (Cash In + Cash + Visa)": total1,
        "المصاريف": record.expenses,
        "تقرير السيستم": systemReport,
        "عد الكاش في الجرار": record.drawerCount,
        "إجمالي الكاش من الفئات": calculateCashFromDenominations(
          record.cashDenominations
        ),
        "الدولار": record.dollarAmount,
        "الدينار": record.dinarAmount,
        "إجمالي عد الكاش": drawerTotal,
        "Visa Wells": record.visaReports.visaWells,
        "Visa Food On Time": record.visaReports.visaFoodOnTime,
        "Visa Machine": record.visaReports.visaMachine,
        "مجموع 2 (تقارير الفيزا)": total2,
        "تقرير الكاش": cashReport,
        "الفرق": difference,
        "الحالة": difference === 0 ? "متطابق ✓" : `فرق: ${difference}`,
        "ملاحظات": record.notes,
      });
    });

    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "جميع السجلات");

    ws["!cols"] = Array(Object.keys(allData[0]).length).fill({ wch: 20 });

    XLSX.writeFile(wb, `تسكير_كاش_الكل_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-900">نموذج تسكير الكاش</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 ml-2" />
            {showForm ? "إلغاء" : "إضافة تسكير جديد"}
          </Button>
          {records.length > 0 && (
            <Button
              onClick={exportAllToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير الكل إلى Excel
            </Button>
          )}
        </div>
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
                    setFormData({
                      ...formData,
                      employeeName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* القسم الأول: تقرير السيستم */}
            <div className="border-t-2 border-green-300 pt-4">
              <h4 className="text-base font-bold mb-4 text-green-900">
                القسم الأول: تقرير السيستم
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash In
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cashIn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cashIn: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cash}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cash: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.visa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  المصاريف
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expenses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expenses: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              {/* الحسابات التلقائية - القسم الأول */}
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">مجموع 1 (Cash In + Cash + Visa)</p>
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

            {/* القسم الثاني: عد الكاش والفيزا */}
            <div className="border-t-2 border-green-300 pt-4">
              <h4 className="text-base font-bold mb-4 text-green-900">
                القسم الثاني: عد الكاش والفيزا
              </h4>

              {/* عد الكاش - فئات الشيكل */}
              <div className="mb-6">
                <h5 className="text-sm font-bold text-gray-800 mb-3">
                  عد الكاش في الجرار (فئات الشيكل)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {SHEKEL_DENOMINATIONS.map((denom) => (
                    <div key={denom}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {denom} ש"ח
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cashDenominations[denom] || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cashDenominations: {
                              ...formData.cashDenominations,
                              [denom]: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* عملات أجنبية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدولار ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dollarAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dollarAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدينار (د.أ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dinarAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dinarAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* تقرير الفيزا */}
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h5 className="text-sm font-bold text-gray-800 mb-3">
                  تقرير الفيزا
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Visa Wells
                    </label>
                    <input
                      type="number"
                      step="0.01"
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
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Visa Food On Time
                    </label>
                    <input
                      type="number"
                      step="0.01"
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
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Visa Machine
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.visaReports.visaMachine}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visaReports: {
                            ...formData.visaReports,
                            visaMachine: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* الحسابات التلقائية - القسم الثاني */}
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">إجمالي عد الكاش</p>
                    <p className="text-lg font-bold text-green-700">
                      {calculations.drawerTotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">مجموع 2 (تقارير الفيزا)</p>
                    <p className="text-lg font-bold text-blue-700">
                      {calculations.total2.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* النتائج النهائية */}
            <div className="border-t-2 border-green-300 pt-4">
              <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">تقرير الكاش</p>
                    <p className="text-lg font-bold text-yellow-700">
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

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="أضف أي ملاحظات إضافية"
                rows={3}
              />
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddRecord}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
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
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-green-900">
            السجلات المحفوظة ({records.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-4 py-2 text-right">الموظف</th>
                  <th className="px-4 py-2 text-right">التاريخ</th>
                  <th className="px-4 py-2 text-right">تقرير السيستم</th>
                  <th className="px-4 py-2 text-right">تقرير الكاش</th>
                  <th className="px-4 py-2 text-right">الفرق</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                  <th className="px-4 py-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const total1 = record.cashIn + record.cash + record.visa;
                  const systemReport = total1 - record.expenses;
                  const total2 =
                    record.visaReports.visaWells +
                    record.visaReports.visaFoodOnTime +
                    record.visaReports.visaMachine;
                  const drawerTotal =
                    record.drawerCount +
                    calculateCashFromDenominations(record.cashDenominations) +
                    record.dollarAmount +
                    record.dinarAmount;
                  const cashReport = drawerTotal + total2;
                  const difference = cashReport - systemReport;

                  return (
                    <tr
                      key={record.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{record.employeeName}</td>
                      <td className="px-4 py-2">
                        {new Date(record.date).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-2">
                        {systemReport.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {cashReport.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-2 font-bold ${
                          difference === 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {difference.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {difference === 0 ? (
                          <span className="flex items-center text-green-700">
                            <CheckCircle className="w-4 h-4 ml-1" />
                            متطابق
                          </span>
                        ) : (
                          <span className="flex items-center text-red-700">
                            <AlertCircle className="w-4 h-4 ml-1" />
                            فرق
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => exportToExcel(record)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteRecord(record.id)}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* حالة فارغة */}
      {records.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">لا توجد سجلات حتى الآن</p>
          <p className="text-sm text-gray-400 mt-2">
            اضغط على "إضافة تسكير جديد" لبدء تسجيل تسكيرات الكاش
          </p>
        </Card>
      )}
    </div>
  );
}
