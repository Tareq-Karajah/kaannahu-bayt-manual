import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Calendar } from "lucide-react";

export default function DailyQuantitiesForm() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantities, setQuantities] = useState<Array<{
    id?: number;
    productId: number;
    quantityWithdrawn: string;
    unit: string;
    notes?: string;
  }>>([]);
  
  const [products, setProducts] = useState<Array<{
    id: number;
    name: string;
    unit: string;
  }>>([
    { id: 1, name: "دقيق", unit: "كغ" },
    { id: 2, name: "سكر", unit: "كغ" },
    { id: 3, name: "زيت", unit: "لتر" },
    { id: 4, name: "بيض", unit: "عدد" },
  ]);

  const saveQuantityMutation = trpc.quantities.save.useMutation();
  const deleteQuantityMutation = trpc.quantities.delete.useMutation();
  const getQuantitiesQuery = trpc.quantities.getByDate.useQuery({
    userId: 1,
    date: new Date(selectedDate),
  });

  const handleAddQuantity = () => {
    setQuantities([
      ...quantities,
      {
        productId: 1,
        quantityWithdrawn: "",
        unit: "كغ",
      },
    ]);
  };

  const handleSaveQuantity = async (index: number) => {
    const qty = quantities[index];
    if (!qty.quantityWithdrawn) {
      alert("يرجى إدخال الكمية");
      return;
    }

    try {
      await saveQuantityMutation.mutateAsync({
        userId: 1,
        productId: qty.productId,
        quantityDate: new Date(selectedDate),
        quantityWithdrawn: qty.quantityWithdrawn,
        unit: qty.unit,
        notes: qty.notes,
      });

      // Remove from local state
      const newQuantities = quantities.filter((_, i) => i !== index);
      setQuantities(newQuantities);

      // Refresh the list
      getQuantitiesQuery.refetch();
    } catch (error) {
      console.error("خطأ في حفظ الكمية:", error);
    }
  };

  const handleDeleteQuantity = async (id: number) => {
    try {
      await deleteQuantityMutation.mutateAsync({ id });
      getQuantitiesQuery.refetch();
    } catch (error) {
      console.error("خطأ في حذف الكمية:", error);
    }
  };

  const handleUpdateQuantity = (index: number, field: string, value: any) => {
    const newQuantities = [...quantities];
    newQuantities[index] = { ...newQuantities[index], [field]: value };
    setQuantities(newQuantities);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">إدخال الكميات اليومية</h1>
        <p className="text-gray-600">تسجيل الكميات المسحوبة من المخزن يومياً</p>
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

      {/* Add New Quantity Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">إضافة كمية جديدة</h2>
        
        {quantities.map((qty, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنتج
              </label>
              <select
                value={qty.productId}
                onChange={(e) => handleUpdateQuantity(index, "productId", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الكمية
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={qty.quantityWithdrawn}
                onChange={(e) => handleUpdateQuantity(index, "quantityWithdrawn", e.target.value)}
                step="0.01"
              />
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوحدة
              </label>
              <select
                value={qty.unit}
                onChange={(e) => handleUpdateQuantity(index, "unit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="كغ">كغ</option>
                <option value="لتر">لتر</option>
                <option value="عدد">عدد</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <Input
                placeholder="ملاحظات اختيارية"
                value={qty.notes || ""}
                onChange={(e) => handleUpdateQuantity(index, "notes", e.target.value)}
              />
            </div>

            <Button
              onClick={() => handleSaveQuantity(index)}
              className="bg-green-600 hover:bg-green-700"
            >
              حفظ
            </Button>

            <Button
              onClick={() => {
                const newQuantities = quantities.filter((_, i) => i !== index);
                setQuantities(newQuantities);
              }}
              variant="outline"
              className="text-red-600"
            >
              إلغاء
            </Button>
          </div>
        ))}

        <Button
          onClick={handleAddQuantity}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة كمية جديدة
        </Button>
      </Card>

      {/* Saved Quantities List */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">الكميات المسجلة لهذا اليوم</h2>

        {getQuantitiesQuery.isLoading ? (
          <p className="text-gray-500">جاري التحميل...</p>
        ) : getQuantitiesQuery.data && getQuantitiesQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">المنتج</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الكمية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الوحدة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الملاحظات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getQuantitiesQuery.data.map((qty) => {
                  const product = products.find((p) => p.id === qty.productId);
                  return (
                    <tr key={qty.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{product?.name}</td>
                      <td className="py-3 px-4 text-gray-900">{qty.quantityWithdrawn}</td>
                      <td className="py-3 px-4 text-gray-900">{qty.unit}</td>
                      <td className="py-3 px-4 text-gray-600">{qty.notes || "-"}</td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDeleteQuantity(qty.id)}
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
          <p className="text-gray-500 text-center py-8">لا توجد كميات مسجلة لهذا اليوم</p>
        )}
      </Card>

      {/* Summary Statistics */}
      {getQuantitiesQuery.data && getQuantitiesQuery.data.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4">ملخص اليوم</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">عدد المنتجات المسحوبة</p>
              <p className="text-2xl font-bold text-blue-600">{getQuantitiesQuery.data.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">آخر تحديث</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString('ar-SA')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
