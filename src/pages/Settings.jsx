import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';

function Settings() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'budgets') {
      fetchBudgets();
    }
  }, [activeTab, currentMonth]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      console.log(response,'response')
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`/budgets/month/${currentMonth}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      setLoading(true);
      if (editingCategory) {
        await axios.put(`/categories/${editingCategory._id}`, categoryForm);
      } else {
        await axios.post('/categories', categoryForm);
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', color: '#3B82F6' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = async (categoryId, amount) => {
    try {
      await axios.post('/budgets', {
        month: currentMonth,
        category: categoryId,
        amount: parseFloat(amount) || 0
      });
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await axios.delete(`/categories/${categoryId}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. It might have associated expenses.');
      }
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color
    });
    setShowCategoryForm(true);
  };

  const cancelEdit = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', color: '#3B82F6' });
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your categories and budgets</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['categories', 'budgets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Category
            </button>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                </div>
                
                <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !categoryForm.name.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories yet. Create your first category to get started.
              </div>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Monthly Budgets - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
            </h2>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Set Budgets</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No categories found. Create categories first to set budgets.
                </div>
              ) : (
                categories.map((category) => {
                  const existingBudget = budgets.find(b => b.category._id === category._id);
                  
                  return (
                    <div key={category._id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          defaultValue={existingBudget?.amount || ''}
                          onBlur={(e) => handleBudgetUpdate(category._id, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Budget Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Set realistic budgets based on your spending history</li>
                    <li>Update budgets at the beginning of each month</li>
                    <li>Leave budgets blank for categories you don't want to track</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;