import { ChatMessage } from './types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function sendMessageToGemini(message: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

const FALLBACK_QUIZ = [
  {
    question: "What is compound interest?",
    options: [
      "Interest earned only on the principal amount",
      "Interest earned on both principal and accumulated interest",
      "A fixed interest rate that never changes",
      "Interest paid only at the end of a loan term"
    ],
    correctAnswer: 1,
    explanation: "Compound interest is interest earned on both your initial principal and previously accumulated interest, allowing your money to grow exponentially over time."
  },
  {
    question: "Which investment typically carries the highest risk?",
    options: [
      "Government bonds",
      "Certificates of deposit",
      "Cryptocurrency",
      "Blue-chip stocks"
    ],
    correctAnswer: 2,
    explanation: "Cryptocurrency is generally considered the riskiest due to its high volatility and lack of regulation compared to traditional investments."
  },
  {
    question: "What is diversification in investing?",
    options: [
      "Putting all your money in one successful stock",
      "Spreading investments across different assets",
      "Only investing in real estate",
      "Keeping all money in savings accounts"
    ],
    correctAnswer: 1,
    explanation: "Diversification reduces risk by spreading investments across different assets, sectors, or geographical locations."
  },
  {
    question: "What is a good first step in creating a budget?",
    options: [
      "Taking out a loan",
      "Buying stocks",
      "Tracking expenses for a month",
      "Opening multiple credit cards"
    ],
    correctAnswer: 2,
    explanation: "Tracking expenses helps you understand your spending patterns and identify areas where you can save money."
  },
  {
    question: "What is an emergency fund?",
    options: [
      "Money for vacation",
      "Retirement savings",
      "3-6 months of living expenses saved",
      "Investment in stocks"
    ],
    correctAnswer: 2,
    explanation: "An emergency fund typically consists of 3-6 months of living expenses saved for unexpected situations."
  },
  {
    question: "What is a credit score primarily based on?",
    options: [
      "Your salary",
      "Your education level",
      "Your credit history and payment behavior",
      "Your bank balance"
    ],
    correctAnswer: 2,
    explanation: "Credit scores are primarily based on your credit history, including payment history, credit utilization, and length of credit history."
  },
  {
    question: "What is a 401(k)?",
    options: [
      "A type of loan",
      "A retirement savings plan",
      "A credit card",
      "A government bond"
    ],
    correctAnswer: 1,
    explanation: "A 401(k) is an employer-sponsored retirement savings plan that offers tax advantages."
  },
  {
    question: "What is inflation?",
    options: [
      "Rising stock prices",
      "Increasing bank interest rates",
      "General increase in prices over time",
      "Growth in GDP"
    ],
    correctAnswer: 2,
    explanation: "Inflation is the general increase in prices of goods and services over time, reducing purchasing power."
  },
  {
    question: "What is a mutual fund?",
    options: [
      "A type of bank account",
      "A collection of stocks/bonds managed professionally",
      "A government savings bond",
      "A type of credit card"
    ],
    correctAnswer: 1,
    explanation: "A mutual fund is a professionally managed investment vehicle that pools money from multiple investors."
  },
  {
    question: "What is the purpose of insurance?",
    options: [
      "To make money",
      "To protect against financial losses",
      "To avoid taxes",
      "To increase savings"
    ],
    correctAnswer: 1,
    explanation: "Insurance provides financial protection against potential losses or damages."
  }
];

const FALLBACK_QUOTES = [
  {
    text: "The best investment you can make is in yourself.",
    author: "Warren Buffett"
  },
  {
    text: "Don't work for money; make money work for you.",
    author: "Robert Kiyosaki"
  },
  {
    text: "Financial freedom is available to those who learn about it and work for it.",
    author: "Robert Kiyosaki"
  }
];

const FALLBACK_BLOGS = [
  {
    title: "Understanding Market Volatility: A Guide for New Investors",
    url: "https://www.bloomberg.com/markets",
    source: "Bloomberg",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  {
    title: "The Future of Digital Banking: What to Expect",
    url: "https://www.forbes.com/money",
    source: "Forbes",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  {
    title: "Sustainable Investing: A Guide for Beginners",
    url: "https://www.reuters.com/markets",
    source: "Reuters",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
];

export async function getFinancialQuiz(): Promise<any[]> {
  try {
    const prompt = `Generate a comprehensive financial literacy quiz with exactly 10 multiple-choice questions. 
      Format as JSON array with objects containing:
      - question: string
      - options: array of 4 strings
      - correctAnswer: number (0-3)
      - explanation: string
      
      Topics: investing, saving, budgeting, credit, taxes, retirement planning.
      Make questions practical and relevant.`;

    const response = await sendMessageToGemini(prompt);
    const parsedResponse = JSON.parse(response);
    
    if (!Array.isArray(parsedResponse) || parsedResponse.length !== 10) {
      throw new Error('Invalid quiz format');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating quiz:', error);
    return FALLBACK_QUIZ;
  }
}

export async function getFinancialQuotes(): Promise<any[]> {
  try {
    const prompt = `Generate 3 inspiring finance quotes with authors.
      Format as JSON array with objects containing:
      - text: string (the quote)
      - author: string (full name)
      
      Use verified, accurate quotes from well-known financial experts.`;

    const response = await sendMessageToGemini(prompt);
    const parsedResponse = JSON.parse(response);
    
    if (!Array.isArray(parsedResponse) || parsedResponse.length !== 3) {
      throw new Error('Invalid quotes format');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating quotes:', error);
    return FALLBACK_QUOTES;
  }
}

export async function getFinancialBlogs(): Promise<any[]> {
  try {
    const prompt = `Generate 3 financial blog post titles with details.
      Format as JSON array with objects containing:
      - title: string
      - url: string (use major financial sites)
      - source: string (publication name)
      - date: string (current date)
      
      Focus on current financial trends and advice.`;

    const response = await sendMessageToGemini(prompt);
    const parsedResponse = JSON.parse(response);
    
    if (!Array.isArray(parsedResponse) || parsedResponse.length !== 3) {
      throw new Error('Invalid blogs format');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating blogs:', error);
    return FALLBACK_BLOGS;
  }
}