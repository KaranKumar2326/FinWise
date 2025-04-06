import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../components/Button";
import { getFinancialAdvice } from "../lib/aiAdvisor";
import { ChatMessage } from "../lib/types";
import parse from "html-react-parser";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your AI Financial Advisor from FinWise. I can help you with personalized financial advice based on your transaction history and current financial status. How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatResponse = (response: string) => {
    return response
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\* (.*?)\n/g, "• $1<br />")
      .replace(/\n/g, "<br />");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: input.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getFinancialAdvice(userMessage.text);
      const botMessage: ChatMessage = {
        id: messages.length + 2,
        text: formatResponse(response),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && input.trim()) {
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">FinWise AI Advisor</h1>
          <p className="text-sm text-gray-500">Get expert financial guidance 24/7</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {parse(message.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 max-w-[70%] rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your finances, investments, or get personalized advice..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              className="flex items-center space-x-2"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}