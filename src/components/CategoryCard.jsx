import React from 'react';

function CategoryCard({ category, spent, budget, remaining }) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4" style={{ borderLeftColor: category.color }}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{category.name}</h3>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 ml-2" 
          style={{ backgroundColor: category.color }}
        />
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Spent: ${spent.toFixed(2)}</span>
          <span>Budget: ${budget.toFixed(2)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${
          isOverBudget ? 'text-red-600' : 'text-green-600'
        }`}>
          {isOverBudget ? `Over by $${Math.abs(remaining).toFixed(2)}` : `Left: $${remaining.toFixed(2)}`}
        </span>
        
        {isOverBudget && (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
            OVER BUDGET
          </span>
        )}
      </div>
    </div>
  );
}

export default CategoryCard;