import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import { UserProfile } from '../lib/types';
import { logOut } from '../lib/firebase';
import { CURRENCIES } from '../lib/types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleCurrencyChange = async (currencyCode: string) => {
    if (!user || !userProfile) return;
    
    setIsUpdating(true);
    try {
      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        currency: currencyCode
      });

      // Update local storage and state
      const updatedProfile = {
        ...userProfile,
        currency: currencyCode
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setShowCurrencies(false);
    } catch (error) {
      console.error('Error updating currency:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      localStorage.removeItem('userProfile');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === userProfile?.currency);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Appearance</h2>
              <p className="text-gray-600 dark:text-gray-400">Toggle dark mode</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Currency Settings</h2>
            <div className="relative">
              <button
                onClick={() => setShowCurrencies(!showCurrencies)}
                disabled={isUpdating}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-700 dark:text-gray-200">
                      {selectedCurrency?.symbol} {selectedCurrency?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </>
                )}
              </button>

              {showCurrencies && !isUpdating && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2 ${
                        currency.code === selectedCurrency?.code ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                      onClick={() => handleCurrencyChange(currency.code)}
                    >
                      <span className="w-8 text-gray-700 dark:text-gray-200">{currency.symbol}</span>
                      <span className="text-gray-700 dark:text-gray-200">{currency.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Name: {userProfile?.firstName} {userProfile?.lastName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Email: {userProfile?.email}
              </p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}