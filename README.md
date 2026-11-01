# Campus Lost & Found Portal

A simple college mini-project built with Node.js, Express.js, MongoDB, and EJS for reporting and tracking lost and found items on campus.

## Project Purpose

This portal helps students:

- report lost items
- report found items
- browse available campus listings
- submit claims for found items
- track their own reports and claims

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- HTML + CSS
- bcryptjs
- express-session
- connect-mongo
- dotenv

## Folder Structure

```text
campus-lost-found/
├── models/
│   ├── User.js
│   ├── Item.js
│   └── Claim.js
├── routes/
│   ├── auth.js
│   ├── items.js
│   └── claims.js
├── middleware/
│   └── auth.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── browse.ejs
│   ├── report.ejs
│   ├── claim.ejs
│   ├── my-reports.ejs
│   ├── my-claims.ejs
│   └── error.ejs
├── public/
│   └── style.css
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── vercel.json
└── README.md
```

## Prerequisites

Before running the project, install:

- Node.js (v18 or higher recommended)
- MongoDB (local installation or MongoDB Atlas)
- npm

## Install Dependencies

```bash
cd campus-lost-found
npm install
```

## Configure Environment Variables

Create a `.env` file from the example file.

```bash
cp .env.example .env
```

Update the settings inside `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/campus_lost_found_fresh
SESSION_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

## Start MongoDB Locally

If MongoDB is installed locally, start it with:

```bash
mongod
```

If you are using MongoDB Compass or a service, make sure the URI points to the correct database.

## Run the Application

```bash
npm start
```

For development mode:

```bash
npm run dev
```

Open the app in the browser:

```text
http://localhost:3000
```

## MongoDB Atlas Setup

1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster.
3. Create a database user.
4. Allow network access from your IP address.
5. Get the MongoDB connection string.
6. Replace the `MONGO_URI` in your `.env` file with the Atlas connection string.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_lost_found
SESSION_SECRET=your_secret_here
NODE_ENV=production
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Create a new project in Vercel.
3. Import the GitHub repository.
4. Add the required environment variables in the Vercel dashboard:
   - `MONGO_URI`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
5. Deploy the app.
6. Make sure the project uses the `vercel.json` configuration already included in the repository.

## GitHub Push Steps

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

## Features to Test

- User registration
- Duplicate email and roll number rejection
- User login and logout
- Lost item reporting
- Found item reporting
- Search and filter in browse page
- Claim submission for found items
- My Reports page
- My Claims page
- Protected routes for unauthenticated users

## Limitations

This is a beginner-friendly project designed for learning and demonstration. It does not include an admin approval workflow or a fully automated handover system. Claims are simple student submissions stored in MongoDB.

## Notes

- Do not commit the actual `.env` file.
- Keep the code simple, readable, and easy to explain in a viva or demo.
- Session storage is configured through MongoDB using `connect-mongo`.
