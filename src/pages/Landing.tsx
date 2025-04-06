import { DollarSign, ArrowRight } from "lucide-react";
import Button from "../components/Button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">FinWise</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Your Personal AI Financial Advisor
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get expert financial advice, investment strategies, and personalized guidance
            powered by advanced AI technology.
          </p>
          <Link to="/signup">
            <Button className="text-lg px-8 py-3">
              Get Started <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Smart Investment Advice</h3>
            <p className="text-gray-600">Get personalized investment recommendations based on your goals and risk tolerance.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">24/7 Availability</h3>
            <p className="text-gray-600">Access expert financial guidance whenever you need it, day or night.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Data-Driven Insights</h3>
            <p className="text-gray-600">Make informed decisions with real-time market analysis and trends.</p>
          </div>
        </div>
      </main>
    </div>
  );
}