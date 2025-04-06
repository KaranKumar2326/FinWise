import React, { useState } from 'react';
import { Target, Plus, RefreshCw } from 'lucide-react';
import Button from './Button';
import { SavingsGoal as SavingsGoalType } from '../lib/types';
import { CURRENCIES } from '../lib/types';

export default function SavingsGoal({ currency }: { currency: string }) {
  const [goals, setGoals] = useState<SavingsGoalType[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoalType>>({
    name: '',
    targetAmount: '',
    currentAmount: 0,
    frequency: 'monthly',
    contributionAmount: '',
  });

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.contributionAmount) return;

    const goal: SavingsGoalType = {
      id: crypto.randomUUID(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount as string),
      currentAmount: 0,
      frequency: newGoal.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
      contributionAmount: parseFloat(newGoal.contributionAmount as string),
      startDate: new Date().toISOString(),
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: 0,
      frequency: 'monthly',
      contributionAmount: '',
    });
    setShowNewGoal(false);
  };

  const handleContribution = (goalId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          currentAmount: goal.currentAmount + goal.contributionAmount
        };
      }
      return goal;
    }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all savings goals? This will remove all your goals and progress.')) {
      setGoals([]);
      setShowNewGoal(false);
      setNewGoal({
        name: '',
        targetAmount: '',
        currentAmount: 0,
        frequency: 'monthly',
        contributionAmount: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Savings Goals</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="p-2"
          title="Reset Goals"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{goal.name}</h3>
                  <p className="text-sm text-gray-600">
                    {currencySymbol}{goal.contributionAmount} {goal.frequency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{currencySymbol}{goal.currentAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">of {currencySymbol}{goal.targetAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <Button
                onClick={() => handleContribution(goal.id)}
                className="w-full mt-2"
              >
                Add Contribution
              </Button>
            </div>
          );
        })}

        {!showNewGoal ? (
          <Button
            onClick={() => setShowNewGoal(true)}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Goal</span>
          </Button>
        ) : (
          <div className="border rounded-lg p-4 space-y-4">
            <input
              type="text"
              placeholder="Goal Name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Target Amount"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Contribution Amount"
              value={newGoal.contributionAmount}
              onChange={(e) => setNewGoal({ ...newGoal, contributionAmount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <select
              value={newGoal.frequency}
              onChange={(e) => setNewGoal({ ...newGoal, frequency: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="flex space-x-2">
              <Button onClick={handleAddGoal} className="flex-1">
                Save Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewGoal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}