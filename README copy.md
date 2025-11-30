# 📚 Book Review NodeJS

A full-stack web application for managing book reviews with Google OAuth 2.0 authentication. Users can browse books, add reviews with star ratings, manage their own books and reviews, all with a modern dark-themed interface.

## 📋 Project Information

**Project Name:** Book Review NodeJS  
**Course:** COMP3810SEF
**Group Number:** 67
**Group Members:**
- Sham Hoi Kin - [14030537]
- Leung Lok Hang - [13896384]
- Liu Chin Yat - [13901860]
- Lau Chun Wang - [14102285]
- Leung Hou Jiu - [14099669]

## 🌐 Live Demo

**Cloud URL:** https://book-review-nodejs.onrender.com

## ✨ Features

- 🔐 **Google OAuth 2.0 Authentication** - Secure login with Google accounts
- 👤 **User Management** - User profiles with MongoDB persistence
- 📖 **Book Management** - Add, view, update, and delete books with ownership tracking
- ⭐ **Review System** - Write reviews with 1-5 star ratings and comments
- 📄 **Book Details Page** - View individual books with all their reviews
- 🎨 **Modern Dark Theme UI** - Beautiful gradient backgrounds and sleek design
- 🔒 **Protected Routes** - Authentication-required endpoints for creating content
- 🧩 **Reusable Components** - Dynamic navbar loaded across all pages
- 📱 **Responsive Design** - Fully responsive Bootstrap 5 layout
- 🎭 **Bootstrap Modals** - Professional confirmation and alert dialogs
- 🔄 **Dynamic Auth Status** - Navbar updates based on login status

## 📁 Project Structure

```
Book-Review-NodeJS/
├── config/                    # Configuration files
│   ├── database.js           # MongoDB connection & port config
│   └── passport.js           # Google OAuth 2.0 strategy setup
├── controllers/              # Business logic handlers
│   ├── authController.js     # Login, logout, session management
│   ├── bookController.js     # Book CRUD with ownership tracking
│   ├── reviewController.js   # Review CRUD with user attribution
│   └── userController.js     # User profile operations
├── models/                   # MongoDB Mongoose schemas
│   ├── User.js              # User model (googleId, name, email, profilePicture)
│   ├── Book.js              # Book model (title, author, description, publishedDate, createdBy)
│   └── Review.js            # Review model (bookId, rating, comment, createdBy)
├── routes/                   # Express route definitions
│   ├── auth.js              # /auth - Google OAuth & session routes
│   ├── books.js             # /books - Book API endpoints
│   ├── reviews.js           # /reviews - Review API endpoints
│   └── user.js              # /user - User-related routes
├── view/                     # Frontend HTML pages
│   ├── js/
│   │   └── checkAuth.js     # Navbar authentication checker
│   ├── index.html           # Home page with book grid
│   ├── login.html           # Google OAuth login page
│   ├── profile.html         # User dashboard with books & reviews
│   ├── book-details.html    # Individual book view with reviews
│   └── navbar.html          # Reusable navigation component
├── .env                      # Environment variables (not in repo)
├── .env.example             # Environment template
├── server.js                # Main application entry point
└── package.json             # Dependencies and scripts
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5.1.0
- **Database:** MongoDB Atlas / Local MongoDB
- **ODM:** Mongoose v8.19.2
- **Authentication:** Passport.js v0.7.0
- **OAuth Strategy:** passport-google-oauth20 v2.0.0
- **Session:** express-session v1.18.2

### Frontend
- **Markup:** HTML5
- **Styling:** CSS3 with custom dark theme
- **Framework:** Bootstrap 5.3.8
- **Icons:** Bootstrap Icons v1.11.0
- **Components:** Reusable navbar with dynamic loading

### Development
- **Auto-reload:** Nodemon v3.1.10
- **Environment:** dotenv v17.2.3

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation
- Google Cloud Console project with OAuth 2.0 credentials

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/XRonaldXD/Book-Review-NodeJS.git
cd Book-Review-NodeJS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/book-review?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Application type:** Web application
   - **Authorized redirect URIs:** `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

### 5. Start the Application

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📖 API Documentation

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/google` | Initiate Google OAuth flow | No |
| GET | `/auth/google/callback` | OAuth callback handler | No |
| GET | `/auth/logout` | Logout current user | Yes |
| GET | `/auth/me` | Get current logged-in user info | Yes |
| GET | `/auth/failure` | Authentication failure redirect | No |

**Example Response for `/auth/me`:**
```json
{
  "loggedIn": true,
  "user": {
    "_id": "user_id_here",
    "googleId": "google_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": "https://..."
  }
}
```

### Book Routes (`/books`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/books` | Create new book (auto-assigns createdBy) | Yes |
| GET | `/books` | Get all books | No |
| GET | `/books/:id` | Get specific book by ID | No |
| PUT | `/books/:id` | Update book | Yes |
| DELETE | `/books/:id` | Delete book | Yes |

**Example POST `/books` Request:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic novel about the American Dream...",
  "publishedDate": "1925-04-10"
}
```

### Review Routes (`/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Create new review (auto-assigns createdBy) | Yes |
| GET | `/reviews` | Get all reviews | No |
| GET | `/reviews/:id` | Get specific review by ID | No |
| PUT | `/reviews/:id` | Update review | Yes |
| DELETE | `/reviews/:id` | Delete review | Yes |

**Example POST `/reviews` Request:**
```json
{
  "bookId": "book_id_here",
  "rating": 5,
  "comment": "Absolutely loved this book! A must-read classic."
}
```

### User Routes (`/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user` | Get all users | No |
| GET | `/user/:id` | Get specific user by ID | No |

## 🎯 Usage Guide

### For End Users (Web Interface)

#### 1. **Home Page** (`/`)
- Browse all available books in a responsive grid layout
- Click on any book card to view details
- Navbar shows "Login" or "Logout" based on authentication status

#### 2. **Login** (`/login`)
- Click "Continue with Google" button
- Authenticate with your Google account
- Redirected to home page upon success

#### 3. **Book Details** (`/book-details.html?id=BOOK_ID`)
- View book information (title, author, description, published date)
- See all reviews for that book with ratings and comments
- **Add Review button** (only visible when logged in)
  - Click to open review modal
  - Select star rating (1-5)
  - Write your comment
  - Submit to create review

#### 4. **Profile Page** (`/profile`)
- **Requires authentication** - redirects to login if not logged in
- View your profile information (name, email, profile picture)
- **My Books Tab:**
  - View all books you've created
  - Delete your own books
  - "Add New Book" button opens modal to create new book
- **My Reviews Tab:**
  - View all reviews you've written
  - See star ratings and comments
  - Delete your own reviews

### For Developers (API Testing)

#### Using Thunder Client / Postman / Insomnia

1. **Login via Browser First:**
   - Navigate to `http://localhost:3000/auth/google`
   - Complete Google OAuth flow
   - This creates a session cookie (`connect.sid`)

2. **Copy Session Cookie:**
   - Open browser DevTools → Application/Storage → Cookies
   - Copy the `connect.sid` cookie value

3. **Make API Requests:**
   - Add cookie to request headers:
     ```
     Cookie: connect.sid=your-session-cookie-here
     ```
   - Now you can test protected endpoints

#### Example: Create a Book
```bash
POST http://localhost:3000/books
Headers: 
  Content-Type: application/json
  Cookie: connect.sid=your-session-cookie
Body:
{
  "title": "1984",
  "author": "George Orwell",
  "description": "A dystopian social science fiction novel",
  "publishedDate": "1949-06-08"
}
```

#### Example: Create a Review
```bash
POST http://localhost:3000/reviews
Headers:
  Content-Type: application/json
  Cookie: connect.sid=your-session-cookie
Body:
{
  "bookId": "675d8f9e1234567890abcdef",
  "rating": 5,
  "comment": "A masterpiece of dystopian literature!"
}
```

## 🔐 Security Features

- ✅ **Environment Variables** - Sensitive data stored in `.env` file
- ✅ **Session-Based Authentication** - Secure cookie-based sessions
- ✅ **Google OAuth 2.0** - No password storage, delegated authentication
- ✅ **Protected Routes** - Middleware checks for authentication
- ✅ **User Ownership** - Books and reviews tracked by creator
- ✅ **Sparse Unique Index** - Allows flexible user schema
- ✅ **HTTPS Ready** - Production-ready for secure deployment

## 🎨 UI Features

- 🌑 **Dark Theme** - Beautiful gradient backgrounds (#1a1a2e to #16213e)
- 🎭 **Bootstrap Modals** - Professional dialogs for confirmations and alerts
- 📱 **Responsive Grid** - Book cards adapt to all screen sizes
- ⭐ **Interactive Star Ratings** - Click to select, hover to preview
- 🧩 **Dynamic Navbar** - Loaded via fetch, updates auth status automatically
- 🎯 **Conditional Rendering** - UI elements show/hide based on login status
- 💫 **Smooth Transitions** - Hover effects and animations throughout

## 🌍 Deployment

### Deploy to Render/Heroku/Railway

1. **Update OAuth Callback:**
   - Go to Google Cloud Console → Credentials
   - Add production URL to Authorized redirect URIs:
     ```
     https://your-app.onrender.com/auth/google/callback
     ```
   - Update `GOOGLE_CALLBACK_URL` in production environment variables

2. **Set Environment Variables:**
   ```
   URL=mongodb+srv://...
   PORT=3000
   SESSION_SECRET=your-super-secret-key
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=https://your-app.onrender.com/auth/google/callback
   NODE_ENV=production
   ```

3. **MongoDB Atlas Setup:**
   - Whitelist IP address `0.0.0.0/0` to allow connections from anywhere
   - Or add specific IP ranges for your hosting provider

4. **Deploy:**
   - Connect your GitHub repository to hosting platform
   - Set start command: `npm start`
   - Deploy from `main` branch

### Important Notes for Production

- Ensure `server.js` is set as main entry point in `package.json`
- Static files are served from `/view` directory
- Session cookies work with HTTPS in production
- Test all OAuth flows after deployment

## 🐛 Troubleshooting

### Issue: Login button doesn't redirect
**Solution:** Check that `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are correctly set in `.env`

### Issue: "Add Review" button not showing
**Solution:** Make sure you're logged in. The button only appears for authenticated users.

### Issue: Session not persisting
**Solution:** Ensure `SESSION_SECRET` is set and cookies are enabled in your browser.

### Issue: MongoDB connection error
**Solution:** Verify `URL` in `.env` has correct credentials and MongoDB Atlas allows your IP address.

### Issue: Navbar not loading
**Solution:** Check that `view/navbar.html` exists and server is serving static files from `/view` directory.

## 📚 Key Concepts

### Authentication Flow
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Google sends authorization code to callback URL
4. Passport exchanges code for user profile
5. User saved/updated in MongoDB
6. Session created with serialized user ID
7. Cookie sent to browser with session ID

### Ownership Tracking
- Books and reviews have `createdBy` field (ObjectId reference to User)
- Automatically assigned from `req.user._id` when creating
- Used to filter "My Books" and "My Reviews" in profile page

### Dynamic Components
- `navbar.html` fetched and inserted into pages
- `checkNavbarAuth()` function updates login/logout button
- Called after navbar HTML is inserted into DOM

## CURL
### Books (`/books`)
#### 1. **Get** (`/books`)
```
curl -X GET https://book-review-nodejs.onrender.com/books
```
#### 2. **Post** (`/books`)
```
curl -X POST -H "Content-Type: application/json" -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" -d "{\"title\":\"API Demo Book\",\"author\":\"API Author\",\"description\":\"Created via RESTful API during demo\",\"publishedDate\":\"2025-11-26\"}" https://book-review-nodejs.onrender.com/books
```
#### 3. **Update** (`/books/:id`)
```
curl -X PUT -H "Content-Type: application/json" -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" -d "{\"description\":\"Updated via PUT request in demo\"}" https://book-review-nodejs.onrender.com/books/BOOK_ID_HERE
```
#### 4. **Delete** (`/books/:id`)
```
curl -X DELETE -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" https://book-review-nodejs.onrender.com/books/BOOK_ID_HERE
```

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**XRonaldXD**
- GitHub: [@XRonaldXD](https://github.com/XRonaldXD)
- Repository: [Book-Review-NodeJS](https://github.com/XRonaldXD/Book-Review-NodeJS)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/XRonaldXD/Book-Review-NodeJS/issues).

---

⭐ **If you found this project helpful, please give it a star!**

Made with ❤️ by XRonaldXD
