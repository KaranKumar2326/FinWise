import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { TrendingUp, Plus, RefreshCw } from 'lucide-react';
import Button from './Button';
import { CURRENCIES } from '../lib/types';

interface Investment {
  id: string;
  type: string;
  amount: number;
}

const investmentTypes = ['Savings', 'Stocks', 'Mutual Funds', 'Bonds', 'Crypto'];
const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

export default function InvestmentOverview({ currency }: { currency: string }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showNewInvestment, setShowNewInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    type: 'Savings',
    amount: '',
  });

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleAddInvestment = () => {
    if (!newInvestment.amount) return;

    const investment: Investment = {
      id: crypto.randomUUID(),
      type: newInvestment.type,
      amount: parseFloat(newInvestment.amount),
    };

    setInvestments([...investments, investment]);
    setNewInvestment({ type: 'Savings', amount: '' });
    setShowNewInvestment(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your investment overview? This will remove all investments.')) {
      setInvestments([]);
      setShowNewInvestment(false);
      setNewInvestment({ type: 'Savings', amount: '' });
    }
  };

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);

  const chartData = {
    labels: investments.map(inv => inv.type),
    datasets: [
      {
        data: investments.map(inv => inv.amount),
        backgroundColor: chartColors.slice(0, investments.length),
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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Investment Overview</h3>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="p-2"
          title="Reset Investments"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-bold text-blue-600">{currencySymbol}{totalInvestment.toLocaleString()}</p>
        <p className="text-sm text-gray-500">Total Portfolio Value</p>
      </div>

      {investments.length > 0 && (
        <div className="h-64 mb-6">
          <Pie data={chartData} options={chartOptions} />
        </div>
      )}

      {!showNewInvestment ? (
        <Button
          onClick={() => setShowNewInvestment(true)}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Investment</span>
        </Button>
      ) : (
        <div className="space-y-4">
          <select
            value={newInvestment.type}
            onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {investmentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
            <input
              type="number"
              placeholder="Amount"
              value={newInvestment.amount}
              onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleAddInvestment} className="flex-1">
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNewInvestment(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {investments.length > 0 && (
        <div className="mt-6 space-y-2">
          {investments.map((investment) => (
            <div
              key={investment.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium">{investment.type}</span>
              <span className="font-bold">{currencySymbol}{investment.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}