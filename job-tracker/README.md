# Job Application Tracker - Backend API

A RESTful API for tracking job applications built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- CRUD operations for job applications
- Application status tracking (Applied, Interview, Offer, Rejected)
- Statistics dashboard
- Filter and search applications

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
bash
npm install


3. Create `.env` file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000


4. Start the server:
bash
npm run dev


Server runs on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Applications (Protected)
- GET `/api/applications` - Get all applications
- GET `/api/applications/stats` - Get statistics
- GET `/api/applications/:id` - Get single application
- POST `/api/applications` - Create application
- PUT `/api/applications/:id` - Update application
- DELETE `/api/applications/:id` - Delete application

## Project Structure

job-tracker/
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Application.js
├── routes/
│   ├── auth.js
│   └── applications.js
├── .env
└── server.js


## Author

Okon-Paul Esther - SIWES Project 2026