import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi, categoryApi } from '@/services'
import { fmt } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Pager } from '@/components/ui/Pagination'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { Plus, Search, Edit2, Trash2, X, Image } from 'lucide-react'
import type { Product, Category, ProductVariant } from '@/types'

export default function AdminProducts() {
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modal,     setModal]     = useState<'create' | 'edit' | null>(null)
  const [editing,   setEditing]   = useState<Product | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey:        ['admin-products', page, catFilter, search],
    queryFn:         () => productApi.list({ page, limit: 15, search: search || undefined, category: catFilter || undefined }),
    placeholderData: (p) => p,
  })

  const { data: cats } = useQuery({
    queryKey: ['categories-all'],
    queryFn:  categoryApi.listAll,
  })

  const deleteM = useMutation({
    mutationFn: productApi.delete,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast('Product deactivated', 'info')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  const openEdit   = (p: Product) => { setEditing(p); setModal('edit') }
  const openCreate = ()            => { setEditing(null); setModal('create') }
  const closeModal = ()            => { setModal(null); setEditing(null) }
  const afterSave  = ()            => {
    qc.invalidateQueries({ queryKey: ['admin-products'] })
    closeModal()
  }

  return (
    <div className="p-4 md:p-8 bg-stone-900 text-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-normal">
            Products
          </h1>
          {data && <p className="text-stone-400 text-sm mt-1">{data.pagination.total} total</p>}
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2">
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 border border-stone-700 bg-transparent px-3 flex-1 min-w-[200px]">
          <Search size={15} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products…"
            className="flex-1 py-2.5 text-sm outline-none bg-transparent text-white"
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-stone-400" /></button>}
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
          className="input bg-stone-800 border-stone-700 py-2.5 text-sm w-44 appearance-none"
        >
          <option value="">All Categories</option>
          {cats?.map((c) => (
            <option key={c.id || c._id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? <Spinner full /> : (
        <>
          <div className="bg-stone-900 border border-stone-800 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-stone-800">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-widest text-stone-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {data?.data.map((p) => {
                  const stock = p.variants.reduce((s, v) => s + v.stock, 0)
                  return (
                    <tr key={p.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-stone-800 flex-shrink-0 overflow-hidden">
                            {p.images[0] && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs text-stone-400">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-400">{p.category.name}</td>
                      <td className="px-4 py-3 font-medium text-white">
                        {fmt(p.price)}
                        {p.compareAtPrice && <span className="text-xs text-stone-500 line-through ml-1">{fmt(p.compareAtPrice)}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${stock === 0 ? 'text-red-500' : stock <= 5 ? 'text-amber-500' : 'text-stone-300'}`}>
                          {stock}
                        </span>
                        <span className="text-xs text-stone-500 ml-1">units</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${p.isActive ? 'badge-green' : 'badge-stone'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && <span className="badge badge-brand ml-1">Featured</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-2 text-stone-400 hover:text-white transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Deactivate "${p.name}"?`)) deleteM.mutate(p.id) }}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!data?.data.length && <div className="p-10 text-center text-stone-500 text-sm">No products found.</div>}
          </div>
          {data?.pagination && <Pager p={data.pagination} onChange={setPage} />}
        </>
      )}

      {modal && (
        <ProductModal
          categories={cats || []}
          product={editing}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
    </div>
  )
}

function ProductModal({
  categories, product, onClose, onSaved,
}: {
  categories: Category[]
  product:    Product | null
  onClose:    () => void
  onSaved:    () => void
}) {
  const isEdit = !!product

  const [form, setForm] = useState({
    name:             product?.name             || '',
    sku:              product?.sku              || '',
    shortDescription: product?.shortDescription || '',
    description:      product?.description      || '',
    categoryId:       product?.category?._id     || '',
    brand:            product?.brand            || '',
    price:          product?.price            || '',
    compareAtPrice: product?.compareAtPrice   || '',
    isFeatured:       product?.isFeatured       || false,
    isNewArrival:     product?.isNewArrival      ?? true,
    isActive:         product?.isActive         !== false,
    tags:             (product?.tags || []).join(', '),
  })

  const [variants,  setVariants]  = useState<ProductVariant[]>(
    product?.variants?.length
      ? product.variants
      : [{ sku: '', size: '', color: '', colorHex: '', stock: 0, additionalPrice: 0 }]
  )
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.map((i) => i.url) || []
  )
  const [uploading, setUploading] = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())             e.name             = 'Product name is required'
    if (!form.sku.trim())              e.sku              = 'SKU is required'
    if (!form.categoryId)              e.categoryId       = 'Category is required'
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required'
    if (!form.description.trim())      e.description      = 'Description is required'
    if (!form.price || Number(form.price) <= 0) e.price   = 'Valid price is required'

    const filledVariants = variants.filter((v) => v.sku?.trim())
    if (filledVariants.length === 0)   e.variants         = 'At least one variant with SKU is required'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const saveM = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix the form errors')

      const filledVariants = variants.filter((v) => v.sku?.trim())

      const payload = {
        name:             form.name.trim(),
        sku:              form.sku.trim(),
        shortDescription: form.shortDescription.trim(),
        description:      form.description.trim(),
        categoryId:       form.categoryId,
        brand:            form.brand.trim() || undefined,
        price:            Number(form.price),
        compareAtPrice:   form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        isFeatured:       form.isFeatured,
        isNewArrival:     form.isNewArrival,
        isActive:         form.isActive,
        tags:             form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        variants:         filledVariants.map((v) => ({
          sku:             v.sku.trim(),
          size:            v.size  || undefined,
          color:           v.color || undefined,
          colorHex:        v.colorHex || undefined,
          stock:           Number(v.stock) || 0,
          additionalPrice: Number(v.additionalPrice) || 0,
        })),
        images: imageUrls.map((url, i) => ({
          url,
          alt:       form.name,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      }

      if (isEdit) return productApi.update(product!.id, payload)
      return productApi.create(payload)
    },
    onSuccess: () => {
      toast(isEdit ? 'Product updated ✓' : 'Product created ✓', 'success')
      onSaved()
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      ;[...files].forEach((f) => fd.append('images', f))
      const res = await productApi.uploadImages(fd)
      setImageUrls((prev) => [...prev, ...res.urls])
      toast(`${res.urls.length} image(s) uploaded`, 'success')
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setUploading(false)
    }
  }

  const addVariant = () =>
    setVariants((p) => [...p, { sku: '', size: '', color: '', colorHex: '', stock: 0, additionalPrice: 0 }])

  const rmVariant = (i: number) =>
    setVariants((p) => p.filter((_, idx) => idx !== i))

  const setVar = (i: number, k: keyof ProductVariant, v: string | number) =>
    setVariants((p) => p.map((vv, idx) => idx === i ? { ...vv, [k]: v } : vv))

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end animate-fade-in">
      <div className="bg-stone-900 text-white w-full max-w-2xl h-screen overflow-y-auto animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800 sticky top-0 bg-stone-900 z-10">
          <h2 className="text-xl font-medium">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-white" /></button>
        </div>

        <div className="px-6 py-6 space-y-5">

          {/* Name + SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={`input-dark ${errors.name ? 'input-err' : ''}`}
                placeholder="e.g. Silk Charmeuse Dress"
              />
              {errors.name && <p className="ferror">{errors.name}</p>}
            </div>
            <div>
              <label className="label">SKU *</label>
              <input
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                className={`input-dark ${errors.sku ? 'input-err' : ''}`}
                placeholder="e.g. DRS-001"
              />
              {errors.sku && <p className="ferror">{errors.sku}</p>}
            </div>
            <div>
              <label className="label">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                className="input-dark"
                placeholder="e.g. SKIRO Studio"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className={`input-dark appearance-none ${errors.categoryId ? 'input-err' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="ferror">{errors.categoryId}</p>}
          </div>

          {/* Short description */}
          <div>
            <label className="label">Short Description *</label>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
              className={`input-dark ${errors.shortDescription ? 'input-err' : ''}`}
              placeholder="One line summary shown on product cards"
            />
            {errors.shortDescription && <p className="ferror">{errors.shortDescription}</p>}
          </div>

          {/* Full description */}
          <div>
            <label className="label">Full Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className={`input-dark resize-none ${errors.description ? 'input-err' : ''}`}
              placeholder="Detailed product description"
            />
            {errors.description && <p className="ferror">{errors.description}</p>}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (MAD) *</label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.price || ''}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className={`input-dark ${errors.price ? 'input-err' : ''}`}
                placeholder="e.g. 299"
              />
              {errors.price && <p className="ferror">{errors.price}</p>}
            </div>
            <div>
              <label className="label">Compare At Price (MAD)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={form.compareAtPrice || ''}
                onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                className="input-dark"
                placeholder="e.g. 399"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="summer, casual, linen"
              className="input-dark"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            {([['isFeatured', 'Featured'], ['isNewArrival', 'New Arrival'], ['isActive', 'Active']] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form[k] as boolean}
                  onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.checked }))}
                  className="w-4 h-4 accent-brand"
                />
                {l}
              </label>
            ))}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="label mb-0">Variants *</label>
                <p className="text-xs text-stone-400 mt-0.5">Each variant needs a unique SKU</p>
              </div>
              <button onClick={addVariant} className="btn btn-ghost btn-sm gap-1 text-xs">
                <Plus size={12} /> Add Variant
              </button>
            </div>
            {errors.variants && <p className="ferror mb-2">{errors.variants}</p>}
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 text-[10px] uppercase tracking-widest text-stone-400 px-1">
                <span className="col-span-2">SKU *</span>
                <span>Size</span>
                <span>Color</span>
                <span>Stock</span>
                <span></span>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 items-center">
                  <input
                    placeholder="SKU-001"
                    value={v.sku}
                    onChange={(e) => setVar(i, 'sku', e.target.value)}
                    className="input-dark text-xs py-2 col-span-2"
                  />
                  <input
                    placeholder="M"
                    value={v.size || ''}
                    onChange={(e) => setVar(i, 'size', e.target.value)}
                    className="input-dark text-xs py-2"
                  />
                  <input
                    placeholder="Red"
                    value={v.color || ''}
                    onChange={(e) => setVar(i, 'color', e.target.value)}
                    className="input-dark text-xs py-2"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={v.stock}
                    onChange={(e) => setVar(i, 'stock', Number(e.target.value))}
                    className="input-dark text-xs py-2"
                  />
                  <button
                    onClick={() => rmVariant(i)}
                    className="text-stone-400 hover:text-red-500 flex justify-center"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label mb-3">Images</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-24 bg-stone-800 border border-stone-700 overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-stone-900/70 text-white text-[9px] text-center py-0.5">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => setImageUrls((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/50 p-0.5 text-red-500 opacity-0 group-hover:opacity-100 rounded-full"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            <label className="btn btn-outline-white btn-sm cursor-pointer gap-2 inline-flex">
              <Image size={14} />
              {uploading ? 'Uploading…' : 'Upload Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-stone-400 mt-1">First image will be the primary image</p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 px-6 pb-4 border-t border-stone-800 sticky bottom-0 bg-stone-900 z-10">
            <button onClick={onClose} className="btn btn-outline-white flex-1">Cancel</button>
            <button
              onClick={() => saveM.mutate()}
              disabled={saveM.isPending}
              className="btn btn-primary flex-1"
            >
              {saveM.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}