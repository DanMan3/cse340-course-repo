import bcrypt from 'bcrypt';
import { createUser, authenticateUser } from '../models/users.js';
import { body, validationResult } from 'express-validator';

const showUserRegistrationForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(e => req.flash('error', e.msg));
      return res.redirect('/register');
    }

    const { name, email, password } = req.body;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await createUser(name, email, passwordHash);

    req.flash('success', 'Account created successfully!');
    res.redirect('/login');
  } catch (err) {
    if (err.code === '23505') {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }
    next(err);
  }
};

const showLoginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(e => req.flash('error', e.msg));
      return res.redirect('/login');
    }

    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    if (user) {
      req.session.user = user;
      req.flash('success', 'Login successful');
      return res.redirect('/dashboard');
    }

    req.flash('error', 'Login failed — check email and password');
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
};

// Middleware to require login
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'You must be logged in to view that page');
  return res.redirect('/login');
};

// Middleware factory to require a specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role_name === role) {
      return next();
    }
    req.flash('error', 'You do not have permission to view that page');
    return res.redirect('/');
  };
};

// Dashboard controller
const showDashboard = (req, res) => {
  const { name, email } = req.session.user || {};
  res.render('dashboard', { title: 'Dashboard', name, email });
};

const processLogout = (req, res, next) => {
  if (!req.session) return res.redirect('/login');

  delete req.session.user;
  req.flash('success', 'Logged out successfully');

  req.session.save(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
};

const userRegistrationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').normalizeEmail().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
];

const userLoginValidation = [
  body('email').normalizeEmail().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required')
];

export {
  showUserRegistrationForm,
  processUserRegistrationForm,
  userRegistrationValidation,
  showLoginForm,
  processLoginForm,
  processLogout,
  userLoginValidation,
  requireLogin,
  requireRole,
  showDashboard
};