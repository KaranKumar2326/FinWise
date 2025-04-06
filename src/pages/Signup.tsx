import { useState } from "react";
import { DollarSign, ArrowLeft, AlertCircle, UserPlus} from "lucide-react";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle, signUp } from "../lib/firebase";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
  
    setLoading(true);
    

    // signup with google
    
    try {
      // Sign up user (with timeout protection)
      const result = await Promise.race([
        signUp(formData.email, formData.password, formData.firstName, formData.lastName),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signup took too long')), 10000) // 10 second timeout
        )
      ]);

      
  
      // Navigate only after successful signup
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === 'auth/network-request-failed' || error.code === 400) {
        errorMessage = "Network error. Please check your connection";
      } else if (error.message === 'Signup took too long') {
        // errorMessage = "Request timed out. Please try again.";

        navigate("/login");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false); // Always turn off loading
    }
  };
   const handleGoogleSignIn = async () => {
      setError("");
      setGoogleLoading(true);
      
      try {
        await signInWithGoogle();
        navigate("/dashboard");
      } catch (error: any) {
        setError(error.message);
      } finally {
        setGoogleLoading(false);
      }
    };
  console.log("loading", loading);
  if (loading || googleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-blue-600 mb-4 mx-auto animate-bounce" />
          <h2 className="text-xl font-semibold mb-2">Creating your account...</h2>
          <p className="text-gray-600">Please wait while we set up your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <div className="max-w-md mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Join FinWise</h1>
            <p className="text-gray-600 mt-2">Create your free account</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
            
            <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign Up with Google
              </Button>
            
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>
            {/* signup with google */}
            

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


