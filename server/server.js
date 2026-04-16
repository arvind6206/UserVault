import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

// Connect to database
try {
  connectDB();
} catch (error) {
  console.error('Database connection failed:', error);
}

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://user-management-frontend.onrender.com",
        "https://user-management-frontend.vercel.app",
        "https://user-management-frontend-ten.vercel.app",
        process.env.FRONTEND_URL
      ].filter(Boolean); // Remove undefined/null values
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));