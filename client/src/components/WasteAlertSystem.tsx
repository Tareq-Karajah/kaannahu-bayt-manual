import { useState } from "react";
import { AlertCircle, CheckCircle, Clock, Plus, Trash2, Edit2, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface WasteAlert {
  id: number;
  productId: number;
  wastePercentage: number;
  threshold: number;
  status: string;
  alertDate: string;
  notes?: string;
}

export default function WasteAlertSystem() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [formData, setFormData] = useState({
    productId: 0,
    wastePercentage: 0,
    threshold: 5,
    alertDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Fetch data
  const { data: products = [] } = trpc.products.getAll.useQuery();
  const { data: alerts = [], refetch: refetchAlerts } = trpc.waste.getAlerts.useQuery({});
  const { data: wasteLogs = [] } = trpc.waste.getWasteLogs.useQuery({});

  // Mutations
  const createAlertMutation = trpc.waste.createAlert.useMutation({
    onSuccess: () => {
      refetchAlerts();
      resetForm();
    },
  });

  // Calculate waste statistics by product
  const wasteByProduct = wasteLogs.reduce((acc: Record<number, { quantity: number; cost: number; count: number }>, log) => {
    if (!acc[log.productId]) {
      acc[log.productId] = { quantity: 0, cost: 0, count: 0 };
    }
    acc[log.productId].quantity += parseFloat(log.quantity.toString());
    acc[log.productId].cost += parseFloat(log.estimatedCost?.toString() || "0");
    acc[log.productId].count += 1;
    return acc;
  }, {});

  // Calculate waste percentage for each product
  const productWasteStats = products.map(product => {
    const stats = wasteByProduct[product.id] || { quantity: 0, cost: 0, count: 0 };
    const wastePercentage = product.quantity > 0 ? (stats.quantity / product.quantity) * 100 : 0;
    return {
      ...product,
      wasteQuantity: stats.quantity,
      wasteCost: stats.cost,
      wasteCount: stats.count,
      wastePercentage: wastePercentage.toFixed(2),
    };
  });

  // Filter alerts
  const filteredAlerts = filterStatus === "الكل"
    ? alerts
    : alerts.filter(a => a.status === filterStatus);

  const resetForm = () => {
    setFormData({
      productId: 0,
      wastePercentage: 0,
      threshold: 5,
      alertDate: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateAlert = async () => {
    if (formData.productId === 0) {
      alert("يرجى اختيار منتج");
      return;
    }

    await createAlertMutation.mutateAsync({
      productId: formData.productId,
      wastePercentage: formData.wastePercentage,
      threshold: formData.threshold,
      alertDate: formData.alertDate,
      notes: formData.notes,
    });
  };

  const getAlertSeverity = (wastePercentage: number, threshold: number) => {
    if (wastePercentage > threshold * 3) return "حرج";
    if (wastePercentage > threshold * 2) return "عالي";
    if (wastePercentage > threshold) return "متوسط";
    return "منخفض";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "حرج":
        return "bg-red-50 border-red-200 text-red-900";
      case "عالي":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "متوسط":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      default:
        return "bg-green-50 border-green-200 text-green-900";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "حرج":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "عالي":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "متوسط":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const formatDate = (date: any): string => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return date;
    }
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">نظام تنبيهات الهدر</h2>
          <p className="text-sm text-gray-600 mt-1">مراقبة وتتبع الهدر الزائد والتنبيهات</p>
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء تنبيه
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-sm text-gray-600">تنبيهات حرجة</div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {alerts.filter(a => getAlertSeverity(a.wastePercentage, a.threshold) === "حرج").length}
          </div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="text-sm text-gray-600">تنبيهات عالية</div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {alerts.filter(a => getAlertSeverity(a.wastePercentage, a.threshold) === "عالي").length}
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-gray-600">تنبيهات متوسطة</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">
            {alerts.filter(a => getAlertSeverity(a.wastePercentage, a.threshold) === "متوسط").length}
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-gray-600">تنبيهات نشطة</div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {alerts.filter(a => a.status === "active").length}
          </div>
        </Card>
      </div>

      {/* نموذج إنشاء تنبيه */}
      {showForm && (
        <Card className="p-6 bg-gray-50 border-2 border-red-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">إنشاء تنبيه جديد</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنتج *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={0}>اختر منتج</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نسبة الهدر (%) *
              </label>
              <input
                type="number"
                value={formData.wastePercentage}
                onChange={(e) => setFormData({ ...formData, wastePercentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأدنى للتنبيه (%)
              </label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="5"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ التنبيه
              </label>
              <input
                type="date"
                value={formData.alertDate}
                onChange={(e) => setFormData({ ...formData, alertDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="أضف ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleCreateAlert}
              disabled={createAlertMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {createAlertMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء التنبيه"
              )}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
            >
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      {/* فلتر التنبيهات */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilterStatus("الكل")}
          variant={filterStatus === "الكل" ? "default" : "outline"}
          className={filterStatus === "الكل" ? "bg-gray-600" : ""}
        >
          الكل
        </Button>
        <Button
          onClick={() => setFilterStatus("active")}
          variant={filterStatus === "active" ? "default" : "outline"}
          className={filterStatus === "active" ? "bg-red-600" : ""}
        >
          نشطة
        </Button>
        <Button
          onClick={() => setFilterStatus("acknowledged")}
          variant={filterStatus === "acknowledged" ? "default" : "outline"}
          className={filterStatus === "acknowledged" ? "bg-yellow-600" : ""}
        >
          معترف بها
        </Button>
        <Button
          onClick={() => setFilterStatus("resolved")}
          variant={filterStatus === "resolved" ? "default" : "outline"}
          className={filterStatus === "resolved" ? "bg-green-600" : ""}
        >
          محلولة
        </Button>
      </div>

      {/* قائمة التنبيهات */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            لا توجد تنبيهات
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const product = products.find(p => p.id === alert.productId);
            const severity = getAlertSeverity(alert.wastePercentage, alert.threshold);
            const severityColor = getSeverityColor(severity);
            const severityIcon = getSeverityIcon(severity);

            return (
              <Card
                key={alert.id}
                className={`p-4 border-2 ${severityColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {severityIcon}
                    <div>
                      <div className="font-bold text-gray-900">
                        {product?.name || "منتج غير معروف"}
                      </div>
                      <div className="text-sm mt-2 space-y-1">
                        <div>
                          <span className="font-medium">نسبة الهدر:</span> {alert.wastePercentage}%
                        </div>
                        <div>
                          <span className="font-medium">الحد الأدنى:</span> {alert.threshold}%
                        </div>
                        <div>
                          <span className="font-medium">الخطورة:</span> {severity}
                        </div>
                        <div>
                          <span className="font-medium">التاريخ:</span> {formatDate(alert.alertDate)}
                        </div>
                        <div>
                          <span className="font-medium">الحالة:</span> {alert.status}
                        </div>
                      </div>
                      {alert.notes && (
                        <div className="text-sm mt-2">
                          <span className="font-medium">ملاحظات:</span> {alert.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* إحصائيات الهدر حسب المنتج */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات الهدر حسب المنتج</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-2 px-4 font-medium text-gray-700">اسم المنتج</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700">الكمية الإجمالية</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700">كمية الهدر</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700">نسبة الهدر</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700">تكلفة الهدر</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700">عدد الحوادث</th>
              </tr>
            </thead>
            <tbody>
              {productWasteStats
                .filter(p => p.wasteQuantity > 0)
                .sort((a, b) => parseFloat(b.wastePercentage) - parseFloat(a.wastePercentage))
                .map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.quantity} {product.unit}</td>
                    <td className="py-3 px-4">{product.wasteQuantity.toFixed(2)} {product.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseFloat(product.wastePercentage) > 10 ? "bg-red-100 text-red-700" :
                        parseFloat(product.wastePercentage) > 5 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {product.wastePercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{product.wasteCost.toFixed(2)} ₪</td>
                    <td className="py-3 px-4">{product.wasteCount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {productWasteStats.filter(p => p.wasteQuantity > 0).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات هدر حتى الآن
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
