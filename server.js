require('dotenv').config();
require('./config/passport'); // Import Passport configuration
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const port = require('./config/database').port;
const app = express();


// session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from view folder (for navbar.html, etc.)
app.use(express.static(path.join(__dirname, 'view')));

app.use('/auth', require('./routes/auth'));
app.use('/foods',require('./routes/foods'));
app.use('/user',require('./routes/user'));
app.use('/orders',require('./routes/orders'));
app.use('/merchant',require('./routes/merchant'));
app.use('/driver',require('./routes/driver'));
app.use('/admin',require('./routes/admin'));
app.use('/messages',require('./routes/messages'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

app.get('/profile', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'profile.html'));
});

app.get('/merchant-dashboard', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'merchant-dashboard.html'));
});

app.get('/admin-dashboard', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'admin-dashboard.html'));
});

app.get('/driver-dashboard', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'driver-dashboard.html'));
});

app.get('/messages', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'messages.html'));
});


mongoose.connect(process.env.URL)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(port, () => {
            console.log(`Express app listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });


function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/login');
}

