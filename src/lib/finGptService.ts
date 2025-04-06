import axios from 'axios';

const API_KEY = import.meta.env.VITE_FINGPT_API_KEY;
const API_URL = 'https://api.fingpt.ai/v1/chat';

export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export async function sendMessage(message: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('FinGPT API key is not configured. Please check your .env file.');
  }

  try {
    console.log('Sending request to FinGPT API...'); // Debug log
    const response = await axios.post(
      API_URL,
      {
        messages: [{ role: "user", content: message }],
        model: "fingpt-4",
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Received response:', response.data); // Debug log

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('FinGPT API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else if (error instanceof Error) {
      console.error('FinGPT API Error:', error.message);
    } else {
      console.error('FinGPT API Error:', String(error));
    }
    throw new Error('Failed to get response from AI advisor');
  }
}