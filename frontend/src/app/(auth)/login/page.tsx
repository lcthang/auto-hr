'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.status === 200) router.push('/upload');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('/api/auth/signup', { email, password });
      if (response.status === 201) {
        alert('Signup successful. Please log in.');
      }
    } catch (err) {
      setError('Signup failed. User may already exist.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login to Recruitryte</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        <button
          onClick={handleSignup}
          className="mt-4 w-full border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
