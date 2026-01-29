## COMP3133 – Assignment 1
Student ID: 101418340

### Tech Stack
- Node.js
- Express
- Apollo Server
- GraphQL
- MongoDB Atlas
- JWT Authentication

### How to Run
1. npm install
2. npm run dev
3. Server runs at http://localhost:4000/graphql

### Authentication
- Signup → Login → Use Bearer Token

### Sample User Detail (For Login Testing)
Use the following credentials to test authentication and protected endpoints:

- **Username:** testuser1  
- **Email:** testuser1@mail.com  
- **Password:** Password123  

> Note: This is a test user created for demonstration purposes only.

### Features Implemented
- Signup
- Login
- Get All Employees (protected)
- Add Employee
- Get Employee by ID
- Update Employee
- Delete Employee
- Search Employee
---

## 🗄 Database
- **Database Name:** `comp3133__101418340_assigment1`
- **Collections:**
  - users
  - employees

---

## Validation & Error Handling
- Salary validation (must be **≥ 1000**)
- Required field checks
- Duplicate email prevention
- JWT authorization enforcement
- Unauthorized access handling
- Errors returned in JSON format

> Input validation is enforced through business rules inside GraphQL resolvers.  
> `express-validator` is also implemented for validation routes.

---

## 🧪 Testing
- All APIs tested using **Postman**
- Screenshots included for:
  - Successful requests
  - Validation errors
  - Unauthorized access
- Postman collection exported and included in submission

---

## 🖼 Cloudinary Integration
- Employee profile images are uploaded via `/upload`
- Uploaded image URL is stored in `employee_photo`
- Cloudinary upload tested and verified using Postman


