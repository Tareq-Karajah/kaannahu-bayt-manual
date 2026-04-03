import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch data
  const { data: wasteLogs = [] } = trpc.waste.getWasteLogs.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: wasteAlerts = [] } = trpc.waste.getAlerts.useQuery({
    status: "active",
  });

  const { data: products = [] } = trpc.products.getAll.useQuery();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWaste = wasteLogs.reduce((sum, log) => sum + parseFloat(log.estimatedCost?.toString() || "0"), 0);
    const wasteByReason = wasteLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + parseFloat(log.quantity.toString());
      return acc;
    }, {});

    const wasteByCategory = wasteLogs.reduce((acc: Record<string, number>, log) => {
      const product = products.find(p => p.id === log.productId);
      const category = product?.category || "غير محدد";
      acc[category] = (acc[category] || 0) + parseFloat(log.estimatedCost?.toString() || "0");
      return acc;
    }, {});

    const averageWastePerDay = wasteLogs.length > 0 ? totalWaste / Math.max(1, (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const expiringProducts = products.filter(p => {
      const today = new Date();
      const expiry = new Date(p.expiryDate);
      const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining > 0 && daysRemaining <= 7;
    }).length;

    const expiredProducts = products.filter(p => {
      const today = new Date();
      const expiry = new Date(p.expiryDate);
      return expiry < today;
    }).length;

    return {
      totalWaste,
      averageWastePerDay,
      wasteByReason,
      wasteByCategory,
      expiringProducts,
      expiredProducts,
      activeAlerts: wasteAlerts.length,
    };
  }, [wasteLogs, wasteAlerts, products, dateRange]);

  // Prepare chart data
  const wasteReasonData = Object.entries(stats.wasteByReason).map(([reason, quantity]) => ({
    name: reason,
    value: quantity,
  }));

  const wasteCategoryData = Object.entries(stats.wasteByCategory).map(([category, cost]) => ({
    name: category,
    value: cost,
  }));

  const wasteTimelineData = useMemo(() => {
    const timeline: Record<string, number> = {};
    wasteLogs.forEach(log => {
      const date = log.wasteDate;
      timeline[date] = (timeline[date] || 0) + parseFloat(log.estimatedCost?.toString() || "0");
    });
    return Object.entries(timeline).map(([date, cost]) => ({
      date,
      cost,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [wasteLogs]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899"];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">لوحة معلومات الهدر والمواد</h2>
        <p className="text-gray-600 mt-1">تحليل شامل للهدر والمواد المنتهية الصلاحية</p>
      </div>

      {/* نطاق التاريخ */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">من</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">إلى</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <Button
          onClick={() => {
            setDateRange({
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
            });
          }}
          variant="outline"
        >
          آخر 30 يوم
        </Button>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">إجمالي الهدر</div>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {stats.totalWaste.toFixed(2)} ₪
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">متوسط الهدر اليومي</div>
              <div className="text-2xl font-bold text-orange-600 mt-2">
                {stats.averageWastePerDay.toFixed(2)} ₪
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">منتجات قريبة الانتهاء</div>
              <div className="text-2xl font-bold text-yellow-600 mt-2">
                {stats.expiringProducts}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">منتجات منتهية الصلاحية</div>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {stats.expiredProducts}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-2 gap-6">
        {/* رسم بياني للهدر بمرور الوقت */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">الهدر بمرور الوقت</h3>
          {wasteTimelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wasteTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  name="تكلفة الهدر (₪)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              لا توجد بيانات
            </div>
          )}
        </Card>

        {/* توزيع الهدر حسب الفئة */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">الهدر حسب الفئة</h3>
          {wasteCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(2)} ₪`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              لا توجد بيانات
            </div>
          )}
        </Card>

        {/* توزيع الهدر حسب السبب */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">أسباب الهدر</h3>
          {wasteReasonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteReasonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" name="الكمية" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              لا توجد بيانات
            </div>
          )}
        </Card>

        {/* التنبيهات النشطة */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">التنبيهات النشطة</h3>
          <div className="space-y-3">
            {wasteAlerts.length > 0 ? (
              wasteAlerts.slice(0, 5).map((alert) => {
                const product = products.find(p => p.id === alert.productId);
                return (
                  <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product?.name || "منتج غير معروف"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          نسبة الهدر: {alert.wastePercentage}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.alertDate}
                        </div>
                      </div>
                      <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {alert.status}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center py-8">
                لا توجد تنبيهات نشطة
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ملخص التوصيات */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">التوصيات والملاحظات</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {stats.totalWaste > 0 && (
            <div>
              • إجمالي الهدر في الفترة المحددة: <strong>{stats.totalWaste.toFixed(2)} ₪</strong>
            </div>
          )}
          {stats.averageWastePerDay > 0 && (
            <div>
              • متوسط الهدر اليومي: <strong>{stats.averageWastePerDay.toFixed(2)} ₪</strong>
            </div>
          )}
          {stats.expiringProducts > 0 && (
            <div>
              • يوجد <strong>{stats.expiringProducts}</strong> منتج قريب من انتهاء الصلاحية - يرجى الانتباه
            </div>
          )}
          {stats.expiredProducts > 0 && (
            <div>
              • يوجد <strong>{stats.expiredProducts}</strong> منتج منتهي الصلاحية - يجب إزالته فوراً
            </div>
          )}
          {stats.activeAlerts > 0 && (
            <div>
              • يوجد <strong>{stats.activeAlerts}</strong> تنبيه نشط يحتاج إلى اهتمام
            </div>
          )}
          {stats.totalWaste === 0 && stats.expiringProducts === 0 && stats.expiredProducts === 0 && (
            <div>
              • الوضع جيد! لا توجد مشاكل حالية في الهدر أو الصلاحيات
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
