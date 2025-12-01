
let isUserLoggedIn = false;

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/me');
        if (response.ok) {
            const data = await response.json();
            isUserLoggedIn = true;
            // User is logged in - show Logout
            document.getElementById('authLink').href = '/auth/logout';
            document.getElementById('authIcon').className = 'bi bi-box-arrow-right';
            document.getElementById('authText').textContent = 'Logout';

            // Show messages for all logged-in users
            const messagesItem = document.getElementById('messagesItem');
            if (messagesItem) {
                messagesItem.style.display = 'block';
                // Load unread count
                updateUnreadCount();
            }

            // Show cart for logged-in users
            const cartItem = document.getElementById('cartItem');
            if (cartItem) {
                cartItem.style.display = 'block';
                // Load cart count
                updateCartCount();
            }

            // Show role-specific menu items
            if (data.user.role === 'merchant' || data.user.role === 'admin') {
                const merchantItem = document.getElementById('merchantDashboardItem');
                if (merchantItem) {
                    merchantItem.style.display = 'block';
                }
            }

            if (data.user.role === 'driver' || data.user.role === 'admin') {
                const driverItem = document.getElementById('driverDashboardItem');
                if (driverItem) {
                    driverItem.style.display = 'block';
                }
            }

            if (data.user.role === 'admin') {
                const adminItem = document.getElementById('adminDashboardItem');
                if (adminItem) {
                    adminItem.style.display = 'block';
                }
            }
        }
    } catch (error) {
        // User is not logged in
        isUserLoggedIn = false;
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('/cart/count');
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('cartBadge');
            if (badge) {
                if (data.count > 0) {
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error fetching cart count:', error);
    }
}

// Update unread message count
async function updateUnreadCount() {
    try {
        const response = await fetch('/messages/unread-count');
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('unreadBadge');
            if (badge) {
                if (data.count > 0) {
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
}

checkAuthStatus();

// Update unread count and cart count every 30 seconds if user is logged in
setInterval(() => {
    if (isUserLoggedIn) {
        updateUnreadCount();
        updateCartCount();
    }
}, 30000);
