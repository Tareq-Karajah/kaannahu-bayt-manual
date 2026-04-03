import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Calendar, TrendingUp } from "lucide-react";

export default function SalesForm() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<Array<{
    id?: number;
    dishId: number;
    quantity: number;
    totalPrice: string;
    notes?: string;
  }>>([]);

  const [dishes, setDishes] = useState<Array<{
    id: number;
    name: string;
    price: string;
  }>>([
    { id: 1, name: "فلافل", price: "5.00" },
    { id: 2, name: "شاورما", price: "8.00" },
    { id: 3, name: "كبة", price: "7.00" },
    { id: 4, name: "سلطة", price: "4.00" },
  ]);

  const saveSaleMutation = trpc.salesItems.save.useMutation();
  const deleteSaleMutation = trpc.salesItems.delete.useMutation();
  const getSalesQuery = trpc.salesItems.getByDate.useQuery({
    userId: 1,
    date: new Date(selectedDate),
  });

  const handleAddSale = () => {
    setSales([
      ...sales,
      {
        dishId: 1,
        quantity: 1,
        totalPrice: "5.00",
      },
    ]);
  };

  const handleSaveSale = async (index: number) => {
    const sale = sales[index];
    if (!sale.quantity || !sale.totalPrice) {
      alert("يرجى إدخال البيانات المطلوبة");
      return;
    }

    try {
      await saveSaleMutation.mutateAsync({
        userId: 1,
        dishId: sale.dishId,
        quantity: sale.quantity,
        saleDate: new Date(selectedDate),
        totalPrice: sale.totalPrice,
        notes: sale.notes,
      });

      const newSales = sales.filter((_, i) => i !== index);
      setSales(newSales);
      getSalesQuery.refetch();
    } catch (error) {
      console.error("خطأ في حفظ المبيعة:", error);
    }
  };

  const handleDeleteSale = async (id: number) => {
    try {
      await deleteSaleMutation.mutateAsync({ id });
      getSalesQuery.refetch();
    } catch (error) {
      console.error("خطأ في حذف المبيعة:", error);
    }
  };

  const handleUpdateSale = (index: number, field: string, value: any) => {
    const newSales = [...sales];
    newSales[index] = { ...newSales[index], [field]: value };
    setSales(newSales);
  };

  const calculateTotalRevenue = () => {
    if (!getSalesQuery.data) return 0;
    return getSalesQuery.data.reduce((sum, sale) => sum + parseFloat(sale.totalPrice.toString()), 0);
  };

  const calculateTotalItems = () => {
    if (!getSalesQuery.data) return 0;
    return getSalesQuery.data.reduce((sum, sale) => sum + sale.quantity, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">تسجيل المبيعات اليومية</h1>
        <p className="text-gray-600">تسجيل الأطباق المباعة والإيرادات</p>
      </div>

      {/* Date Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Add New Sale Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">إضافة مبيعة جديدة</h2>

        {sales.map((sale, index) => {
          const dish = dishes.find((d) => d.id === sale.dishId);
          return (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الطبق
                </label>
                <select
                  value={sale.dishId}
                  onChange={(e) => {
                    const newDishId = parseInt(e.target.value);
                    const newDish = dishes.find((d) => d.id === newDishId);
                    handleUpdateSale(index, "dishId", newDishId);
                    if (newDish) {
                      handleUpdateSale(index, "totalPrice", newDish.price);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dishes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.price} ₪
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الكمية
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={sale.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    const price = parseFloat(dish?.price || "0");
                    handleUpdateSale(index, "quantity", qty);
                    handleUpdateSale(index, "totalPrice", (price * qty).toFixed(2));
                  }}
                  min="1"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر الإجمالي
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sale.totalPrice}
                  onChange={(e) => handleUpdateSale(index, "totalPrice", e.target.value)}
                  step="0.01"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <Input
                  placeholder="ملاحظات اختيارية"
                  value={sale.notes || ""}
                  onChange={(e) => handleUpdateSale(index, "notes", e.target.value)}
                />
              </div>

              <Button
                onClick={() => handleSaveSale(index)}
                className="bg-green-600 hover:bg-green-700"
              >
                حفظ
              </Button>

              <Button
                onClick={() => {
                  const newSales = sales.filter((_, i) => i !== index);
                  setSales(newSales);
                }}
                variant="outline"
                className="text-red-600"
              >
                إلغاء
              </Button>
            </div>
          );
        })}

        <Button
          onClick={handleAddSale}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مبيعة جديدة
        </Button>
      </Card>

      {/* Sales List */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">المبيعات المسجلة لهذا اليوم</h2>

        {getSalesQuery.isLoading ? (
          <p className="text-gray-500">جاري التحميل...</p>
        ) : getSalesQuery.data && getSalesQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الطبق</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الكمية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">السعر الإجمالي</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الملاحظات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getSalesQuery.data.map((sale) => {
                  const dish = dishes.find((d) => d.id === sale.dishId);
                  return (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{dish?.name}</td>
                      <td className="py-3 px-4 text-gray-900">{sale.quantity}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{sale.totalPrice} ₪</td>
                      <td className="py-3 px-4 text-gray-600">{sale.notes || "-"}</td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDeleteSale(sale.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">لا توجد مبيعات مسجلة لهذا اليوم</p>
        )}
      </Card>

      {/* Summary Statistics */}
      {getSalesQuery.data && getSalesQuery.data.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">ملخص المبيعات</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأطباق المباعة</p>
              <p className="text-2xl font-bold text-green-600">{calculateTotalItems()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">{calculateTotalRevenue().toFixed(2)} ₪</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">عدد المعاملات</p>
              <p className="text-2xl font-bold text-green-600">{getSalesQuery.data.length}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
