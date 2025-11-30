
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
        }
    } catch (error) {
        // User is not logged in
        isUserLoggedIn = false;
    }
}

checkAuthStatus();
