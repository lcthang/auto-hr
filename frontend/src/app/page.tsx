import Link from 'next/link';
import { ArrowRightIcon, UserPlusIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <span className="text-white text-lg font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AutoHR</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Recruitment
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Sourcing </span>
            Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Search, screen, and engage the right candidates with precision at scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <Link
              href="/signup"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Start Your Free Trial
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center bg-white text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
            >
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Features & Highlights
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for a modern authentication experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Form Validation</h3>
            <p className="text-gray-600">
              Real-time client-side validation with helpful error messages and visual feedback for better user experience.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Password Security</h3>
            <p className="text-gray-600">
              Advanced password strength indicator, secure input fields with show/hide toggle, and comprehensive validation rules.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Step Flow</h3>
            <p className="text-gray-600">
              Intuitive multi-step registration process with progress indicators and smooth transitions between steps.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Responsive Design</h3>
            <p className="text-gray-600">
              Fully responsive design that works perfectly on desktop, tablet, and mobile devices with touch-friendly interactions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Social Login</h3>
            <p className="text-gray-600">
              Ready-to-implement social authentication options with Google and Microsoft for seamless user onboarding.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Password Recovery</h3>
            <p className="text-gray-600">
              Complete password reset flow with email verification and user-friendly success states for account recovery.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Modern Authentication?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Try our sign-up flow and see how smooth and professional authentication can be.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started Now
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <span className="text-lg font-bold text-gray-900">AutoHR</span>
          </div>
          <p className="text-gray-600">
            Professional authentication system built with modern web technologies.
          </p>
        </div>
      </footer>
    </div>
  );
}
