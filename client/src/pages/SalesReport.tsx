// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Save, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

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

export default function SalesReport() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const [salesData, setSalesData] = useState<Record<number, { qty: number; revenue: string }>>({});
  const [saved, setSaved] = useState(false);

  const { data: menuItemsData, isLoading: menuLoading } = trpc.menu.getItemsWithCategory.useQuery();
  const { data: existingSales, isLoading: salesLoading } = trpc.sales.getByWeek.useQuery(
    { weekStartDate: weekDates.start, weekEndDate: weekDates.end },
    { enabled: !!weekDates.start }
  );

  const saveMutation = trpc.sales.saveSales.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ تقرير المبيعات بنجاح");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      toast.error("حدث خطأ: " + err.message);
    },
  });

  // Load existing sales
  useEffect(() => {
    if (existingSales && existingSales.length > 0) {
      const loaded: Record<number, { qty: number; revenue: string }> = {};
      existingSales.forEach((s) => {
        loaded[s.menuItemId] = {
          qty: s.quantitySold,
          revenue: s.totalRevenue || "0",
        };
      });
      setSalesData(loaded);
    } else {
      setSalesData({});
    }
  }, [existingSales, selectedDate]);

  const handleSave = () => {
    if (!menuItemsData) return;
    const items = Object.entries(salesData)
      .filter(([_, val]) => val.qty > 0)
      .map(([id, val]) => ({
        menuItemId: parseInt(id),
        quantitySold: val.qty,
        totalRevenue: val.revenue,
      }));
    saveMutation.mutate({
      weekStartDate: weekDates.start,
      weekEndDate: weekDates.end,
      items,
    });
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    if (!menuItemsData) return {};
    const grouped: Record<string, typeof menuItemsData> = {};
    menuItemsData.forEach((item) => {
      const cat = item.categoryNameAr;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [menuItemsData]);

  if (menuLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تقرير المبيعات الأسبوعي</h1>
        <p className="text-muted-foreground">إدخال عدد الوحدات المباعة لكل صنف خلال الأسبوع</p>
      </div>

      {/* Week selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-brand-maroon" />
              <Label htmlFor="week-date" className="font-bold">اختر تاريخ من الأسبوع:</Label>
              <Input
                id="week-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSaved(false);
                }}
                className="w-auto"
                dir="ltr"
              />
            </div>
            <Badge variant="outline" className="text-sm bg-brand-gold/10 border-brand-gold">
              الأسبوع: {weekDates.start} إلى {weekDates.end}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sales entries by category */}
      {Object.entries(groupedItems).map(([catName, items]) => (
        <Card key={catName}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-brand-maroon">{catName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-[200px]">
                    <span className="font-medium">{item.nameAr}</span>
                    <span className="text-sm text-muted-foreground mr-2">
                      ({parseFloat(item.price).toFixed(0)} ₪)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">الكمية المباعة:</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={salesData[item.id]?.qty || ""}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 0;
                        const price = parseFloat(item.price);
                        setSalesData((prev) => ({
                          ...prev,
                          [item.id]: {
                            qty,
                            revenue: (qty * price).toFixed(2),
                          },
                        }));
                      }}
                      className="w-24 text-center"
                      dir="ltr"
                    />
                  </div>
                  {salesData[item.id]?.qty > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      الإيراد: {salesData[item.id]?.revenue} ₪
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save button */}
      <div className="flex justify-center pb-8">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          size="lg"
          className="px-8 bg-brand-maroon hover:bg-brand-maroon/90 text-white"
        >
          {saved ? (
            <>
              <CheckCircle2 className="ml-2 h-5 w-5" />
              تم الحفظ
            </>
          ) : (
            <>
              <Save className="ml-2 h-5 w-5" />
              {saveMutation.isPending ? "جارٍ الحفظ..." : "حفظ التقرير"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
