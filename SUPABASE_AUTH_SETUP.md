# Supabase Auth Integration Setup

This document explains how to set up and use Supabase Auth for user authentication in your Next.js application.

## Features Implemented

✅ **User Registration** - Sign up with email/password  
✅ **User Login** - Sign in with email/password  
✅ **Password Reset** - Forgot password functionality  
✅ **Protected Routes** - Middleware-based route protection  
✅ **User Dashboard** - Protected user dashboard  
✅ **Session Management** - Automatic session handling  
✅ **Logout Functionality** - Secure user logout  

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Configuration

In your Supabase dashboard:

1. **Enable Email Authentication**:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations" if you want email verification
   - Configure your email templates

2. **Configure Auth Settings**:
   - Set your site URL to `http://localhost:3000` for development
   - Add production URLs when deploying

3. **Set up Email Templates** (Optional):
   - Customize the email templates for signup confirmation and password reset
   - Update redirect URLs to match your application

### 3. Dependencies

The following packages are installed:

```json
{
  "@supabase/supabase-js": "^2.53.0",
  "@supabase/ssr": "latest"
}
```

## File Structure

```
frontend/src/
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── contexts/
│   └── AuthContext.tsx          # Authentication context and hooks
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx         # Login page
│   ├── signup/
│   │   └── page.tsx             # Registration page
│   ├── forgot-password/
│   │   └── page.tsx             # Password reset page
│   └── dashboard/
│       └── page.tsx             # Protected dashboard
└── middleware.ts                # Route protection middleware
```

## Usage

### Authentication Context

The `useAuth` hook provides access to authentication methods:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  
  // Access current user
  if (user) {
    console.log('User:', user.email);
  }
}
```

### Protected Routes

Routes are automatically protected by middleware:
- `/dashboard` - Requires authentication
- `/profile` - Requires authentication  
- `/settings` - Requires authentication

### Sign Up

```tsx
const { signUp } = useAuth();

const handleSignUp = async () => {
  const { data, error } = await signUp(email, password, {
    first_name: 'John',
    last_name: 'Doe',
    company: 'Acme Corp'
  });
};
```

### Sign In

```tsx
const { signIn } = useAuth();

const handleSignIn = async () => {
  const { data, error } = await signIn(email, password);
};
```

### Password Reset

```tsx
const { resetPassword } = useAuth();

const handleReset = async () => {
  const { data, error } = await resetPassword(email);
};
```

## User Data Structure

User metadata is stored in `user.user_metadata`:

```typescript
{
  first_name: string;
  last_name: string;
  company?: string;
  job_title?: string;
  subscribe_newsletter?: boolean;
}
```

## Error Handling

All authentication methods return an object with `data` and `error`:

```tsx
const { data, error } = await signIn(email, password);

if (error) {
  console.error('Auth error:', error.message);
} else {
  console.log('Success:', data.user);
}
```

## Development

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Visit `http://localhost:3000` to see the application
3. Test the authentication flow:
   - Sign up for a new account
   - Check your email for verification (if enabled)
   - Sign in with your credentials
   - Access the protected dashboard
   - Test the forgot password functionality

## Production Deployment

1. Update environment variables with production Supabase credentials
2. Configure Supabase Auth settings with production URLs
3. Test email delivery in production environment
4. Monitor authentication metrics in Supabase dashboard

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"** - Check email/password combination
2. **Email not received** - Check spam folder, verify email settings in Supabase
3. **Redirect loops** - Verify middleware configuration and route protection
4. **Session not persisting** - Check cookie settings and domain configuration

### Debug Mode

Enable debug logging by adding to your environment:

```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Security Considerations

- Never expose service role keys in client-side code
- Use Row Level Security (RLS) policies in Supabase
- Implement proper CORS settings
- Validate user input on both client and server
- Use HTTPS in production

## Next Steps

Consider implementing:
- Social authentication (Google, GitHub, etc.)
- Two-factor authentication
- User profile management
- Role-based access control
- Email template customization