# Job Tracker API Testing Guide

## Base URL
http://localhost:5000

## Authentication
All routes except register/login require:
- Header: `Authorization: Bearer YOUR_TOKEN`

---

## Auth Routes

### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Application Routes (All require token)

### 1. Get Statistics
- **GET** `/api/applications/stats`
- Returns: `{ stats: { total, applied, interview, offer, rejected } }`

### 2. Create Application
- **POST** `/api/applications`
- **Body:**
```json
{
  "companyName": "Google",
  "position": "Software Engineer",
  "status": "Applied",
  "location": "Lagos",
  "salaryRange": "500k-800k",
  "notes": "Applied via careers page"
}
```

### 3. Get All Applications
- **GET** `/api/applications`
- Optional query params:
  - `?status=Interview` (filter)
  - `?search=google` (search)
  - Can combine: `?status=Interview&search=engineer`

### 4. Get Single Application
- **GET** `/api/applications/:id`

### 5. Update Application
- **PUT** `/api/applications/:id`
- **Body:** (only fields you want to change)
```json
{
  "status": "Interview",
  "notes": "Interview scheduled for Monday"
}
```

### 6. Delete Application
- **DELETE** `/api/applications/:id`

---

## Testing Checklist

- [ ] Register new user
- [ ] Login returns token
- [ ] Create 4+ applications (different statuses)
- [ ] Get statistics shows correct counts
- [ ] Get all applications returns list
- [ ] Filter by status works
- [ ] Search by company/position works
- [ ] Update application changes data
- [ ] Delete application removes it
- [ ] Cannot access another user's applications

---

## Status Values (only these are allowed)
- Applied
- Interview  
- Offer
- Rejected
```

---

## **Your Updated Project Structure:**
```
job-tracker/
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Application.js
├── routes/
│   ├── auth.js
│   └── applications.js     ✅ UPDATED (added stats, filter, search)
├── .env
├── API_TESTS.md            ✅ NEW (documentation)
├── package.json
└── server.js