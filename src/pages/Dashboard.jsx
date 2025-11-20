import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import CategoryCard from '../components/CategoryCard';
import ExpenseForm from '../components/ExpenseForm';
import FloatingActionButton from '../components/FloatingActionButton';

function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, budgetsRes, expensesRes] = await Promise.all([
        axios.get('/categories'),
        axios.get(`/budgets/month/${currentMonth}`),
        axios.get(`/expenses/month/${currentMonth}`)
      ]);

      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCategorySpending = (categoryId) => {
    return expenses
      .filter(expense => expense.category._id === categoryId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryBudget = (categoryId) => {
    const budget = budgets.find(b => b.category._id === categoryId);
    return budget ? budget.amount : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
        </h1>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first category in Settings.</p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map(category => {
            const spent = getCategorySpending(category._id);
            const budget = getCategoryBudget(category._id);
            const remaining = budget - spent;
            
            return (
              <CategoryCard
                key={category._id}
                category={category}
                spent={spent}
                budget={budget}
                remaining={remaining}
              />
            );
          })}
        </div>
      )}

      <FloatingActionButton onClick={() => setShowExpenseForm(true)} />

      {showExpenseForm && (
        <ExpenseForm
          categories={categories}
          onClose={() => setShowExpenseForm(false)}
          onSave={(success, message) => {
            setShowExpenseForm(false);
            if (success) {
              fetchDashboardData();
              showToast(message, 'success');
            } else {
              showToast(message, 'error');
            }
          }}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Dashboard;