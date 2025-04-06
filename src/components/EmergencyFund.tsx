import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, RefreshCw } from 'lucide-react';
import { EmergencyFund as EmergencyFundType } from '../lib/types';
import Button from './Button';
import { CURRENCIES } from '../lib/types';


export default function EmergencyFund({ currency }: { currency: string }) {
  const [fund, setFund] = useState<EmergencyFundType>({
    currentAmount: 5000,
    targetAmount: 15000,
    monthlyContribution: 500,
    lastContribution: new Date().toISOString(),
  });

  // Ensure the currencySymbol is correctly derived
  // const currencySymbol = CURRENCIES.find(c => c.code.toUpperCase() === currency.toUpperCase())?.symbol || '$';
  // const currencySymbol = CURRENCIES.find(c => c.code === (currency?.toUpperCase() || 'USD'))?.symbol || '$';
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
 console.log(CURRENCIES) ;

  // Debugging logs to check the issue
  console.log("Currency Code Passed:", currency);
  console.log("Resolved Currency Symbol:", currencySymbol);

  const progress = (fund.currentAmount / fund.targetAmount) * 100;
  const monthsToGoal = Math.ceil((fund.targetAmount - fund.currentAmount) / fund.monthlyContribution);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your emergency fund?')) {
      setFund({
        currentAmount: 0,
        targetAmount: 15000,
        monthlyContribution: 500,
        lastContribution: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Emergency Fund</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="p-2"
            title="Reset Fund"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Wallet className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Goal</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-600 text-sm">Current Amount</span>
            <div className="text-xl font-bold">{currencySymbol}{fund.currentAmount.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-600 text-sm">Target Amount</span>
            <div className="text-xl font-bold">{currencySymbol}{fund.targetAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-600 text-sm">Monthly Contribution</span>
              <div className="text-xl font-bold">{currencySymbol}{fund.monthlyContribution}</div>
            </div>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {monthsToGoal} months until target is reached
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => {
              setFund(prev => ({
                ...prev,
                currentAmount: prev.currentAmount + prev.monthlyContribution,
                lastContribution: new Date().toISOString()
              }));
            }}
          >
            Add Monthly Contribution
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              const newTarget = window.prompt('Enter new target amount:', fund.targetAmount.toString());
              if (newTarget && !isNaN(Number(newTarget))) {
                setFund(prev => ({ ...prev, targetAmount: Number(newTarget) }));
              }
            }}
          >
            Adjust Target Amount
          </Button>
        </div>
      </div>
    </div>
  );
}
