require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campus_lost_found_dev_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found_fresh',
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session && req.session.user ? req.session.user : null;
  res.locals.message = req.session && req.session.message ? req.session.message : '';
  res.locals.error = req.session && req.session.error ? req.session.error : '';

  delete req.session.message;
  delete req.session.error;

  next();
});

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found_fresh';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.use('/', authRoutes);
app.use('/', itemRoutes);
app.use('/', claimRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you requested does not exist.'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  const userMessage = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again later.'
    : err.message;

  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: userMessage
  });
});

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = app;
