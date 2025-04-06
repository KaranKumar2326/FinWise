export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  contributionAmount: number;
  startDate: string;
}

export interface MonthlyAnalysis {
  month: string;
  totalExpenses: number;
  categorySummary: Record<string, number>;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'unusual_transaction' | 'budget_exceeded' | 'savings_goal';
  message: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Investment {
  id: string;
  type: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  minimumAmount: number;
}

export interface Debt {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  remainingTerm?: number;
}

export interface EmergencyFund {
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  lastContribution: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  expenses: Expense[];
  investments: Investment[];
  debts: Debt[];
  emergencyFund: EmergencyFund;
  creditScore: number;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
] as const;