import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  storageLocation?: string;
  notes?: string;
  status: string;
}

const CATEGORIES = [
  "صوصات",
  "خضروات",
  "لحوم",
  "دجاج",
  "أرز",
  "مشروبات",
  "أجبان",
  "أخرى",
];

const STORAGE_LOCATIONS = [
  "الثلاجة الرئيسية",
  "الفريزر",
  "المخزن البارد",
  "الرف العلوي",
  "الرف السفلي",
];

export default function ExpiryTrackerDBNew() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
    storageLocation: "",
    notes: "",
  });

  // Fetch products from database
  const { data: products = [], isLoading, refetch } = trpc.products.getAll.useQuery();
  
  // Mutations
  const saveProductMutation = trpc.products.save.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // حساب عدد الأيام المتبقية
  const getDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // تحديد حالة المنتج
  const getProductStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return "منتهي الصلاحية";
    if (daysRemaining === 0) return "ينتهي اليوم";
    if (daysRemaining <= 3) return "تنبيه عاجل";
    if (daysRemaining <= 7) return "تنبيه";
    return "سليم";
  };

  // الإحصائيات
  const stats = {
    total: products.length,
    healthy: products.filter((p) => getProductStatus(getDaysRemaining(p.expiryDate)) === "سليم").length,
    warning: products.filter((p) => {
      const status = getProductStatus(getDaysRemaining(p.expiryDate));
      return status === "تنبيه" || status === "تنبيه عاجل";
    }).length,
    expired: products.filter((p) => {
      const status = getProductStatus(getDaysRemaining(p.expiryDate));
      return status === "منتهي الصلاحية" || status === "ينتهي اليوم";
    }).length,
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      expiryDate: "",
      storageLocation: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.expiryDate) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (editingId) {
      // تحديث منتج موجود
      await updateProductMutation.mutateAsync({
        id: editingId,
        quantity: formData.quantity,
        status: getProductStatus(getDaysRemaining(formData.expiryDate)),
        notes: formData.notes,
      });
    } else {
      // إضافة منتج جديد
      await saveProductMutation.mutateAsync({
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      expiryDate: product.expiryDate,
      storageLocation: product.storageLocation || "",
      notes: product.notes || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteProductMutation.mutateAsync({ id });
    }
  };

  const filteredProducts = filterCategory === "الكل"
    ? products
    : products.filter((p) => p.category === filterCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const daysA = getDaysRemaining(a.expiryDate);
    const daysB = getDaysRemaining(b.expiryDate);
    return daysA - daysB;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-900">تتبع صلاحية المنتجات</h2>
          <p className="text-sm text-gray-600 mt-1">إدارة صلاحية المنتجات والمخزون</p>
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-sm text-gray-600">إجمالي المنتجات</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-gray-600">سليم</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.healthy}</div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-gray-600">تنبيهات</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">{stats.warning}</div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-sm text-gray-600">منتهي الصلاحية</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.expired}</div>
        </Card>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <Card className="p-6 bg-gray-50 border-2 border-green-200">
          <h3 className="text-lg font-bold mb-4 text-green-900">
            {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المنتج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="مثال: صوص كأنه بيت"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفئة *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر الفئة</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الكمية *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوحدة *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="مثال: لتر، كغ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الصلاحية *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مكان التخزين
              </label>
              <select
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر المكان</option>
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
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
              onClick={handleAddProduct}
              disabled={saveProductMutation.isPending || updateProductMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingId ? "تحديث" : "إضافة"}
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

      {/* فلتر الفئات */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setFilterCategory("الكل")}
          variant={filterCategory === "الكل" ? "default" : "outline"}
          className={filterCategory === "الكل" ? "bg-green-600" : ""}
        >
          الكل
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            variant={filterCategory === cat ? "default" : "outline"}
            className={filterCategory === cat ? "bg-green-600" : ""}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* قائمة المنتجات */}
      <div className="space-y-3">
        {sortedProducts.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            لا توجد منتجات بعد
          </Card>
        ) : (
          sortedProducts.map((product) => {
            const daysRemaining = getDaysRemaining(product.expiryDate);
            const status = getProductStatus(daysRemaining);
            const statusColors = {
              "سليم": "bg-green-50 border-green-200",
              "تنبيه": "bg-yellow-50 border-yellow-200",
              "تنبيه عاجل": "bg-orange-50 border-orange-200",
              "منتهي الصلاحية": "bg-red-50 border-red-200",
              "ينتهي اليوم": "bg-red-50 border-red-200",
            };
            const statusIcons = {
              "سليم": <CheckCircle className="w-5 h-5 text-green-600" />,
              "تنبيه": <Clock className="w-5 h-5 text-yellow-600" />,
              "تنبيه عاجل": <AlertCircle className="w-5 h-5 text-orange-600" />,
              "منتهي الصلاحية": <AlertCircle className="w-5 h-5 text-red-600" />,
              "ينتهي اليوم": <AlertCircle className="w-5 h-5 text-red-600" />,
            };

            return (
              <Card
                key={product.id}
                className={`p-4 border-2 ${statusColors[status as keyof typeof statusColors] || "bg-gray-50"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {statusIcons[status as keyof typeof statusIcons]}
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                      <div>
                        <span className="font-medium">الكمية:</span> {product.quantity} {product.unit}
                      </div>
                      <div>
                        <span className="font-medium">الصلاحية:</span> {product.expiryDate}
                      </div>
                      <div>
                        <span className="font-medium">الأيام المتبقية:</span>{" "}
                        <span className="font-bold">{daysRemaining}</span>
                      </div>
                      <div>
                        <span className="font-medium">الحالة:</span> {status}
                      </div>
                    </div>
                    {product.storageLocation && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">مكان التخزين:</span> {product.storageLocation}
                      </div>
                    )}
                    {product.notes && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">ملاحظات:</span> {product.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEditProduct(product)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      disabled={deleteProductMutation.isPending}
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
    </div>
  );
}
