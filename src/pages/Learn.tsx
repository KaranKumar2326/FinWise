import { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, ExternalLink, Award, TrendingUp, Brain, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { getFinancialQuiz, getFinancialQuotes, getFinancialBlogs } from '../lib/openaiService';

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quote {
  text: string;
  author: string;
}

interface Blog {
  title: string;
  url: string;
  source: string;
  date: string;
}

export default function Learn() {
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizData, quotesData, blogsData] = await Promise.all([
        getFinancialQuiz(),
        getFinancialQuotes(),
        getFinancialBlogs()
      ]);
      
      setQuiz(quizData);
      setQuotes(quotesData);
      setBlogs(blogsData);
      setError(null);
    } catch (error) {
      console.error('Error loading content:', error);
      setError('There was an error loading the content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(selectedIndex);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedIndex;
    setUserAnswers(newUserAnswers);
    
    if (selectedIndex === quiz[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setUserAnswers([]);
    loadContent();
  };

  const getScoreMessage = () => {
    const percentage = (score / quiz.length) * 100;
    if (percentage >= 90) return "Outstanding! You're a financial expert! 🏆";
    if (percentage >= 70) return "Great job! You have solid financial knowledge! 🌟";
    if (percentage >= 50) return "Good effort! Keep learning! 📚";
    return "Keep studying! Financial literacy is a journey! 💪";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial knowledge hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-8">
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700">{error}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Financial Learning Hub
            </h1>
            <p className="text-gray-600 mt-2">Expand your financial knowledge with interactive lessons</p>
          </div>
          <Brain className="h-10 w-10 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.01]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Financial Quiz Challenge</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>New Quiz</span>
                </Button>
              </div>

              {!showResults ? (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Question {currentQuestion + 1} of {quiz.length}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        Score: {score}/{currentQuestion}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <p className="text-lg font-medium text-gray-800">{quiz[currentQuestion]?.question}</p>
                  </div>

                  <div className="space-y-3">
                    {quiz[currentQuestion]?.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                          selectedAnswer === null
                            ? 'hover:border-blue-300 hover:bg-blue-50'
                            : selectedAnswer === index
                            ? index === quiz[currentQuestion].correctAnswer
                              ? 'bg-green-100 border-green-500'
                              : 'bg-red-100 border-red-500'
                            : index === quiz[currentQuestion].correctAnswer
                            ? 'bg-green-100 border-green-500'
                            : 'opacity-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-current">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                    <p className="text-gray-600 mb-4">{getScoreMessage()}</p>
                    <div className="text-4xl font-bold text-blue-600 mb-6">
                      {score}/{quiz.length}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold mb-4">Question Review</h4>
                    <div className="space-y-4">
                      {quiz.map((q, index) => (
                        <div key={index} className="text-left">
                          <p className="font-medium">
                            {index + 1}. {q.question}
                          </p>
                          <p className="text-sm text-gray-600">
                            Your answer: {userAnswers[index] !== undefined ? 
                              q.options[userAnswers[index]] : 'Not answered'}
                          </p>
                          <p className={`text-sm ${userAnswers[index] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                            Correct answer: {q.options[q.correctAnswer]}
                          </p>
                          {q.explanation && (
                            <p className="text-sm text-gray-600 mt-1">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={resetQuiz} className="w-full md:w-auto">
                    Try Another Quiz
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quotes and Blogs Section */}
          <div className="space-y-8">
            {/* Quotes */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.01]">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Financial Wisdom</h2>
              </div>
              <div className="space-y-4">
                {quotes.map((quote, index) => (
                  <blockquote
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-blue-50 transition-colors rounded-r-lg"
                  >
                    <p className="text-gray-800 italic mb-2">{quote.text}</p>
                    <footer className="text-gray-600 font-medium">— {quote.author}</footer>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Blogs */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.01]">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Latest Financial Insights</h2>
              </div>
              <div className="space-y-4">
                {blogs.map((blog, index) => (
                  <a
                    key={index}
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border rounded-lg hover:bg-blue-50 transition-all hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-1 text-blue-600">{blog.title}</h3>
                        <p className="text-sm text-gray-600">
                          {blog.source} • {blog.date}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}