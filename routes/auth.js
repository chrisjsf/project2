const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { name, email, roll, password, confirmPassword } = req.body;

  if (!name || !email || !roll || !password || !confirmPassword) {
    req.session.error = 'Please fill in all required fields.';
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    req.session.error = 'Passwords do not match.';
    return res.redirect('/register');
  }

  if (password.length < 6) {
    req.session.error = 'Password must be at least 6 characters long.';
    return res.redirect('/register');
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRoll = roll.trim().toUpperCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      req.session.error = 'This email is already registered.';
      return res.redirect('/register');
    }

    const existingRoll = await User.findOne({ roll: normalizedRoll });
    if (existingRoll) {
      req.session.error = 'This roll number is already registered.';
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      roll: normalizedRoll,
      password: hashedPassword
    });

    req.session.message = 'Registration successful. Please log in.';
    return res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error.message);
    req.session.error = 'Unable to register right now. Please try again.';
    return res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.error = 'Email and password are required.';
    return res.redirect('/login');
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !user.password) {
      req.session.error = 'Invalid email or password.';
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);

    if (!isMatch) {
      req.session.error = 'Invalid email or password.';
      return res.redirect('/login');
    }

    req.session.userId = user._id.toString();
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roll: user.roll
    };

    req.session.message = `Welcome back, ${user.name}!`;
    return res.redirect('/items');
  } catch (error) {
    console.error('Login error:', error.message);
    req.session.error = 'Unable to log in right now. Please try again.';
    return res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
    }
    res.redirect('/');
  });
});

module.exports = router;
