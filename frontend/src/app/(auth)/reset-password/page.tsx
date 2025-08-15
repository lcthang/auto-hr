'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

function ResetPasswordForm() {
  const { updatePassword, handlePasswordRecovery } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Check if we have the required tokens in the URL and authenticate the user
  useEffect(() => {
    const hash = window.location.hash.substring(1); // remove '#'
    const searchParams = new URLSearchParams(hash);
    // Get all possible URL parameters that Supabase might send
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const recovery = searchParams.get('recovery');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    // Debug logging - log everything
    console.log('Reset password page - Full URL:', window.location.href);
    console.log('Reset password page - All URL parameters:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      recovery: recovery ? 'present' : 'missing',
      error,
      errorDescription,
      type,
      token: token ? 'present' : 'missing',
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    // Check for any error parameters from Supabase
    if (error) {
      console.log('Error parameter found:', error, errorDescription);
      setErrors({ 
        general: errorDescription || `Authentication error: ${error}. Please request a new password reset.` 
      });
      return;
    }
    
    // Check for different Supabase patterns
    let hasValidParams = false;
    
    if (accessToken && refreshToken) {
      console.log('Found access_token and refresh_token');
      hasValidParams = true;
    } else if (recovery) {
      console.log('Found recovery parameter');
      hasValidParams = true;
    } else if (type === 'recovery' && token) {
      console.log('Found type=recovery and token');
      hasValidParams = true;
    } else if (token) {
      console.log('Found token parameter');
      hasValidParams = true;
    }
    
    if (!hasValidParams) {
      console.log('No valid authentication parameters found');
      console.log('This might indicate:');
      console.log('1. The reset link has expired');
      console.log('2. The redirect URL is incorrect');
      console.log('3. Supabase is not sending the expected parameters');
      console.log('4. The user accessed the page directly without a reset link');
      setErrors({ general: 'Invalid or missing reset link. Please request a new password reset.' });
      return;
    }

    // Set a timeout for authentication
    const timeoutId = setTimeout(() => {
      setAuthTimeout(true);
    }, 10000); // 10 seconds timeout
    
    // Handle password recovery authentication
    const authenticateUser = async () => {
      try {
        let result;
        
        if (accessToken && refreshToken) {
          console.log('Using access_token and refresh_token for authentication');
          // Use the tokens directly
          result = await handlePasswordRecovery(accessToken, refreshToken);
        } else if (recovery || (type === 'recovery' && token) || token) {
          console.log('Using recovery/token parameters for authentication');
          // Supabase will handle the recovery flow automatically
          // We just need to wait for the auth state to change
          setIsAuthenticated(true);
          clearTimeout(timeoutId);
          return;
        }
        
        if (result?.error) {
          console.log('Authentication failed:', result.error);
          setErrors({ general: 'Invalid or expired reset link. Please request a new password reset.' });
        } else {
          console.log('Authentication successful');
          setIsAuthenticated(true);
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Authentication error:', error);
        setErrors({ general: 'Failed to authenticate reset link. Please try again.' });
        clearTimeout(timeoutId);
      }
    };

    authenticateUser();

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [handlePasswordRecovery]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength < 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await updatePassword(formData.password);
      
      if (error) {
        setErrors({ general: error.message });
      } else {
        setIsSuccess(true);
      }
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the form if not authenticated
  if (!isAuthenticated && !errors.general && !authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl mb-4">
              <span className="text-white text-2xl font-bold">⏰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication timeout</h1>
            <p className="text-gray-600">
              The reset link verification is taking longer than expected. This might be due to network issues or the link may have expired.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please try refreshing the page or request a new password reset link.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
            >
              Refresh page
            </button>
            <Link 
              href="/forgot-password" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errors.general && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4">
              <span className="text-white text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid reset link</h1>
            <p className="text-gray-600">
              {errors.general}
            </p>
          </div>

          <div className="text-center mt-6">
            <Link 
              href="/forgot-password" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password updated successfully!</h1>
            <p className="text-gray-600">
              Your password has been reset. You can now sign in with your new password.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Your password has been successfully updated. Please sign in with your new password.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link 
              href="/login" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h1>
          <p className="text-gray-600">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const strength = getPasswordStrength();
                        const { color } = getPasswordStrengthLabel();
                        return (
                          <div
                            key={level}
                            className={`h-2 w-8 rounded-full ${
                              level <= strength ? color : 'bg-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-500">
                      {getPasswordStrengthLabel().label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating password...
                </div>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
