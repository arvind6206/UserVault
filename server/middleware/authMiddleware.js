import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token format is invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Fetch fresh user data to check status and role
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ message: "Account is inactive" });
    }
    
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(403).json({ message: "User role not found" });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Access denied. Required roles: " + allowedRoles.join(", "),
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }
    
    next();
  };
};

// Role-specific middleware functions
export const requireAdmin = verifyRole('admin');
export const requireManagerOrAdmin = verifyRole('manager', 'admin');
export const requireUser = verifyRole('user', 'manager', 'admin');

// Check if user can access their own resource or has admin privileges
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const currentUserId = req.user.id;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'admin' || currentUserId === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ message: "Access denied. You can only access your own resources." });
  };
};