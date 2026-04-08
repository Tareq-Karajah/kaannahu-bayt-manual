import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const ingredientLabels: Record<string, string> = {
  meat: "لحمة",
  chicken: "دجاج",
  vegetables: "خضرة",
  bread: "خبز",
};

const ingredientColors: Record<string, string> = {
  meat: "bg-red-100 text-red-800 border-red-200",
  chicken: "bg-amber-100 text-amber-800 border-amber-200",
  vegetables: "bg-green-100 text-green-800 border-green-200",
  bread: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function MenuPage() {
  const { data: categories, isLoading: catLoading } = trpc.menu.getCategories.useQuery();
  const { data: allItems, isLoading: itemsLoading } = trpc.menu.getItemsWithCategory.useQuery();

  if (catLoading || itemsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const defaultCat = categories?.[0]?.id?.toString() || "1";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">قائمة الطعام</h1>
        <p className="text-muted-foreground">جميع أصناف مطعم كانه بيت</p>
      </div>

      <Tabs defaultValue={defaultCat} dir="rtl">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-brand-cream p-1">
          {categories?.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id.toString()}
              className="data-[state=active]:bg-brand-maroon data-[state=active]:text-white px-4 py-2 rounded-lg"
            >
              {cat.nameAr}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories?.map((cat) => {
          const items = allItems?.filter((item) => item.categoryId === cat.id) || [];
          return (
            <TabsContent key={cat.id} value={cat.id.toString()} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow border-r-4 border-r-brand-maroon/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{item.nameAr}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {item.mainIngredient && (
                              <Badge variant="outline" className={`text-xs ${ingredientColors[item.mainIngredient] || ""}`}>
                                {ingredientLabels[item.mainIngredient] || item.mainIngredient}
                              </Badge>
                            )}
                            {item.ingredientWeightGrams && (
                              <span className="text-xs text-muted-foreground">
                                {item.ingredientWeightGrams} غم
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="text-xl font-bold text-brand-maroon">
                            {parseFloat(item.price).toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground mr-1">₪</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
