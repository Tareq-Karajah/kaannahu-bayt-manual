// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Save, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const ingredientIcons: Record<string, string> = {
  "اللحمة": "🥩",
  "الجاج": "🍗",
  "الخضرة": "🥬",
  "الخبز": "🍞",
};

const ingredientColors: Record<string, string> = {
  "اللحمة": "border-r-red-500",
  "الجاج": "border-r-amber-500",
  "الخضرة": "border-r-green-500",
  "الخبز": "border-r-orange-500",
};

export default function WasteTracking() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<Record<number, { quantity: string; notes: string }>>({});
  const [saved, setSaved] = useState(false);

  const { data: ingredientsList, isLoading: ingredientsLoading } = trpc.ingredients.list.useQuery();
  const { data: existingEntries, isLoading: entriesLoading } = trpc.wasteEntries.getByDate.useQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );

  const saveMutation = trpc.wasteEntries.saveEntries.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ البيانات بنجاح");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء الحفظ: " + err.message);
    },
  });

  // Load existing entries when date changes
  useEffect(() => {
    if (existingEntries && existingEntries.length > 0) {
      const loaded: Record<number, { quantity: string; notes: string }> = {};
      existingEntries.forEach((entry) => {
        loaded[entry.ingredientId] = {
          quantity: entry.quantityInput,
          notes: entry.notes || "",
        };
      });
      setEntries(loaded);
    } else if (ingredientsList) {
      const empty: Record<number, { quantity: string; notes: string }> = {};
      ingredientsList.forEach((ing) => {
        empty[ing.id] = { quantity: "", notes: "" };
      });
      setEntries(empty);
    }
  }, [existingEntries, ingredientsList, selectedDate]);

  const handleSave = () => {
    if (!ingredientsList) return;
    const entryList = ingredientsList.map((ing) => ({
      ingredientId: ing.id,
      quantityInput: entries[ing.id]?.quantity || "0",
      notes: entries[ing.id]?.notes || "",
    }));
    saveMutation.mutate({ date: selectedDate, entries: entryList });
  };

  if (ingredientsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تتبع الهدر اليومي</h1>
        <p className="text-muted-foreground">إدخال الكميات اليومية من المكونات الأساسية (بالكيلوغرام)</p>
      </div>

      {/* Date selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-brand-maroon" />
            <Label htmlFor="date" className="font-bold">التاريخ:</Label>
            <Input
              id="date"
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
        </CardContent>
      </Card>

      {/* Ingredient entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ingredientsList?.map((ing) => (
          <Card key={ing.id} className={`border-r-4 ${ingredientColors[ing.nameAr] || "border-r-gray-300"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{ingredientIcons[ing.nameAr] || "📦"}</span>
                {ing.nameAr}
                <span className="text-sm font-normal text-muted-foreground">({ing.unit})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor={`qty-${ing.id}`}>الكمية الداخلة</Label>
                <Input
                  id={`qty-${ing.id}`}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={entries[ing.id]?.quantity || ""}
                  onChange={(e) =>
                    setEntries((prev) => ({
                      ...prev,
                      [ing.id]: { ...prev[ing.id], quantity: e.target.value, notes: prev[ing.id]?.notes || "" },
                    }))
                  }
                  className="text-lg font-bold"
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor={`notes-${ing.id}`}>ملاحظات</Label>
                <Textarea
                  id={`notes-${ing.id}`}
                  placeholder="ملاحظات إضافية..."
                  value={entries[ing.id]?.notes || ""}
                  onChange={(e) =>
                    setEntries((prev) => ({
                      ...prev,
                      [ing.id]: { ...prev[ing.id], quantity: prev[ing.id]?.quantity || "", notes: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-center">
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
              {saveMutation.isPending ? "جارٍ الحفظ..." : "حفظ البيانات"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
