const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

//GET  /auth/google                    # Initiate Google OAuth
router.get("/google", AuthController.googleAuth);

//GET  /auth/google/callback           # Handle Google OAuth callback
router.get("/google/callback", AuthController.googleCallback);

//GET /auth/logout                     # Logout user
router.get("/logout", AuthController.logout);

//GET  /auth/profile                   # Get user profile
router.get("/profile", AuthController.getProfile);

//GET  /auth/me                        # Get current user info
router.get("/me", AuthController.getCurrentUser);

//GET  /auth/failure                   # Authentication failure
router.get("/failure", AuthController.authFailure);

module.exports = router;