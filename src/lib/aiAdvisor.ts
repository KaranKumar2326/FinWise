import { sendMessageToGemini } from './geminiService';
import { getAccountBalance, getRecentTransactions, analyzeTransactions, generateFinancialAdvice } from './openbankService';

export async function getFinancialAdvice(userQuery: string): Promise<string> {
  try {
    // Fetch financial data
    const [balance, transactions] = await Promise.all([
      getAccountBalance(),
      getRecentTransactions()
    ]);

    // Generate context from financial data
    let context = '';
    
    if (balance) {
      context += `Current balance: ${balance.amount} ${balance.currency}\n`;
    }

    if (transactions.length > 0) {
      context += analyzeTransactions(transactions);
    }

    if (balance && transactions) {
      context += generateFinancialAdvice(balance, transactions);
    }

    // Prepare prompt for Gemini
    const prompt = `
      As an AI financial advisor, please provide advice based on the following context and user question:

      Financial Context:
      ${context}

      User Question:
      ${userQuery}

      Please provide specific, actionable advice considering the user's current financial situation.
    `;

    // Get AI response
    const response = await sendMessageToGemini(prompt);
    return response;

  } catch (error) {
    console.error('Error getting financial advice:', error);
    return "I apologize, but I'm having trouble accessing your financial data at the moment. Here's some general advice based on your question:\n\n" +
           await sendMessageToGemini(userQuery);
  }
}