"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Plus, Search, Edit, Trash2, Loader2, X, Save, Eye, EyeOff, Upload } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category: string | null
  cover_image: string | null
  file_url: string | null
  is_active: boolean
  is_published: boolean
  created_at: string
  sales_count?: number
}

interface ProductForm {
  title: string
  description: string
  price: string
  category: string
  cover_image: string
  file_url: string
  is_active: boolean
}

const emptyForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  category: "كورسات أونلاين",
  cover_image: "",
  file_url: "",
  is_active: true,
}

const categories = ["كورسات أونلاين", "كتب إلكترونية", "برامج"]

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (categoryFilter) params.set("category", categoryFilter)
      params.set("limit", "50")

      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      if (json.success) {
        setProducts(json.data.products)
      }
    } catch {
      console.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => { fetchProducts() }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, categoryFilter, fetchProducts])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setCoverFile(null)
    setCoverPreview(null)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      title: product.title,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "كورسات أونلاين",
      cover_image: product.cover_image || "",
      file_url: product.file_url || "",
      is_active: product.is_active ?? true,
    })
    setCoverFile(null)
    setCoverPreview(product.cover_image || null)
    setShowModal(true)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.price.trim()) return
    setIsSaving(true)

    try {
      let coverImageUrl = form.cover_image

      // Upload cover image if a new file was selected
      if (coverFile) {
        const formData = new FormData()
        formData.append("file", coverFile)
        formData.append("bucket", "products")

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        const uploadJson = await uploadRes.json()
        if (uploadJson.success) {
          coverImageUrl = uploadJson.data.url
        }
      }

      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category,
        cover_image: coverImageUrl || null,
        file_url: form.file_url.trim() || null,
        is_active: form.is_active,
      }

      let res: Response
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }

      const json = await res.json()
      if (json.success) {
        setShowModal(false)
        fetchProducts()
      }
    } catch {
      console.error("Failed to save product")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        setDeleteConfirm(null)
        fetchProducts()
      }
    } catch {
      console.error("Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
        <button
          onClick={openAddModal}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex items-center w-full sm:w-64 bg-secondary rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-secondary border border-border text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد منتجات بعد.</div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">المنتج</th>
                  <th className="px-6 py-4 font-medium">التصنيف</th>
                  <th className="px-6 py-4 font-medium">السعر</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-border flex-shrink-0">
                          <Image src={product.cover_image || "/course.png"} alt={product.title} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold block">{product.title}</span>
                          {product.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{product.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category || "—"}</td>
                    <td className="px-6 py-4 font-bold">{Number(product.price).toLocaleString()} د.ع</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        product.is_active !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {product.is_active !== false ? 'نشط' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">عنوان المنتج *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: كورس تطوير الويب الشامل"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف تفصيلي للمنتج..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">السعر (د.ع) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="25000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">التصنيف</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium mb-2">صورة الغلاف</label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-border flex-shrink-0">
                      <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "اختر صورة"}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
                {!coverFile && (
                  <input
                    type="url"
                    value={form.cover_image}
                    onChange={(e) => { setForm(prev => ({ ...prev, cover_image: e.target.value })); setCoverPreview(e.target.value || null) }}
                    placeholder="أو ألصق رابط الصورة..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors mt-2"
                    dir="ltr"
                  />
                )}
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium mb-2">رابط الملف / المنتج</label>
                <input
                  type="url"
                  value={form.file_url}
                  onChange={(e) => setForm(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="رابط تحميل المنتج الرقمي..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  dir="ltr"
                />
              </div>

              {/* Status */}
              <button
                onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  form.is_active
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border bg-secondary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {form.is_active ? <Eye className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                  <div className="text-right">
                    <p className="font-bold text-sm">{form.is_active ? "نشط - ظاهر للعملاء" : "مسودة - غير ظاهر"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">يمكنك تغيير حالة المنتج لاحقاً</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors relative ${
                  form.is_active ? "bg-emerald-500" : "bg-border"
                }`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                    form.is_active ? "right-1" : "right-6"
                  }`} />
                </div>
              </button>
            </div>

            <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !form.title.trim() || !form.price.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-bold text-lg">حذف المنتج</h3>
              <p className="text-sm text-muted-foreground mt-2">هل أنت متأكد من حذف هذا المنتج؟ لن يكون ظاهراً للعملاء بعد الحذف.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
