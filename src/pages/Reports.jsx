import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function Reports() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('table'); // 'table' or 'chart'

  useEffect(() => {
    fetchReportData();
  }, [currentMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/reports/monthly/${currentMonth}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monthly Reports</h1>
          <p className="text-gray-600">Analyze your spending vs budgets</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="table">Table View</option>
            <option value="chart">Chart View</option>
          </select>
          
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Budget</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(reportData.summary.totalBudget)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h3>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(reportData.summary.totalSpent)}
              </p>
            </div>
            
            <div className={`bg-white rounded-lg shadow-md p-6 ${
              reportData.summary.isOverallOverBudget ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
            }`}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
              <p className={`text-2xl font-bold ${
                reportData.summary.isOverallOverBudget ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(reportData.summary.totalRemaining)}
              </p>
              {reportData.summary.isOverallOverBudget && (
                <span className="text-sm text-red-600 font-medium">Over Budget</span>
              )}
            </div>
          </div>

          {/* Chart View */}
          {view === 'chart' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Spending vs Budget - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData.reportData.map(item => ({
                      name: item.category.name,
                      budget: item.budget,
                      spent: item.spent,
                      remaining: item.remaining
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                    <Bar dataKey="spent" fill="#F59E0B" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table View */}
          {view === 'table' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Category Details - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.reportData.map((item) => (
                      <tr key={item.category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: item.category.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {item.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.spent)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.isOverBudget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(item.remaining)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.isOverBudget ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Over Budget
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Within Budget
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.expenses.slice(0, 10).map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: expense.category.color }}
                          />
                          <span className="text-sm text-gray-900">
                            {expense.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {reportData.expenses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No expenses found for this month.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">No expenses or budgets found for the selected month.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;