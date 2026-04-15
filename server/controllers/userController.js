import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users with pagination, search, and filtering (Admin/Manager only)
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    res.status(200).json({
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single user by ID (with proper authorization)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile, managers and admins can view any
    if (req.user.role === 'user' && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user', status = 'active' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      status,
      createdBy: req.user.id
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Update user (with proper authorization)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, status, currentPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization checks
    const isOwnProfile = req.user.id === id;
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    // Users can only update their own profile, managers can update non-admin users, admins can update anyone
    if (!isOwnProfile && !isAdmin && !(isManager && user.role !== 'admin')) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Role and status changes require admin privileges
    if ((role || status) && !isAdmin) {
      return res.status(403).json({ message: "Only admins can change role or status" });
    }

    // Prevent users from changing their own role
    if (role && isOwnProfile) {
      return res.status(403).json({ message: "Cannot change your own role" });
    }

    // Update fields
    if (username) user.username = username;
    if (email && email !== user.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (status) user.status = status;

    // Password change (for own profile or admin)
    if (newPassword) {
      if (isOwnProfile) {
        // User must provide current password to change their own password
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change password" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedBy = req.user.id;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Soft delete/deactivate user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(403).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of other admins (unless you're also an admin)
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Soft delete by setting status to inactive
    user.status = 'inactive';
    user.updatedBy = req.user.id;
    await user.save();

    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedBy = req.user.id;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};