import React, { useState, useMemo } from "react";
import { AlertCircle, CheckCircle, Clock, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  storageLocation: string;
  notes: string;
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

export default function ExpiryTracker() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "صوص كأنه بيت",
      category: "صوصات",
      quantity: 52.5,
      unit: "لتر",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      storageLocation: "الثلاجة الرئيسية",
      notes: "معدل الاستهلاك 1.75 لتر يوميًا",
    },
    {
      id: "2",
      name: "صوص الفينجريت",
      category: "صوصات",
      quantity: 15,
      unit: "لتر",
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      storageLocation: "الثلاجة الرئيسية",
      notes: "معدل الاستهلاك 0.5 لتر يوميًا",
    },
    {
      id: "3",
      name: "لحمة البرغر",
      category: "لحوم",
      quantity: 150,
      unit: "كغ",
      expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      storageLocation: "الفريزر",
      notes: "معدل الاستهلاك 5 كغ يوميًا",
    },
    {
      id: "4",
      name: "خس أمريكي",
      category: "خضروات",
      quantity: 10,
      unit: "باقة",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      storageLocation: "الثلاجة الرئيسية",
      notes: "يحتاج إلى تجديد قريب",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
    storageLocation: "",
    notes: "",
  });

  const [filterCategory, setFilterCategory] = useState("الكل");
  const [sortBy, setSortBy] = useState<"expiry" | "quantity">("expiry");

  // حساب حالة المنتج بناءً على تاريخ الانتهاء
  const getProductStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return { status: "expired", label: "منتهي الصلاحية", color: "text-red-600" };
    } else if (daysUntilExpiry === 0) {
      return { status: "today", label: "ينتهي اليوم", color: "text-red-500" };
    } else if (daysUntilExpiry <= 3) {
      return { status: "warning", label: `${daysUntilExpiry} أيام`, color: "text-orange-600" };
    } else if (daysUntilExpiry <= 7) {
      return { status: "caution", label: `${daysUntilExpiry} أيام`, color: "text-yellow-600" };
    } else {
      return { status: "ok", label: `${daysUntilExpiry} يوم`, color: "text-green-600" };
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (filterCategory !== "الكل") {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "expiry") {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      } else {
        return a.quantity - b.quantity;
      }
    });
  }, [products, filterCategory, sortBy]);

  const criticalProducts = useMemo(() => {
    return products.filter((p) => {
      const status = getProductStatus(p.expiryDate);
      return status.status === "expired" || status.status === "today" || status.status === "warning";
    });
  }, [products]);

  const handleAddProduct = () => {
    setFormData({
      id: "",
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      expiryDate: "",
      storageLocation: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSaveProduct = () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.expiryDate ||
      !formData.storageLocation
    ) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (editingId) {
      setProducts(
        products.map((p) =>
          p.id === editingId ? { ...formData, id: editingId } : p
        )
      );
    } else {
      setProducts([
        ...products,
        { ...formData, id: Date.now().toString() },
      ]);
    }

    setShowForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* رأس القسم */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          📦 تتبع صلاحية المنتجات
        </h2>
        <p className="text-amber-700">
          نظام متقدم لمراقبة تواريخ انتهاء الصلاحية والمخزون
        </p>
      </div>

      {/* تنبيهات حرجة */}
      {criticalProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">
                ⚠️ منتجات تحتاج اهتمام فوري ({criticalProducts.length})
              </h3>
              <div className="space-y-1">
                {criticalProducts.map((product) => {
                  const status = getProductStatus(product.expiryDate);
                  return (
                    <p key={product.id} className="text-sm text-red-800">
                      • <strong>{product.name}</strong> - {status.label}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* أزرار التحكم والفلاتر */}
      <div className="flex flex-col gap-4">
        <Button
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج جديد
        </Button>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>الكل</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "expiry" | "quantity")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="expiry">تاريخ الانتهاء</option>
              <option value="quantity">الكمية</option>
            </select>
          </div>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-bold mb-4 text-blue-900">
            {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المنتج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر فئة</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الكمية
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوحدة
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="لتر / كغ / باقة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الانتهاء *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مكان التخزين *
              </label>
              <select
                value={formData.storageLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storageLocation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر مكان</option>
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ملاحظات إضافية"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSaveProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              حفظ
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white flex-1"
            >
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      {/* جدول المنتجات */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                المنتج
              </th>
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                الفئة
              </th>
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                الكمية
              </th>
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                تاريخ الانتهاء
              </th>
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                الحالة
              </th>
              <th className="px-4 py-3 text-right font-bold text-gray-700">
                مكان التخزين
              </th>
              <th className="px-4 py-3 text-center font-bold text-gray-700">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  لا توجد منتجات
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map((product) => {
                const status = getProductStatus(product.expiryDate);
                return (
                  <tr
                    key={product.id}
                    className={`border-b ${
                      status.status === "expired"
                        ? "bg-red-50"
                        : status.status === "today"
                          ? "bg-red-100"
                          : status.status === "warning"
                            ? "bg-orange-50"
                            : status.status === "caution"
                              ? "bg-yellow-50"
                              : "bg-white"
                    } hover:bg-opacity-75 transition`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{product.category}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(product.expiryDate).toLocaleDateString("ar-SA")}
                    </td>
                    <td className={`px-4 py-3 font-bold ${status.color}`}>
                      <div className="flex items-center gap-1">
                        {status.status === "ok" && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {(status.status === "warning" ||
                          status.status === "caution") && (
                          <Clock className="w-4 h-4" />
                        )}
                        {(status.status === "expired" ||
                          status.status === "today") && (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {status.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.storageLocation}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {products.filter((p) => getProductStatus(p.expiryDate).status === "ok").length}
            </div>
            <p className="text-sm text-green-700 mt-1">منتجات سليمة</p>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {products.filter((p) => getProductStatus(p.expiryDate).status === "caution").length}
            </div>
            <p className="text-sm text-yellow-700 mt-1">تنبيهات</p>
          </div>
        </Card>

        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {products.filter((p) => getProductStatus(p.expiryDate).status === "warning").length}
            </div>
            <p className="text-sm text-orange-700 mt-1">تحذيرات</p>
          </div>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {products.filter(
                (p) =>
                  getProductStatus(p.expiryDate).status === "expired" ||
                  getProductStatus(p.expiryDate).status === "today"
              ).length}
            </div>
            <p className="text-sm text-red-700 mt-1">منتهية الصلاحية</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
