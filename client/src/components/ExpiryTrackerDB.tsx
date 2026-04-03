"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
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

export default function ExpiryTrackerDB() {
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
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
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

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.expiryDate) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (editingId) {
      // تحديث منتج موجود
      setProducts(
        products.map((p) =>
          p.id === editingId
            ? { ...formData, id: editingId }
            : p
        )
      );
      setEditingId(null);
    } else {
      // إضافة منتج جديد
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
    }

    // إعادة تعيين النموذج
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
    setShowForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = filterCategory === "الكل"
    ? products
    : products.filter((p) => p.category === filterCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const daysA = getDaysRemaining(a.expiryDate);
    const daysB = getDaysRemaining(b.expiryDate);
    return daysA - daysB;
  });

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
            setShowForm(!showForm);
            setEditingId(null);
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
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          {showForm ? "إلغاء" : "إضافة منتج"}
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600">إجمالي المنتجات</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-gray-600">سليمة</p>
          <p className="text-2xl font-bold text-green-900">{stats.healthy}</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-gray-600">تنبيهات</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.warning}</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-gray-600">منتهية</p>
          <p className="text-2xl font-bold text-red-900">{stats.expired}</p>
        </Card>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <h3 className="text-lg font-bold mb-6 text-green-900">
            {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل اسم المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوحدة
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="كغ، لتر، باقة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان التخزين
                </label>
                <select
                  value={formData.storageLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageLocation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر مكان التخزين</option>
                  {STORAGE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أضف أي ملاحظات..."
                />
              </div>
            </div>

            <Button
              onClick={handleAddProduct}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2"
            >
              {editingId ? "تحديث المنتج" : "إضافة المنتج"}
            </Button>
          </div>
        </Card>
      )}

      {/* فلتر الفئات */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setFilterCategory("الكل")}
          variant={filterCategory === "الكل" ? "default" : "outline"}
          className={filterCategory === "الكل" ? "bg-green-600 text-white" : ""}
        >
          الكل
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            variant={filterCategory === cat ? "default" : "outline"}
            className={filterCategory === cat ? "bg-green-600 text-white" : ""}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* جدول المنتجات */}
      {sortedProducts.length > 0 ? (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 border-b-2 border-green-300">
              <tr>
                <th className="px-4 py-2 text-right">المنتج</th>
                <th className="px-4 py-2 text-right">الفئة</th>
                <th className="px-4 py-2 text-right">الكمية</th>
                <th className="px-4 py-2 text-right">تاريخ الانتهاء</th>
                <th className="px-4 py-2 text-right">الأيام المتبقية</th>
                <th className="px-4 py-2 text-right">الحالة</th>
                <th className="px-4 py-2 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const daysRemaining = getDaysRemaining(product.expiryDate);
                const status = getProductStatus(daysRemaining);
                const statusColor =
                  status === "سليم"
                    ? "text-green-700 bg-green-50"
                    : status === "تنبيه"
                    ? "text-yellow-700 bg-yellow-50"
                    : status === "تنبيه عاجل"
                    ? "text-orange-700 bg-orange-50"
                    : "text-red-700 bg-red-50";

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{product.name}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(product.expiryDate).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${statusColor}`}>
                        {daysRemaining > 0 ? `${daysRemaining} يوم` : "منتهي"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {status === "سليم" && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">سليم</span>
                          </>
                        )}
                        {status === "تنبيه" && (
                          <>
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-700">تنبيه</span>
                          </>
                        )}
                        {(status === "تنبيه عاجل" || status === "منتهي الصلاحية" || status === "ينتهي اليوم") && (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700">{status}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">لا توجد منتجات حتى الآن</p>
          <p className="text-sm text-gray-400 mt-2">
            اضغط على "إضافة منتج" لبدء تتبع صلاحية المنتجات
          </p>
        </Card>
      )}
    </div>
  );
}
