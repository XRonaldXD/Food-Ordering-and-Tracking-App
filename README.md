# 🍕 Food Ordering and Tracking App

A comprehensive food ordering and delivery tracking platform with real-time GPS tracking, automated notifications, and multi-role management system.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green)
![Express](https://img.shields.io/badge/Express-5.1.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)
![License](https://img.shields.io/badge/License-ISC-blue)

## 🌟 Features

### 👤 User Management
- **Google OAuth 2.0 Authentication** - Secure login with Google accounts
- **Multi-Role System** - Customer, Merchant, Driver, and Admin roles
- **Profile Management** - User profiles with pictures and personal information
- **Restaurant Management** - Merchants can manage their restaurant details

### 🛒 Shopping & Ordering
- **Browse Menu** - View available food items from different restaurants
- **Shopping Cart** - Add multiple items, adjust quantities, and checkout
- **Order Placement** - Place orders with custom notes and preferences
- **Order History** - Track all past and current orders
- **Real-time Status Updates** - Live order status tracking through lifecycle

### 📦 Order Management
Complete order lifecycle management with status progression:
```
Pending → Accepted → Preparing → Ready → Out for Delivery → Delivered
```

**Merchant Features:**
- View incoming orders dashboard
- Accept or reject orders with reasons
- Mark orders as preparing
- Notify when orders are ready for pickup

**Driver Features:**
- View available delivery jobs
- Accept delivery assignments
- Update GPS location (manual + automatic)
- Mark orders as delivered

### 📍 Real-Time GPS Tracking
- **Live Location Updates** - Track driver location in real-time
- **Interactive Maps** - Powered by Leaflet.js with custom markers
- **Route Visualization** - See the path between driver and customer
- **Estimated Delivery Time** - Dynamic ETA calculations
- **Auto-refresh** - Updates every 5 seconds for customers, 30 seconds for drivers
- **Visual Indicators** - Pulsing blue truck for driver, green house for customer

### 🔔 Automated Notification System
Smart system that automatically notifies users at every step:

- 🎉 **Order Created** - Confirmation for customer + alert for merchant
- ✅ **Order Accepted** - Merchant acceptance notification
- ❌ **Order Rejected** - Rejection with reason
- 👨‍🍳 **Order Preparing** - Kitchen status update
- 🍽️ **Order Ready** - Ready for pickup/delivery
- 🚚 **Out for Delivery** - With driver name and tracking link
- ✨ **Order Delivered** - Completion with rating prompt
- ➕ **Cart Updates** - Item additions and checkout confirmations
- 👋 **Welcome Message** - Greeting for new users

All notifications integrate seamlessly with the built-in messaging system.

### 💬 Messaging System
- Conversation-based messaging between users
- Unread message indicators
- System-generated automated messages
- Message history and threads

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.19.2** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **Express-session** - Session management

### Frontend
- **Bootstrap 5.3.0** - Responsive UI framework
- **Leaflet.js 1.9.4** - Interactive maps
- **HTML5 Geolocation API** - GPS positioning
- **Vanilla JavaScript** - Client-side logic

### Authentication
- **Google OAuth 2.0** - Secure authentication
- **Passport Google OAuth20 Strategy** - OAuth implementation

## 📁 Project Structure

```
Food-Ordering-and-Tracking-App/
├── config/
│   ├── database.js          # Database configuration
│   └── passport.js           # Passport OAuth setup + welcome messages
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User CRUD operations
│   ├── foodController.js     # Food item management
│   ├── orderController.js    # Order creation + notifications
│   ├── merchantOrderController.js  # Merchant order management
│   ├── driverController.js   # Driver delivery operations
│   ├── cartController.js     # Shopping cart logic
│   ├── messageController.js  # Messaging system
│   ├── trackingController.js # GPS tracking operations
│   └── adminController.js    # Admin functions
├── models/
│   ├── User.js              # User schema with roles
│   ├── Order.js             # Order schema with GPS fields
│   ├── Food.js              # Food item schema
│   ├── Cart.js              # Shopping cart schema
│   └── Message.js           # Message schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User routes
│   ├── foods.js             # Food routes
│   ├── orders.js            # Order routes
│   ├── merchant.js          # Merchant routes
│   ├── driver.js            # Driver routes
│   ├── cart.js              # Cart routes
│   ├── messages.js          # Message routes
│   ├── tracking.js          # GPS tracking routes
│   └── admin.js             # Admin routes
├── utils/
│   └── systemLogger.js      # Automated notification system (18 functions)
├── view/
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── profile.html         # User profile with Track Order
│   ├── food-details.html    # Food item details
│   ├── cart.html            # Shopping cart page
│   ├── messages.html        # Messaging interface
│   ├── merchant-dashboard.html  # Merchant control panel
│   ├── driver-dashboard.html    # Driver GPS interface
│   ├── order-tracking.html      # Live tracking map
│   ├── admin-dashboard.html     # Admin panel
│   ├── navbar.html          # Navigation bar
│   └── js/
│       └── checkAuth.js     # Authentication check
├── server.js                # Main application entry
├── package.json             # Dependencies
└── .env                     # Environment variables

```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console account (for OAuth)

### Step 1: Clone the Repository
```bash
git clone https://github.com/XRonaldXD/Food-Ordering-and-Tracking-App.git
cd Food-Ordering-and-Tracking-App
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database
URL=mongodb://localhost:27017/food-ordering-app
# Or use MongoDB Atlas:
# URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/food-ordering-app

# Server
PORT=3000

# Session
SESSION_SECRET=your-secret-key-here

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Step 4: Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Step 5: Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 API Documentation

### Authentication Endpoints
```
GET  /auth/google                    # Initiate Google OAuth
GET  /auth/google/callback           # OAuth callback
GET  /auth/logout                    # Logout user
```

### Order Endpoints
```
POST   /orders                       # Create new order
GET    /orders                       # Get user's orders
GET    /orders/:id                   # Get order details
DELETE /orders/:id                   # Cancel order
```

### Merchant Endpoints
```
GET  /merchant/orders                # Get merchant's orders
POST /merchant/orders/:id/accept     # Accept order
POST /merchant/orders/:id/reject     # Reject order with reason
POST /merchant/orders/:id/start-preparing  # Start preparing
POST /merchant/orders/:id/ready      # Mark order ready
```

### Driver Endpoints
```
GET  /driver/orders                  # Get available deliveries
POST /driver/orders/:id/accept       # Accept delivery
POST /driver/orders/:id/delivered    # Mark as delivered
```

### GPS Tracking Endpoints
```
POST /tracking/location                       # Update driver location
GET  /tracking/:orderId                       # Get order tracking data
POST /tracking/:orderId/delivery-location     # Set delivery location
POST /tracking/:orderId/estimated-time        # Update ETA
```

### Cart Endpoints
```
POST   /cart/add                     # Add item to cart
GET    /cart                         # Get cart items
DELETE /cart/:id                     # Remove cart item
PATCH  /cart/:id                     # Update cart item quantity
POST   /cart/checkout                # Checkout cart
```

### Message Endpoints
```
GET  /messages/conversations         # Get user conversations
GET  /messages/:conversationId       # Get conversation messages
POST /messages/send                  # Send message
```

## 👥 User Roles & Permissions

### Customer
- Browse and order food
- Track orders in real-time
- Manage shopping cart
- View order history
- Send/receive messages

### Merchant
- Manage food items
- View incoming orders
- Accept/reject orders
- Update order status
- Communicate with customers

### Driver
- View available deliveries
- Accept delivery jobs
- Update GPS location
- Mark orders delivered
- Navigate to customers

### Admin
- Manage all users
- Oversee all orders
- System administration
- Access all features

## 🎯 Key Workflows

### Customer Order Flow
1. **Login** with Google account → Receive welcome message
2. **Browse** food items from restaurants
3. **Add to Cart** → Get cart notification
4. **Checkout** → Order created notifications sent
5. **Wait for Acceptance** → Merchant accepts/rejects
6. **Track Progress** → Preparing → Ready notifications
7. **Track Delivery** → Real-time GPS map with driver location
8. **Receive Order** → Delivery confirmation + rating prompt

### Merchant Order Flow
1. **Receive Order** → New order notification
2. **Review Details** → Customer info, items, notes
3. **Accept/Reject** → Send notification to customer
4. **Start Preparing** → Update status → Customer notified
5. **Mark Ready** → Alert customer and drivers
6. **Hand to Driver** → Order out for delivery

### Driver Delivery Flow
1. **View Available Orders** → Ready orders list
2. **Accept Delivery** → Customer notified with driver name
3. **Update Location** → Automatic every 30s + manual updates
4. **Navigate to Customer** → Use GPS coordinates
5. **Deliver Order** → Mark delivered → Customer notified

## 🔧 System Logger Functions

The automated notification system includes 18 specialized functions:

- `logOrderCreated()` - Order creation confirmation
- `logOrderAccepted()` - Merchant acceptance
- `logOrderRejected()` - Order rejection with reason
- `logOrderPreparing()` - Kitchen preparation status
- `logOrderReady()` - Ready for pickup/delivery
- `logOrderOutForDelivery()` - Driver pickup with name
- `logOrderDelivered()` - Delivery completion
- `logOrderCancelled()` - Order cancellation
- `logCartItemAdded()` - Item added to cart
- `logCartCheckout()` - Checkout confirmation
- `logFoodCreated()` - New menu item
- `logFoodDeleted()` - Menu item removed
- `logDriverAssigned()` - Driver assignment
- `logWelcomeMessage()` - New user greeting
- `logMerchantOrderNotification()` - New order alert
- `logDriverOrderAvailable()` - Delivery available

## 🗺️ GPS Tracking Features

### Customer View
- Live map showing driver location
- Delivery address marker
- Route visualization
- Auto-refresh every 5 seconds
- Order status timeline
- Estimated delivery time
- Driver information

### Driver Interface
- Manual location update button
- Automatic updates every 30 seconds
- High-accuracy GPS positioning
- Loading indicators
- Error handling for denied permissions
- Visual feedback on successful updates

### Map Components
- **Driver Marker** - Blue truck icon (pulsing animation)
- **Customer Marker** - Green house icon
- **Route Line** - Dashed line connecting locations
- **Pan/Zoom Controls** - Interactive map navigation
- **Auto-centering** - Fits both markers in view

## 🔒 Security Features

- **OAuth 2.0** - Secure authentication via Google
- **Session Management** - Express-session with secure secrets
- **Role-based Access Control** - Middleware for route protection
- **Input Validation** - Mongoose schema validation
- **Environment Variables** - Sensitive data in `.env`
- **Authentication Middleware** - `isLoggedIn` and role checks

## 🧪 Testing the Application

### Test User Roles
After first login, manually update user roles in MongoDB:

```javascript
// Set user as merchant
db.users.updateOne(
  { email: "merchant@example.com" },
  { $set: { role: "merchant", restaurantName: "Test Restaurant" } }
)

// Set user as driver
db.users.updateOne(
  { email: "driver@example.com" },
  { $set: { role: "driver" } }
)

// Set user as admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Test Order Flow
1. Login as **Customer** → Browse and place order
2. Login as **Merchant** → Accept order and update status
3. Login as **Driver** → Accept delivery and update location
4. Check **Messages** → Verify all notifications received

### Test GPS Tracking
1. Create and accept an order
2. Assign to driver
3. Open order tracking page
4. Driver updates location
5. Verify map updates in real-time

## 📊 Database Models

### User Model
```javascript
{
  googleId: String (unique),
  name: String (required),
  email: String (required, unique),
  profilePicture: String,
  role: Enum ['customer', 'merchant', 'driver', 'admin'],
  restaurantName: String (for merchants)
}
```

### Order Model
```javascript
{
  foodId: ObjectId (ref: Food),
  merchantId: ObjectId (ref: User),
  driverId: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  status: Enum [pending, accepted, preparing, ready, out_for_delivery, delivered, rejected, cancelled],
  quantity: Number,
  totalAmount: Number,
  notes: String,
  driverLocation: { latitude, longitude, lastUpdated },
  deliveryLocation: { latitude, longitude, address },
  estimatedDeliveryTime: Date,
  rejectionReason: String
}
```

### Message Model
```javascript
{
  conversationId: String,
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🐛 Troubleshooting

### Server won't start
- Check if MongoDB is running
- Verify `.env` file exists with correct values
- Ensure port 3000 is not in use

### Google OAuth not working
- Verify Client ID and Secret in `.env`
- Check authorized redirect URIs in Google Console
- Ensure callback URL matches exactly

### GPS tracking not updating
- Check browser location permissions
- Verify driver has active order
- Check console for JavaScript errors
- Ensure internet connection is stable

### Notifications not appearing
- Verify system user was created (check server logs)
- Check message model and routes
- Ensure systemLogger is imported in controllers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**XRonaldXD**
- GitHub: [@XRonaldXD](https://github.com/XRonaldXD)
- Repository: [Food-Ordering-and-Tracking-App](https://github.com/XRonaldXD/Food-Ordering-and-Tracking-App)

## 🙏 Acknowledgments

- Bootstrap team for the UI framework
- Leaflet.js for mapping capabilities
- Google for OAuth 2.0 authentication
- MongoDB team for the database
- Express.js community

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/XRonaldXD/Food-Ordering-and-Tracking-App/issues)
- Contact via GitHub profile

---

**Built with ❤️ using Node.js, Express, MongoDB, and Leaflet.js**
