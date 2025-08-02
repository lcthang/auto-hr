# Authentication System

This is a production-ready authentication system built with NestJS, featuring:

## Features

- ✅ **User Registration** with comprehensive validation
- ✅ **User Login** with secure password comparison
- ✅ **JWT Token Generation** (Access + Refresh tokens)
- ✅ **Token Refresh** mechanism
- ✅ **Password Hashing** with bcrypt
- ✅ **Input Validation** with class-validator
- ✅ **Structured API Responses** with DTOs
- ✅ **Swagger Documentation** for all endpoints
- ✅ **Route Protection** with JWT guards
- ✅ **Password Change** functionality
- ✅ **User Profile** management
- ✅ **Token Validation** endpoint

## API Endpoints

### Public Endpoints

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST `/auth/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register endpoint.

#### POST `/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (Require Bearer Token)

#### POST `/auth/logout`
Logout user (invalidate session).

**Headers:** `Authorization: Bearer <access_token>`

#### GET `/auth/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

#### POST `/auth/change-password`
Change user password.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!"
}
```

#### GET `/auth/validate`
Validate JWT token.

**Headers:** `Authorization: Bearer <access_token>`

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Configuration
- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Separate secrets for access and refresh tokens
- Automatic password hashing with bcrypt (12 rounds)

### Validation
- Email format validation
- Phone number format validation
- Input sanitization and whitelisting
- Comprehensive error messages

## Database Schema

The `User` entity includes:
- UUID primary key
- First and last name
- Email (unique)
- Phone number (optional)
- Hashed password
- Email verification status
- Account status (active/inactive)
- Role-based access
- Timestamps

## Environment Variables

Required environment variables (see `env.example`):
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `JWT_ACCESS_EXPIRES_IN`: Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: 7d)

## Usage Examples

### Frontend Integration

```typescript
// Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data: { accessToken, refreshToken } } = await loginResponse.json();

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Use in API calls
const apiCall = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Token Refresh

```typescript
// When access token expires
const refreshResponse = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { data: { accessToken, refreshToken } } = await refreshResponse.json();

// Update stored tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

## Error Handling

The system provides structured error responses:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

Common error scenarios:
- Invalid credentials (401)
- Email already exists (409)
- Validation errors (400)
- Invalid/expired tokens (401)
- User not found (401)

## Future Enhancements

- Email verification system
- Password reset functionality
- Two-factor authentication
- Rate limiting
- Token blacklisting with Redis
- Social login integration
- Role-based authorization
- Audit logging 