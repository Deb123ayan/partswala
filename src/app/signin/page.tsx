'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import pb from '../lib/pocketbase';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in logic
        await pb.collection('user').authWithPassword(formData.email, formData.password);
        router.push('/dashboard');
      } else {
        // Validate phone format
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{3,4}$/;
        if (!phoneRegex.test(formData.phone)) {
          throw new Error('Please enter a valid phone number');
        }

        // Create new user
        const userData = {
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.password,
          name: formData.name,
          phone: formData.phone,
          emailVisibility: true,
        };

        await pb.collection('user').create(userData);
        await pb.collection('user').authWithPassword(formData.email, formData.password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Authentication error:', err?.response || err);
      setError(err?.response?.message || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-yellow-400 rounded-full">
                <Settings className="w-8 h-8 text-blue-800" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">PARTSWALA</h1>
            <p className="text-center text-blue-100 text-sm">
              {isLogin ? 'Sign in to your garage' : 'Join our parts community'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 pt-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg text-sm flex items-center bg-red-50 text-red-700 border border-red-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <>
                      <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Smith"
                          className="input-style"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          minLength={2}
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="input-style"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className="input-style"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-gray-500" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input-style"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </span>
                    ) : isLogin ? 'Sign In' : 'Sign Up'}
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "New to PartsWala?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our <a href="#" className="text-blue-600 underline">Terms</a> and <a href="#" className="text-blue-600 underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
