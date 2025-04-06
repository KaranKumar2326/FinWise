const API_KEY = "demo";  
const API_URL = "https://api.openai.com/v1/chat/completions";

// Helper function to call OpenAI API with retries
async function sendMessageToOpenAI(prompt: string, retries = 3): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // Changed to gpt-3.5-turbo which is more widely available
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);

      // Handle rate limits
      if (response.status === 429 && retries > 0) {
        console.warn("Rate limit hit. Retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return sendMessageToOpenAI(prompt, retries - 1);
      }

      // Return fallback data instead of throwing
      return JSON.stringify(
        prompt.includes("quiz") ? FALLBACK_QUIZ :
        prompt.includes("quotes") ? FALLBACK_QUOTES :
        FALLBACK_BLOGS
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid OpenAI response format:", data);
      throw new Error("Invalid response format from OpenAI");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Request Failed:", error);
    // Return fallback data instead of throwing
    return JSON.stringify(
      prompt.includes("quiz") ? FALLBACK_QUIZ :
      prompt.includes("quotes") ? FALLBACK_QUOTES :
      FALLBACK_BLOGS
    );
  }
}

// Comprehensive fallback data
const FALLBACK_QUIZ = [
  {
    question: "What is the 50/30/20 budgeting rule?",
    options: [
      "50% savings, 30% needs, 20% wants",
      "50% needs, 30% wants, 20% savings",
      "50% wants, 30% savings, 20% needs",
      "50% needs, 30% savings, 20% wants"
    ],
    correctAnswer: 1,
    explanation: "The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and 20% on savings and debt repayment."
  },
  {
    question: "What is dollar-cost averaging?",
    options: [
      "Buying stocks at their lowest price",
      "Investing a fixed amount regularly regardless of price",
      "Selling stocks at their highest price",
      "Converting foreign currency to dollars"
    ],
    correctAnswer: 1,
    explanation: "Dollar-cost averaging is investing a fixed amount at regular intervals, regardless of market conditions."
  },
  {
    question: "Which account typically offers the highest interest rate?",
    options: [
      "Checking account",
      "Basic savings account",
      "High-yield savings account",
      "Money market account"
    ],
    correctAnswer: 2,
    explanation: "High-yield savings accounts typically offer higher interest rates than traditional savings or checking accounts."
  },
  {
    question: "What is the primary purpose of an emergency fund?",
    options: [
      "To invest in stocks",
      "To cover unexpected expenses",
      "To save for retirement",
      "To pay regular bills"
    ],
    correctAnswer: 1,
    explanation: "An emergency fund is primarily used to cover unexpected expenses or income loss."
  },
  {
    question: "What is a credit utilization ratio?",
    options: [
      "Your total debt divided by your income",
      "Your credit card balance divided by your credit limit",
      "Your monthly payments divided by your total debt",
      "Your credit score divided by 850"
    ],
    correctAnswer: 1,
    explanation: "Credit utilization is the amount of credit you're using divided by your total credit limit."
  },
  {
    question: "Which investment typically has the lowest risk?",
    options: [
      "Cryptocurrency",
      "Individual stocks",
      "Government bonds",
      "Real estate"
    ],
    correctAnswer: 2,
    explanation: "Government bonds, especially from stable countries, are considered one of the lowest-risk investments."
  },
  {
    question: "What is the main advantage of a Roth IRA?",
    options: [
      "Immediate tax deduction",
      "Tax-free withdrawals in retirement",
      "Employer matching contributions",
      "No contribution limits"
    ],
    correctAnswer: 1,
    explanation: "Roth IRA contributions grow tax-free and can be withdrawn tax-free in retirement."
  },
  {
    question: "What is a good credit score range?",
    options: [
      "300-500",
      "500-600",
      "600-700",
      "700-850"
    ],
    correctAnswer: 3,
    explanation: "A credit score between 700-850 is considered good to excellent."
  },
  {
    question: "What is the Rule of 72?",
    options: [
      "A tax regulation",
      "A formula to estimate investment doubling time",
      "A retirement planning rule",
      "A credit score calculation"
    ],
    correctAnswer: 1,
    explanation: "The Rule of 72 helps estimate how long it will take for an investment to double at a given interest rate."
  },
  {
    question: "What is the first step in creating a budget?",
    options: [
      "Cut all expenses",
      "Track current spending",
      "Set savings goals",
      "Open a new bank account"
    ],
    correctAnswer: 1,
    explanation: "Tracking your current spending is essential to understand your financial habits before creating a budget."
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
    title: "The Future of Digital Banking: What to Expect in 2025",
    url: "https://www.forbes.com/money",
    source: "Forbes",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  {
    title: "Sustainable Investing: A Guide for Beginners",
    url: "https://www.bloomberg.com/markets",
    source: "Bloomberg",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  {
    title: "AI in Personal Finance: How Machine Learning is Changing Money Management",
    url: "https://www.reuters.com/markets",
    source: "Reuters",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
];

// Generate New Quiz
export async function getFinancialQuiz(): Promise<any[]> {
  try {
    const prompt = `Generate 10 financial literacy quiz questions.
      Format as JSON array with:
      - question: string
      - options: array of 4 strings
      - correctAnswer: number (0-3)
      - explanation: string
      
      Focus on practical personal finance topics.`;

    const response = await sendMessageToOpenAI(prompt);
    
    try {
      const parsedResponse = JSON.parse(response);
      if (Array.isArray(parsedResponse) && parsedResponse.length === 10) {
        return parsedResponse;
      }
    } catch (e) {
      console.error("Failed to parse quiz response:", e);
    }
    
    return FALLBACK_QUIZ;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return FALLBACK_QUIZ;
  }
}

// Generate New Quotes
export async function getFinancialQuotes(): Promise<any[]> {
  try {
    const prompt = `Generate 3 inspiring financial quotes with authors.
      Format as JSON array with:
      - text: string (the quote)
      - author: string (full name)
      
      Use verified quotes from well-known financial experts.`;

    const response = await sendMessageToOpenAI(prompt);
    
    try {
      const parsedResponse = JSON.parse(response);
      if (Array.isArray(parsedResponse) && parsedResponse.length === 3) {
        return parsedResponse;
      }
    } catch (e) {
      console.error("Failed to parse quotes response:", e);
    }
    
    return FALLBACK_QUOTES;
  } catch (error) {
    console.error("Error generating quotes:", error);
    return FALLBACK_QUOTES;
  }
}

// Generate New Blogs
export async function getFinancialBlogs(): Promise<any[]> {
  try {
    const prompt = `Generate 3 financial blog post ideas.
      Format as JSON array with:
      - title: string
      - url: string (use major financial sites)
      - source: string (publication name)
      - date: string (current date)
      
      Focus on current financial trends.`;

    const response = await sendMessageToOpenAI(prompt);
    
    try {
      const parsedResponse = JSON.parse(response);
      if (Array.isArray(parsedResponse) && parsedResponse.length === 3) {
        return parsedResponse;
      }
    } catch (e) {
      console.error("Failed to parse blogs response:", e);
    }
    
    return FALLBACK_BLOGS;
  } catch (error) {
    console.error("Error generating blogs:", error);
    return FALLBACK_BLOGS;
  }
}