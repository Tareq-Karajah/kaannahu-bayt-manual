// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, TrendingDown, BarChart3, ClipboardList } from "lucide-react";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663060900137/4FXHMff2KsFGpkCZvSdSwN/logo_150ef256.jpg";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: categories } = trpc.menu.getCategories.useQuery();
  const { data: allItems } = trpc.menu.getItems.useQuery({});

  const totalItems = allItems?.length || 0;
  const totalCategories = categories?.length || 0;

  const quickActions = [
    {
      title: "قائمة الطعام",
      description: "عرض وإدارة أصناف المنيو",
      icon: UtensilsCrossed,
      path: "/menu",
      color: "bg-brand-maroon/10 text-brand-maroon",
      iconBg: "bg-brand-maroon",
    },
    {
      title: "تتبع الهدر اليومي",
      description: "إدخال الكميات اليومية من المكونات",
      icon: ClipboardList,
      path: "/waste-tracking",
      color: "bg-brand-green/10 text-brand-green",
      iconBg: "bg-brand-green",
    },
    {
      title: "تقرير المبيعات",
      description: "إدخال تقرير المبيعات الأسبوعي",
      icon: BarChart3,
      path: "/sales-report",
      color: "bg-brand-gold/10 text-brand-brown",
      iconBg: "bg-brand-gold",
    },
    {
      title: "تحليل الهدر",
      description: "مقارنة الكميات الداخلة بالمبيعات",
      icon: TrendingDown,
      path: "/waste-analysis",
      color: "bg-destructive/10 text-destructive",
      iconBg: "bg-destructive",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with logo */}
      <div className="flex flex-col items-center gap-4 py-6">
        <img
          src={LOGO_URL}
          alt="كانه بيت"
          className="h-28 w-28 rounded-2xl object-contain shadow-lg border-2 border-brand-gold/30"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">كانه بيت</h1>
          <p className="text-muted-foreground mt-1">نظام إدارة المطعم وتتبع الهدر</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-brand-maroon/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-maroon">{totalItems}</p>
            <p className="text-sm text-muted-foreground mt-1">صنف في المنيو</p>
          </CardContent>
        </Card>
        <Card className="border-brand-green/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-green">{totalCategories}</p>
            <p className="text-sm text-muted-foreground mt-1">تصنيف</p>
          </CardContent>
        </Card>
        <Card className="border-brand-gold/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-brown">4</p>
            <p className="text-sm text-muted-foreground mt-1">مكونات رئيسية</p>
          </CardContent>
        </Card>
        <Card className="border-brand-gold/20">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-brown">7</p>
            <p className="text-sm text-muted-foreground mt-1">أيام/أسبوع</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-transparent hover:border-brand-gold/30"
              onClick={() => setLocation(action.path)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${action.iconBg} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
