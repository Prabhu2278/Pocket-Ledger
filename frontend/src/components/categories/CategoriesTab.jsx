import React, { useState, useMemo } from 'react'
import { categoryApi } from '../../services/categoryApi'
import { getUniqueCategoryColor, getCategoryColor } from '../../constants/categories'
import '../../styles/components/CategoriesTab.css'

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
    setCategoryColor(getUniqueCategoryColor(categories))
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    if (cat.is_default) return
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setCategoryType(cat.type)
    setCategoryColor(cat.color || getUniqueCategoryColor(categories))
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
            Manage and configure custom categories for your transactions, expenses, and income.
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
            return (
              <div key={`${cat.type}-${cat.id}`} className="category-card" id={`cat-card-${cat.id}`}>
                <div className="category-card-left">
                  <div
                    className="category-color-dot"
                    style={{ background: cat.color || getCategoryColor(cat.name) }}
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
                    </div>
                  </div>
                </div>

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
    </div>
  )
}

export default CategoriesTab
