import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdvancedWasteCalculator() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculations, setCalculations] = useState<any[]>([]);

  const [products] = useState<Array<{
    id: number;
    name: string;
  }>>([
    { id: 1, name: "دقيق" },
    { id: 2, name: "سكر" },
    { id: 3, name: "زيت" },
    { id: 4, name: "بيض" },
  ]);

  const calculateWasteMutation = trpc.wasteCalc.calculate.useMutation();
  const getCalculationsQuery = trpc.wasteCalc.getByDate.useQuery({
    userId: 1,
    date: new Date(selectedDate),
  });

  const handleCalculateWaste = async (productId: number) => {
    try {
      const result = await calculateWasteMutation.mutateAsync({
        userId: 1,
        productId,
        date: new Date(selectedDate),
      });

      if (result) {
        getCalculationsQuery.refetch();
      }
    } catch (error) {
      console.error("خطأ في حساب الهدر:", error);
    }
  };

  const handleCalculateAll = async () => {
    try {
      for (const product of products) {
        await calculateWasteMutation.mutateAsync({
          userId: 1,
          productId: product.id,
          date: new Date(selectedDate),
        });
      }
      getCalculationsQuery.refetch();
    } catch (error) {
      console.error("خطأ في حساب الهدر:", error);
    }
  };

  const getWasteSeverity = (percentage: number) => {
    if (percentage > 20) return { level: "حرج", color: "text-red-600", bg: "bg-red-50", icon: "🔴" };
    if (percentage > 10) return { level: "عالي", color: "text-orange-600", bg: "bg-orange-50", icon: "🟠" };
    if (percentage > 5) return { level: "متوسط", color: "text-yellow-600", bg: "bg-yellow-50", icon: "🟡" };
    return { level: "طبيعي", color: "text-green-600", bg: "bg-green-50", icon: "🟢" };
  };

  const totalWaste = getCalculationsQuery.data?.reduce((sum, calc) => sum + parseFloat(calc.wasteQuantity.toString()), 0) || 0;
  const totalConsumed = getCalculationsQuery.data?.reduce((sum, calc) => sum + parseFloat(calc.quantityConsumed.toString()), 0) || 0;
  const totalWithdrawn = getCalculationsQuery.data?.reduce((sum, calc) => sum + parseFloat(calc.quantityWithdrawn.toString()), 0) || 0;
  const averageWastePercentage = totalWithdrawn > 0 ? (totalWaste / totalWithdrawn) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">حاسبة الهدر المتقدمة</h1>
        <p className="text-gray-600">حساب الهدر بناءً على الكميات المسحوبة والمستهلكة</p>
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

      {/* Calculate Buttons */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">حساب الهدر</h2>
        <p className="text-sm text-gray-600">اختر المنتج لحساب الهدر أو احسب الكل</p>

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <Button
              key={product.id}
              onClick={() => handleCalculateWaste(product.id)}
              variant="outline"
              className="justify-start"
              disabled={calculateWasteMutation.isPending}
            >
              {calculateWasteMutation.isPending ? "جاري الحساب..." : `حساب هدر ${product.name}`}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleCalculateAll}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={calculateWasteMutation.isPending}
        >
          <BarChart3 className="w-4 h-4 ml-2" />
          {calculateWasteMutation.isPending ? "جاري الحساب..." : "حساب الهدر لجميع المنتجات"}
        </Button>
      </Card>

      {/* Summary Statistics */}
      {getCalculationsQuery.data && getCalculationsQuery.data.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">إجمالي المسحوب</p>
              <p className="text-2xl font-bold text-blue-600">{totalWithdrawn.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي المستهلك</p>
              <p className="text-2xl font-bold text-green-600">{totalConsumed.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي الهدر</p>
              <p className="text-2xl font-bold text-red-600">{totalWaste.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">نسبة الهدر</p>
              <p className="text-2xl font-bold text-orange-600">{averageWastePercentage.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Calculations List */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">تفاصيل الحسابات</h2>

        {getCalculationsQuery.isLoading ? (
          <p className="text-gray-500">جاري التحميل...</p>
        ) : getCalculationsQuery.data && getCalculationsQuery.data.length > 0 ? (
          <div className="space-y-3">
            {getCalculationsQuery.data.map((calc) => {
              const product = products.find((p) => p.id === calc.productId);
              const severity = getWasteSeverity(parseFloat(calc.wastePercentage.toString()));

              return (
                <Card key={calc.id} className={`p-4 border-l-4 ${severity.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{severity.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{product?.name}</h3>
                          <p className={`text-sm font-semibold ${severity.color}`}>{severity.level}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-600">المسحوب</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {calc.quantityWithdrawn}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">المستهلك</p>
                          <p className="text-lg font-semibold text-green-600">
                            {calc.quantityConsumed}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">الهدر</p>
                          <p className="text-lg font-semibold text-red-600">
                            {calc.wasteQuantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">نسبة الهدر</p>
                          <p className={`text-lg font-semibold ${severity.color}`}>
                            {calc.wastePercentage}%
                          </p>
                        </div>
                      </div>

                      {calc.notes && (
                        <p className="text-sm text-gray-600 mt-2">ملاحظات: {calc.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            لم يتم حساب أي هدر لهذا اليوم. تأكد من إدخال الكميات اليومية والمبيعات أولاً.
          </p>
        )}
      </Card>

      {/* Recommendations */}
      {getCalculationsQuery.data && getCalculationsQuery.data.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">التوصيات</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {averageWastePercentage > 15 && (
                  <li>• نسبة الهدر مرتفعة جداً. يرجى مراجعة عمليات التخزين والإعداد.</li>
                )}
                {averageWastePercentage > 10 && averageWastePercentage <= 15 && (
                  <li>• نسبة الهدر أعلى من المتوسط. يرجى اتخاذ إجراءات لتقليلها.</li>
                )}
                {averageWastePercentage <= 5 && (
                  <li>• ✓ نسبة الهدر ممتازة. استمر في الحفاظ على هذا المستوى.</li>
                )}
                <li>• تأكد من تحديث الكميات اليومية والمبيعات بدقة.</li>
                <li>• راجع مكونات الأطباق للتأكد من صحتها.</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
