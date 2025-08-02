# Dual Database Setup: MongoDB & Supabase

This project supports both MongoDB and Supabase as database options. You can easily switch between them by changing the `DATABASE_TYPE` environment variable.

## Database Options

### 1. MongoDB (Default)
- **Pros**: Flexible schema, great for document-based data, local development
- **Use Case**: Development, prototyping, document-heavy applications
- **Setup**: Simple local setup with MongoDB GUI

### 2. Supabase (PostgreSQL)
- **Pros**: Built-in auth, real-time subscriptions, SQL power, hosted solution
- **Use Case**: Production, real-time features, complex queries
- **Setup**: Cloud-hosted with web dashboard

## Configuration

### Environment Variables

Set `DATABASE_TYPE` in your `.env` file:

```bash
# For MongoDB
DATABASE_TYPE=mongodb

# For Supabase
DATABASE_TYPE=supabase
```

### MongoDB Setup

1. **Install MongoDB locally** or use MongoDB Atlas
2. **Set environment variables**:
   ```bash
   DATABASE_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/auto_hr
   ```

3. **Start MongoDB**:
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod --dbpath /usr/local/var/mongodb
   ```

### Supabase Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Project Settings > API
3. **Set environment variables**:
   ```bash
   DATABASE_TYPE=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Create users table** in Supabase SQL Editor:
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     first_name VARCHAR(50) NOT NULL,
     last_name VARCHAR(50) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     phone_number VARCHAR(20),
     password VARCHAR(255) NOT NULL,
     is_email_verified BOOLEAN DEFAULT FALSE,
     email_verification_token VARCHAR(255),
     password_reset_token VARCHAR(255),
     password_reset_expires TIMESTAMP,
     is_active BOOLEAN DEFAULT TRUE,
     role VARCHAR(20) DEFAULT 'user',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Create policy for authenticated users
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);

   -- Create policy for users to update own profile
   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE USING (auth.uid() = id);
   ```

## Switching Between Databases

### To use MongoDB:
```bash
export DATABASE_TYPE=mongodb
npm run start:dev
```

### To use Supabase:
```bash
export DATABASE_TYPE=supabase
npm run start:dev
```

## Database-Specific Features

### MongoDB Features
- ✅ **Flexible Schema**: Easy to modify user fields
- ✅ **Local Development**: Works offline
- ✅ **Mongoose ODM**: Rich querying and validation
- ✅ **Automatic Password Hashing**: Built into schema
- ✅ **Indexing**: Automatic email uniqueness

### Supabase Features
- ✅ **Built-in Auth**: Can use Supabase Auth instead of custom JWT
- ✅ **Real-time**: Live updates with subscriptions
- ✅ **Row Level Security**: Fine-grained access control
- ✅ **SQL Power**: Complex queries and relationships
- ✅ **Hosted Solution**: No local setup required

## Migration Between Databases

### MongoDB to Supabase
1. Export MongoDB data:
   ```bash
   mongoexport --db auto_hr --collection users --out users.json
   ```

2. Import to Supabase:
   ```sql
   -- Use Supabase dashboard or API to import data
   ```

### Supabase to MongoDB
1. Export Supabase data:
   ```sql
   COPY (SELECT * FROM users) TO '/tmp/users.csv' CSV HEADER;
   ```

2. Import to MongoDB:
   ```bash
   mongoimport --db auto_hr --collection users --file users.csv --type csv --headerline
   ```

## Development Workflow

### Local Development (MongoDB)
```bash
# Start MongoDB
brew services start mongodb-community

# Start application
DATABASE_TYPE=mongodb npm run start:dev
```

### Production (Supabase)
```bash
# Set production environment
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Start application
npm run start:prod
```

## Testing Both Databases

### Test MongoDB
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Test Supabase
```bash
# Same API endpoint, different database backend
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!"
  }'
```

## Troubleshooting

### MongoDB Issues
- **Connection refused**: Make sure MongoDB is running
- **Authentication failed**: Check MongoDB URI format
- **Database not found**: MongoDB will create it automatically

### Supabase Issues
- **Invalid API key**: Check your Supabase credentials
- **Table not found**: Run the SQL setup script
- **RLS errors**: Check Row Level Security policies

## Best Practices

1. **Use MongoDB for development** - Faster iteration
2. **Use Supabase for production** - Better scalability
3. **Keep schemas in sync** - Both databases should have similar structures
4. **Test both databases** - Ensure compatibility
5. **Use environment variables** - Never hardcode database credentials

## Future Enhancements

- [ ] Database migration scripts
- [ ] Automatic schema synchronization
- [ ] Database health checks
- [ ] Backup and restore utilities
- [ ] Performance monitoring 