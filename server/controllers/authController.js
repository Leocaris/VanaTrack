import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { seedDatabase } from '../seed/seedData.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'vanatrack_production_jwt_secret_key_2026_climate',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password incorrect',
      });
    }

    const token = generateToken(user._id);

    // Record login audit event
    await logAudit({
      user,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      recordTitle: user.name,
      reason: `User logged in with role [${user.role}]`,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for project manager selection / team lists)
// @route   GET /api/auth/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Admin only
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, organization } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'viewer',
      organization: organization || 'Akshaya Vana Climate Ventures',
    });

    await logAudit({
      user: req.user,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id,
      recordTitle: newUser.name,
      reason: `New user account created with role [${newUser.role}]`,
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset / Seed database
// @route   POST /api/auth/seed
// @access  Admin or public in development
export const triggerSeed = async (req, res, next) => {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Database successfully seeded with demo and benchmark test data!',
    });
  } catch (error) {
    next(error);
  }
};
