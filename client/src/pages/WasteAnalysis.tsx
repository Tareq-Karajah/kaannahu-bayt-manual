// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, TrendingDown, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { useState, useMemo } from "react";

function getWeekDates(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return {
    start: sunday.toISOString().split("T")[0],
    end: saturday.toISOString().split("T")[0],
  };
}

const ingredientIcons: Record<string, string> = {
  "اللحمة": "🥩",
  "الجاج": "🍗",
  "الخضرة": "🥬",
  "الخبز": "🍞",
};

export default function WasteAnalysis() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const [searched, setSearched] = useState(false);

  const { data: report, isLoading, refetch } = trpc.analysis.getWasteReport.useQuery(
    { weekStartDate: weekDates.start, weekEndDate: weekDates.end },
    { enabled: searched }
  );

  const handleSearch = () => {
    setSearched(true);
    refetch();
  };

  const getWasteLevel = (percentage: number) => {
    if (percentage <= 5) return { label: "ممتاز", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
    if (percentage <= 15) return { label: "مقبول", color: "text-amber-600", bg: "bg-amber-100", icon: AlertTriangle };
    return { label: "مرتفع", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
  };

  const totalWaste = report?.report?.reduce((sum, r) => sum + r.wasteKg, 0) || 0;
  const totalInput = report?.report?.reduce((sum, r) => sum + r.totalInputKg, 0) || 0;
  const totalConsumed = report?.report?.reduce((sum, r) => sum + r.totalConsumedKg, 0) || 0;
  const overallWastePercentage = totalInput > 0 ? (totalWaste / totalInput) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تحليل الهدر</h1>
        <p className="text-muted-foreground">مقارنة الكميات الداخلة بالمبيعات لحساب الهدر من كل صنف</p>
      </div>

      {/* Week selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-brand-maroon" />
              <Label htmlFor="analysis-date" className="font-bold">اختر تاريخ من الأسبوع:</Label>
              <Input
                id="analysis-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSearched(false);
                }}
                className="w-auto"
                dir="ltr"
              />
            </div>
            <Badge variant="outline" className="text-sm bg-brand-gold/10 border-brand-gold">
              {weekDates.start} → {weekDates.end}
            </Badge>
            <Button onClick={handleSearch} className="bg-brand-maroon hover:bg-brand-maroon/90 text-white">
              <Search className="ml-2 h-4 w-4" />
              عرض التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && searched && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {searched && report && report.report && report.report.length > 0 && (
        <>
          {/* Overall summary */}
          <Card className="border-2 border-brand-maroon/20">
            <CardHeader>
              <CardTitle className="text-xl">ملخص الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-700">{totalInput.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">كغ إجمالي الداخل</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-700">{totalConsumed.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">كغ مستهلك (مبيعات)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-700">{totalWaste.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">كغ هدر</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-2xl font-bold text-amber-700">{overallWastePercentage.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">نسبة الهدر الإجمالية</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-ingredient breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.report.map((item) => {
              const level = getWasteLevel(item.wastePercentage);
              const LevelIcon = level.icon;
              const consumedPercent = item.totalInputKg > 0
                ? Math.min((item.totalConsumedKg / item.totalInputKg) * 100, 100)
                : 0;

              return (
                <Card key={item.ingredientId} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-2xl">{ingredientIcons[item.ingredientNameAr] || "📦"}</span>
                        {item.ingredientNameAr}
                      </CardTitle>
                      <Badge className={`${level.bg} ${level.color} border-0`}>
                        <LevelIcon className="ml-1 h-3 w-3" />
                        {level.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الكمية الداخلة</span>
                        <span className="font-bold">{item.totalInputKg.toFixed(1)} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>المستهلك (من المبيعات)</span>
                        <span className="font-bold text-green-600">{item.totalConsumedKg.toFixed(1)} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الهدر</span>
                        <span className={`font-bold ${level.color}`}>{item.wasteKg.toFixed(1)} {item.unit}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>نسبة الاستهلاك</span>
                        <span>{consumedPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={consumedPercent} className="h-2" />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>نسبة الهدر: {item.wastePercentage}%</span>
                      <span>عدد الأصناف المباعة: {item.totalItemsSold}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {searched && report && (!report.report || report.report.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold">لا توجد بيانات</h3>
            <p className="text-muted-foreground mt-2">
              لم يتم العثور على بيانات هدر أو مبيعات لهذا الأسبوع.
              <br />
              تأكد من إدخال بيانات تتبع الهدر اليومي وتقرير المبيعات أولاً.
            </p>
          </CardContent>
        </Card>
      )}

      {!searched && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold">اختر أسبوعاً لعرض التقرير</h3>
            <p className="text-muted-foreground mt-2">
              حدد تاريخاً ثم اضغط "عرض التقرير" لمقارنة الكميات الداخلة بالمبيعات
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
