import React, { useState, useEffect } from 'react';
import { PieChart as PieChartIcon, DollarSign, RefreshCw } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Expense } from '../lib/types';
import Button from './Button';
import { CURRENCIES } from '../lib/types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const categories = [
  'Housing', 'Transportation', 'Food', 'Utilities', 
  'Healthcare', 'Entertainment', 'Shopping', 'Other'
];

const chartColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
];

export default function ExpenseTracker({ currency }: { currency: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Other',
    description: '',
  });

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString(),
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ amount: '', category: 'Other', description: '' });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your expense tracker? This will remove all recorded expenses.')) {
      setExpenses([]);
      setNewExpense({ amount: '', category: 'Other', description: '' });
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: chartColors.slice(0, Object.keys(categoryTotals).length),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Expense Tracker</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="p-2"
          title="Reset Expenses"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Expense */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Expense</h3>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAddExpense} className="w-full">
              Add Expense
            </Button>
          </div>
        </div>

        {/* Expense Summary with Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-4">Expense Distribution</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="text-xl font-bold">{currencySymbol}{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="h-64 relative">
              {Object.keys(categoryTotals).length > 0 ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No expenses recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Recent Expenses</h3>
        <div className="space-y-2">
          {expenses.slice(-5).reverse().map((expense) => (
            <div key={expense.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="font-medium">{expense.description || expense.category}</span>
                <span className="text-sm text-gray-500 block">
                  {new Date(expense.date).toLocaleDateString()}
                </span>
              </div>
              <span className="font-bold text-red-600">-{currencySymbol}{expense.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}