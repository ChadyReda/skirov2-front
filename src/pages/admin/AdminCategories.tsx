import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi, productApi } from '@/services'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { Plus, Edit2, Trash2, X, Image } from 'lucide-react'
import type { Category } from '@/types'

export default function AdminCategories() {
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const qc = useQueryClient()

  const { data: cats, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn:  categoryApi.listAll,
  })

  const deleteM = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['categories-all'] })
      toast('Category deactivated', 'info')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  const openEdit   = (c: Category) => { setEditing(c); setModal('edit') }
  const openCreate = ()             => { setEditing(null); setModal('create') }
  const closeModal = ()             => { setModal(null); setEditing(null) }
  const afterSave  = ()             => {
    qc.invalidateQueries({ queryKey: ['categories-all'] })
    closeModal()
  }

  if (isLoading) return <Spinner full />

  return (
    <div className="p-4 md:p-8 bg-stone-900 text-white min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-normal">
          Categories
        </h1>
        <button onClick={openCreate} className="btn btn-primary gap-2">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b border-stone-800">
            <tr>
              {['Image', 'Name', 'Slug', 'Parent', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium uppercase tracking-widest text-stone-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {cats?.map((cat) => (
              <tr key={cat.id || cat._id} className="hover:bg-stone-800/50">
                <td className="px-4 py-3">
                  <div className="w-12 h-12 bg-stone-800 overflow-hidden">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={16} className="text-stone-600" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-stone-400 font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-4 py-3 text-stone-400">
                  {cat.parent?.name || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${cat.isActive ? 'badge-green' : 'badge-stone'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-stone-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deactivate "${cat.name}"?`)) {
                          deleteM.mutate(cat.id || cat._id)
                        }
                      }}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cats?.length && (
          <div className="p-10 text-center text-stone-500 text-sm">
            No categories found.
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <CategoryModal
          categories={cats || []}
          cat={editing}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
    </div>
  )
}

// ── Category Modal ────────────────────────────────
function CategoryModal({
  categories, cat, onClose, onSaved,
}: {
  categories: Category[]
  cat:        Category | null
  onClose:    () => void
  onSaved:    () => void
}) {
  const isEdit = !!cat

  const [form, setForm] = useState({
    name:        cat?.name        || '',
    description: cat?.description || '',
    imageUrl:    cat?.imageUrl    || '',
    parent:      (cat?.parent as any)?._id || (cat?.parent as any)?.id || '',
    sortOrder:   cat?.sortOrder   || 0,
    isActive:    cat?.isActive    !== false,
  })

  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState<string>(cat?.imageUrl || '')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('images', files[0])
      const res = await productApi.uploadImages(fd)
      const url = res.urls[0]
      setForm((p) => ({ ...p, imageUrl: url }))
      setPreview(url)
      toast('Image uploaded', 'success')
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setUploading(false)
    }
  }

  const m = useMutation({
    mutationFn: () => {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        imageUrl:    form.imageUrl || undefined,
        parentId:    form.parent   || null,
        sortOrder:   Number(form.sortOrder),
        isActive:    form.isActive,
      }
      return isEdit
        ? categoryApi.update(cat!.id || cat!._id, payload)
        : categoryApi.create(payload)
    },
    onSuccess: () => {
      toast(isEdit ? 'Category updated' : 'Category created', 'success')
      onSaved()
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end animate-fade-in">
      <div className="bg-stone-900 text-white w-full max-w-md h-screen flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="text-xl">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose}>
            <X size={18} className="text-stone-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Name */}
          <div>
            <label className="label">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-dark"
              placeholder="e.g. Dresses"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="input-dark resize-none"
              placeholder="Optional"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Category Image</label>

            {/* Preview */}
            {preview && (
              <div className="relative w-full h-36 bg-stone-800 border-stone-700 overflow-hidden mb-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setPreview('')
                    setForm((p) => ({ ...p, imageUrl: '' }))
                  }}
                  className="absolute top-2 right-2 bg-black/50 p-1 text-red-500 hover:bg-black/70 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Upload button */}
            <label className="btn btn-outline-white btn-sm cursor-pointer gap-2 inline-flex">
              <Image size={14} />
              {uploading ? 'Uploading…' : preview ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-stone-500 mt-1">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>

          {/* Parent category */}
          <div>
            <label className="label">Parent Category</label>
            <select
              value={form.parent}
              onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
              className="input-dark appearance-none"
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => (c.id || c._id) !== (cat?.id || cat?._id))
                .map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                className="input-dark"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-brand"
                />
                Active
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              onClick={() => m.mutate()}
              disabled={m.isPending || !form.name.trim()}
              className="btn btn-primary flex-1"
            >
              {m.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}