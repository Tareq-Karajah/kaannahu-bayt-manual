import { useState } from "react";
import { Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface WasteLog {
  id: number;
  productId: number;
  quantity: number;
  reason: string;
  estimatedCost?: number;
  wasteDate: string;
  notes?: string;
}

export default function WasteLoggingForm() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    quantity: 0,
    reason: "تلف",
    estimatedCost: 0,
    wasteDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Fetch data
  const { data: products = [] } = trpc.products.getAll.useQuery();
  const { data: wasteLogs = [], refetch: refetchLogs } = trpc.waste.getWasteLogs.useQuery({});

  // Mutations
  const createLogMutation = trpc.waste.logWaste.useMutation({
    onSuccess: () => {
      refetchLogs();
      resetForm();
      alert("✅ تم تسجيل الهدر بنجاح");
    },
    onError: (error) => {
      alert(`❌ خطأ: ${error.message}`);
    },
  });

  // Calculate waste statistics
  const totalWasteQuantity = wasteLogs.reduce((sum, log) => sum + parseFloat(log.quantity.toString()), 0);
  const totalWasteCost = wasteLogs.reduce((sum, log) => sum + parseFloat(log.estimatedCost?.toString() || "0"), 0);
  const wasteByReason = wasteLogs.reduce((acc: Record<string, number>, log) => {
    acc[log.reason] = (acc[log.reason] || 0) + parseFloat(log.quantity.toString());
    return acc;
  }, {});

  const resetForm = () => {
    setFormData({
      productId: 0,
      quantity: 0,
      reason: "تلف",
      estimatedCost: 0,
      wasteDate: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (formData.productId === 0) {
      alert("⚠️ يرجى اختيار منتج");
      return;
    }
    if (formData.quantity <= 0) {
      alert("⚠️ يرجى إدخال كمية أكبر من صفر");
      return;
    }

    await createLogMutation.mutateAsync({
      productId: formData.productId,
      quantity: formData.quantity.toString(),
      reason: formData.reason,
      estimatedCost: formData.estimatedCost,
      wasteDate: formData.wasteDate,
      notes: formData.notes,
    });
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || "منتج غير معروف";
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      "تلف": "bg-red-100 text-red-800",
      "انتهاء صلاحية": "bg-orange-100 text-orange-800",
      "فائض": "bg-yellow-100 text-yellow-800",
      "خطأ": "bg-pink-100 text-pink-800",
      "أخرى": "bg-gray-100 text-gray-800",
    };
    return colors[reason] || colors["أخرى"];
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">📊 تسجيل الهدر</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          تسجيل هدر جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">إجمالي الهدر</p>
              <p className="text-2xl font-bold text-red-800">{totalWasteQuantity.toFixed(2)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">تكلفة الهدر</p>
              <p className="text-2xl font-bold text-orange-800">₪{totalWasteCost.toFixed(2)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">عدد السجلات</p>
              <p className="text-2xl font-bold text-blue-800">{wasteLogs.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-card border-2 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">إضافة سجل هدر جديد</h3>
          
          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">المنتج *</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value={0}>اختر منتج...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (الكمية: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الكمية المهدرة *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التكلفة المقدرة (₪)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">السبب *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="تلف">تلف</option>
                <option value="انتهاء صلاحية">انتهاء صلاحية</option>
                <option value="فائض">فائض</option>
                <option value="خطأ">خطأ</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2">التاريخ</label>
              <input
                type="date"
                value={formData.wasteDate}
                onChange={(e) => setFormData({ ...formData, wasteDate: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={3}
                placeholder="أضف ملاحظات إضافية..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createLogMutation.isPending}
              >
                {createLogMutation.isPending ? "جاري التسجيل..." : "تسجيل الهدر"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Waste Breakdown by Reason */}
      {Object.keys(wasteByReason).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع الهدر حسب السبب</h3>
          <div className="space-y-2">
            {Object.entries(wasteByReason).map(([reason, quantity]) => (
              <div key={reason} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReasonColor(reason)}`}>
                  {reason}
                </span>
                <span className="font-semibold">{(quantity as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Waste Logs */}
      {wasteLogs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">السجلات الأخيرة</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {wasteLogs.slice().reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{getProductName(log.productId)}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.quantity} | {log.reason} | {new Date(log.wasteDate).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">₪{parseFloat(log.estimatedCost?.toString() || "0").toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {wasteLogs.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد سجلات هدر حتى الآن</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بتسجيل الهدر لمراقبة الخسائر</p>
        </Card>
      )}
    </div>
  );
}
