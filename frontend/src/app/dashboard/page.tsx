'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon, 
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // State for editable fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to get user name from different data structures
  const getUserName = (user: any) => {
    if (!user) return 'User';

    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    
    // Check for custom properties that might exist
    if ((user as any).firstName && (user as any).lastName) {
      return `${(user as any).firstName} ${(user as any).lastName}`;
    }
    
    if (user.email) {
      return user.email.split('@')[0]; // Use email prefix as fallback
    }

    return 'User';
  };

  // Check if user has minimal required data
  const hasMinimalUserData = (user: any) => {
    return user && (user.id || user.email);
  };

  // Helper function to get user metadata safely
  const getUserMetadata = (user: any, key: string, fallback: string = 'Not specified') => {
    if (!user) return fallback;
    
    // Try different possible locations
    if (user.user_metadata?.[key]) return user.user_metadata[key];
    if ((user as any)[key]) return (user as any)[key];
    
    return fallback;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Debug: Log user data when it changes
    if (user) {
      console.log('Dashboard: User data received:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        fullUser: user
      });
      
      // Initialize edit values with current user data
      setEditValues({
        firstName: getUserMetadata(user, 'first_name', ''),
        lastName: getUserMetadata(user, 'last_name', ''),
        company: getUserMetadata(user, 'company'),
        jobTitle: getUserMetadata(user, 'job_title')
      });
    }
  }, [user, loading, router]);

  // Handle edit mode for fields
  const handleEdit = (field: string) => {
    setEditingField(field);
    // Set initial values based on current user data
    if (field === 'firstName') {
      setEditValues(prev => ({ ...prev, firstName: getUserMetadata(user, 'first_name', '') }));
    } else if (field === 'lastName') {
      setEditValues(prev => ({ ...prev, lastName: getUserMetadata(user, 'last_name', '') }));
    } else if (field === 'company') {
      setEditValues(prev => ({ ...prev, company: getUserMetadata(user, 'company') }));
    } else if (field === 'jobTitle') {
      setEditValues(prev => ({ ...prev, jobTitle: getUserMetadata(user, 'jobTitle') }));
    }
  };

  // Handle save for fields
  const handleSave = async (field: string) => {
    setIsSaving(true);
    try {
      // Here you would typically make an API call to update the user data
      // For now, we'll just simulate the update
      console.log(`Saving ${field}:`, editValues[field as keyof typeof editValues]);
      
      // TODO: Implement actual API call to update user metadata
      // await updateUserMetadata(field, editValues[field as keyof typeof editValues]);
      
      // Exit edit mode
      setEditingField(null);
      
      // Show success message (you could add a toast notification here)
      console.log(`${field} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingField(null);
          setEditValues({ firstName: '', lastName: '', company: '', jobTitle: '' });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Check if user has minimal required data
  if (!hasMinimalUserData(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Issue</h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your user data. This might be due to an incomplete authentication session.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.href = '/test-auth'}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Debug Authentication
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <span className="text-white text-lg font-bold">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AutoHR</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getUserName(user)}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {getUserName(user)}!
              </h1>
              <p className="text-gray-600">
                You have successfully signed in to your AutoHR dashboard.
              </p>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        First Name
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {editingField === 'firstName' ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editValues.firstName}
                              onChange={(e) => setEditValues(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter first name"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave('firstName')}
                                disabled={isSaving}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{getUserMetadata(user, 'first_name', 'Not specified')}</span>
                            <button
                              onClick={() => handleEdit('firstName')}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Last Name
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {editingField === 'lastName' ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editValues.lastName}
                              onChange={(e) => setEditValues(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter last name"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave('lastName')}
                                disabled={isSaving}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{getUserMetadata(user, 'last_name', 'Not specified')}</span>
                            <button
                              onClick={() => handleEdit('lastName')}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Email
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.email}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Company
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {editingField === 'company' ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editValues.company}
                              onChange={(e) => setEditValues(prev => ({ ...prev, company: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter company name"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave('company')}
                                disabled={isSaving}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{getUserMetadata(user, 'company')}</span>
                            <button
                              onClick={() => handleEdit('company')}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Job Title
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {editingField === 'jobTitle' ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editValues.jobTitle}
                              onChange={(e) => setEditValues(prev => ({ ...prev, jobTitle: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter job title"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave('jobTitle')}
                                disabled={isSaving}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{getUserMetadata(user, 'job_title')}</span>
                            <button
                              onClick={() => handleEdit('jobTitle')}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                      <UserIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      Profile Settings
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Update your personal information and preferences.
                    </p>
                  </div>
                </button>

                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                      <BriefcaseIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      Job Search
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Find and apply to relevant job opportunities.
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/job-description-generator')}
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                      <DocumentTextIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      JD Generator
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create professional job descriptions with AI assistance.
                    </p>
                  </div>
                </button>

                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-600 ring-4 ring-white">
                      <Cog6ToothIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      Account Settings
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage your account security and notifications.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}