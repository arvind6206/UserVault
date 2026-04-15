# User Management System - MERN Stack

A comprehensive role-based user management system built with the MERN stack (MongoDB, Express.js, React, Node.js) that demonstrates authentication, authorization, and CRUD operations with proper security practices.

## Features

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication with access and refresh tokens
- **Password Hashing**: Bcrypt for secure password storage
- **Role-Based Access Control (RBAC)**: Three-tier role system (Admin, Manager, User)
- **Session Management**: Automatic token refresh and secure cookie handling
- **Input Validation**: Server-side validation for all inputs

### User Management
- **Complete CRUD Operations**: Create, Read, Update, Delete users
- **Search & Filtering**: Search users by name/email, filter by role and status
- **Pagination**: Efficient pagination for large user lists
- **Soft Delete**: Deactivate users instead of permanent deletion
- **Audit Trail**: Track created/updated by and timestamps

### User Roles & Permissions

#### Administrator
- Full access to user management
- Create new users with any role
- Assign and change user roles
- Deactivate/reactivate users
- View system statistics and analytics
- Cannot be deleted by other admins

#### Manager
- View all users in the system
- Update non-admin user information
- View team statistics
- Limited admin capabilities

#### User
- View and update own profile only
- Change own password
- Cannot view other users
- Cannot change own role

### Frontend Features
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Role-Based Navigation**: Dynamic navigation based on user role
- **Real-time Validation**: Client-side form validation
- **Password Strength Indicator**: Visual feedback for password strength
- **Loading States**: Proper loading indicators and error handling
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **dotenv** for environment management

### Frontend
- **React 19** with Hooks
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Vite** for development and building

## Project Structure

```
UserVault/
client/
  src/
    components/          # Reusable UI components
      Navbar.jsx
      PrivateRoute.jsx
      Profile.jsx
      UserManagement.jsx
    context/             # React Context for state management
      AuthContext.jsx
    pages/               # Page components
      Home.jsx
      Login.jsx
      Register.jsx
      AdminDashboard.jsx
      ManagerDashboard.jsx
      UserDashboard.jsx
server/
  config/
    db.js               # Database configuration
  controllers/
    authController.js    # Authentication logic
    userController.js    # User management logic
  middleware/
    authMiddleware.js    # Authentication & authorization middleware
  models/
    User.js              # User model with schema
  routes/
    auth.js              # Authentication routes
    users.js             # User management routes
  server.js             # Express server setup
  seed.js               # Database seeding script
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd UserVault
```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key
NODE_ENV=development
```

### 4. Database Setup

#### Option 1: Seed with Sample Data
```bash
cd server
node seed.js
```

#### Option 2: Manual Setup
The system will create the database and collections automatically on first run.

### 5. Start the Application

#### Start Backend Server
```bash
cd server
npm start
```

#### Start Frontend Development Server
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Login Credentials

After running the seed script, you can use these credentials:

### Administrator
- **Email**: admin@example.com
- **Password**: admin123

### Manager
- **Email**: manager@example.com
- **Password**: manager123

### Regular Users
- **Email**: john@example.com
- **Password**: user123
- **Email**: jane@example.com
- **Password**: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/refresh` - Refresh access token

### User Management (Protected)
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin/Manager)
- `DELETE /api/users/:id` - Deactivate user (Admin only)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

## Security Features

### Authentication
- JWT tokens with expiration (15 minutes for access, 7 days for refresh)
- Secure, HTTP-only cookies for refresh tokens
- Automatic token refresh on expiration
- Password strength requirements

### Authorization
- Role-based access control on all endpoints
- Route-level protection in frontend
- Ownership checks for user profile updates
- Prevention of privilege escalation

### Data Protection
- Password hashing with bcrypt
- Input sanitization and validation
- No password exposure in API responses
- CORS configuration for secure cross-origin requests

## Usage Examples

### Registering a New User
```javascript
const userData = {
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'securepassword123'
};

const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});
```

### Creating a User (Admin Only)
```javascript
const newUser = {
  username: 'employee',
  email: 'employee@company.com',
  password: 'password123',
  role: 'user',
  status: 'active'
};

const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(newUser)
});
```

### Getting Users with Filters
```javascript
const params = new URLSearchParams({
  page: 1,
  limit: 10,
  role: 'user',
  status: 'active',
  search: 'john'
});

const response = await fetch(`/api/users?${params}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
ACCESS_TOKEN_SECRET=your_production_secret
REFRESH_TOKEN_SECRET=your_production_secret
```

### Deployment Options
- **Render**: Easy deployment for both frontend and backend
- **Vercel**: Frontend deployment with serverless functions
- **Netlify**: Static frontend with separate backend
- **Heroku**: Full-stack deployment
- **DigitalOcean**: Custom server deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced audit logging
- [ ] Real-time notifications
- [ ] File upload for profile pictures
- [ ] Bulk user operations
- [ ] API rate limiting
- [ ] Integration with external auth providers
- [ ] Advanced reporting and analytics

## Support

For support and questions, please open an issue on the GitHub repository.
