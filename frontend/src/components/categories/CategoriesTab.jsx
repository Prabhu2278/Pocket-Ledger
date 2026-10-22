import React, { useState, useMemo } from 'react'
import { categoryApi } from '../../services/categoryApi'
import './CategoriesTab.css'

const PRESET_COLORS = [
  '#b42c45', // Crimson
  '#2563eb', // Royal Blue
  '#15803d', // Forest Emerald
  '#b45309', // Amber Brown
  '#0d7a6f', // Deep Teal
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#0284c7', // Sky Blue
  '#6366f1', // Indigo
  '#64748b', // Slate Gray
]

export function CategoriesTab({
  categories = [],
  onCategoriesChange,
  showToast,
  user,
}) {
  const [filterType, setFilterType] = useState('all') // 'all' | 'expense' | 'income'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState('expense')
  const [categoryColor, setCategoryColor] = useState('#2563eb')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation state
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (filterType === 'all') return true
      return c.type === filterType
    })
  }, [categories, filterType])

  const openAddModal = () => {
    setEditingCategory(null)
    setCategoryName('')
    setCategoryType(filterType === 'income' ? 'income' : 'expense')
    setCategoryColor(PRESET_COLORS[0])
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    if (cat.is_default) return
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setCategoryType(cat.type)
    setCategoryColor(cat.color || PRESET_COLORS[0])
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormError('')
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    setFormError('')
    const trimmed = categoryName.trim()
    if (!trimmed) {
      setFormError('Category name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, {
          name: trimmed,
          color: categoryColor,
        })
        showToast(`Category '${trimmed}' updated successfully.`)
      } else {
        await categoryApi.createCategory({
          name: trimmed,
          type: categoryType,
          color: categoryColor,
          icon: 'tag',
        })
        showToast(`Category '${trimmed}' added successfully.`)
      }
      closeModal()
      if (onCategoriesChange) onCategoriesChange()
    } catch (err) {
      setFormError(err.message || 'Failed to save category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      const res = await categoryApi.deleteCategory(categoryToDelete.id)
      if (res.status === 'deactivated') {
        showToast(res.message || `Category '${categoryToDelete.name}' was deactivated to preserve historical transactions.`)
      } else {
        showToast(res.message || `Category '${categoryToDelete.name}' deleted successfully.`)
      }
      setCategoryToDelete(null)
      if (onCategoriesChange) onCategoriesChange()
    } catch (err) {
      showToast(err.message || 'Failed to remove category.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="card categories-tab" id="panel-categories" role="tabpanel" aria-labelledby="tab-categories">
      {/* Header Row */}
      <div className="categories-header-row">
        <div>
          <h2>Category Management</h2>
          <p className="categories-subtitle">
            Manage system defaults and configure custom categories for your transactions, expenses, and income.
          </p>
        </div>
        <button
          type="button"
          className="btn-add-category"
          onClick={openAddModal}
          id="btn-add-category"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Filters Bar */}
      <div className="categories-actions-bar">
        <div className="category-filter-pills" role="tablist" aria-label="Filter category types">
          <button
            type="button"
            className={`category-filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
            id="cat-filter-all"
          >
            All Categories ({categories.length})
          </button>
          <button
            type="button"
            className={`category-filter-pill ${filterType === 'expense' ? 'active' : ''}`}
            onClick={() => setFilterType('expense')}
            id="cat-filter-expense"
          >
            Expenses ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            type="button"
            className={`category-filter-pill ${filterType === 'income' ? 'active' : ''}`}
            onClick={() => setFilterType('income')}
            id="cat-filter-income"
          >
            Income ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid" id="categories-list-grid">
        {filteredCategories.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--pl-text-secondary)', gridColumn: '1 / -1' }}>
            No categories found matching this filter. Click <b>Add Category</b> to create one.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isCustom = !cat.is_default
            return (
              <div key={`${cat.type}-${cat.id}`} className="category-card" id={`cat-card-${cat.id}`}>
                <div className="category-card-left">
                  <div
                    className="category-color-dot"
                    style={{ background: cat.color || '#64748b' }}
                    aria-hidden="true"
                  >
                    {cat.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="category-info">
                    <div className="category-name-row">
                      <span className="category-name" title={cat.name}>
                        {cat.name}
                      </span>
                    </div>
                    <div className="category-badges">
                      <span className={`badge-type ${cat.type}`}>
                        {cat.type}
                      </span>
                      <span className={`badge-source ${isCustom ? 'custom' : 'default'}`}>
                        {isCustom ? 'Custom' : 'Default'}
                      </span>
                    </div>
                  </div>
                </div>

                {isCustom && (
                  <div className="category-card-actions">
                    <button
                      type="button"
                      className="btn-category-icon"
                      title="Edit Category"
                      onClick={() => openEditModal(cat)}
                      aria-label={`Edit ${cat.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-category-icon delete"
                      title="Delete Category"
                      onClick={() => setCategoryToDelete(cat)}
                      aria-label={`Delete ${cat.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="category-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="category-modal-box">
            <h3 id="cat-modal-title" className="category-modal-title">
              {editingCategory ? 'Edit Category' : 'Create Custom Category'}
            </h3>
            <p className="category-modal-desc">
              {editingCategory
                ? 'Update your category display name and color badge.'
                : 'Add a new category that will be immediately available in your transaction and income forms.'}
            </p>

            {formError && (
              <div className="category-modal-err" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory}>
              <div className="category-form-field">
                <label htmlFor="cat-name-input">Category Name</label>
                <input
                  id="cat-name-input"
                  className="category-form-input"
                  type="text"
                  maxLength={50}
                  placeholder="e.g. Subscriptions, Freelance, Gym"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {!editingCategory && (
                <div className="category-form-field">
                  <label>Category Type</label>
                  <div className="category-type-toggle">
                    <button
                      type="button"
                      className={`category-type-btn ${categoryType === 'expense' ? 'active expense' : ''}`}
                      onClick={() => setCategoryType('expense')}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={`category-type-btn ${categoryType === 'income' ? 'active income' : ''}`}
                      onClick={() => setCategoryType('income')}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              <div className="category-form-field">
                <label>Badge Color</label>
                <div className="color-swatch-row" role="radiogroup" aria-label="Select color">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${categoryColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setCategoryColor(c)}
                      aria-label={`Color ${c}`}
                      aria-checked={categoryColor === c}
                    >
                      {categoryColor === c && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="category-modal-btns">
                <button
                  type="button"
                  className="ghost"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary"
                  disabled={isSubmitting}
                  id="btn-save-category"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      {categoryToDelete && (
        <div className="category-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cat-del-title" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setCategoryToDelete(null) }}>
          <div className="category-modal-box">
            <h3 id="cat-del-title" className="category-modal-title" style={{ color: 'var(--pl-color-danger)' }}>
              Remove Category?
            </h3>
            <p className="category-modal-desc">
              Are you sure you want to remove <b>"{categoryToDelete.name}"</b>?
              <br /><br />
              If you have existing transactions using this category, it will be <b>safely deactivated</b> so your historical records and reports remain intact.
            </p>

            <div className="category-modal-btns">
              <button
                type="button"
                className="ghost"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                style={{ background: 'var(--pl-color-danger)', borderColor: 'var(--pl-color-danger)' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-category"
              >
                {isDeleting ? 'Removing...' : 'Remove Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesTab
