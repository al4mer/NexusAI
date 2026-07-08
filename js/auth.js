// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = "1521537524462391447";
const REDIRECT_URI = "https://al4mer.github.io/NexusAI/login.html";
const SCOPES = "identify guilds";

// Login with Discord
function loginWithDiscord() {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

// Handle OAuth callback
async function handleOAuthCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
        console.error('OAuth error:', error);
        alert('❌ Login fehlgeschlagen!');
        window.location.href = './index.html';
        return;
    }

    if (!code) {
        window.location.href = './index.html';
        return;
    }

    try {
        // Exchange code for access token via your backend
        const response = await fetch('https://nexusai.alamer.workers.dev/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                redirect_uri: REDIRECT_URI,
                client_id: DISCORD_CLIENT_ID
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Store token in localStorage
            localStorage.setItem('discordToken', data.access_token);
            localStorage.setItem('discordUser', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = './dashboard.html';
        } else {
            alert('❌ Token-Austausch fehlgeschlagen!');
            window.location.href = './index.html';
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('❌ Authentifizierungsfehler!');
        window.location.href = './index.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('discordToken');
    localStorage.removeItem('discordUser');
    window.location.href = './index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('discordToken') !== null;
}

// Get logged in user info
function getUser() {
    const userJson = localStorage.getItem('discordUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Update auth button based on login state
function updateAuthButton() {
    const loginBtn = document.getElementById('login-btn');
    const authBtn = document.getElementById('auth-btn');

    if (isLoggedIn()) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (authBtn) authBtn.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (authBtn) authBtn.style.display = 'none';
    }
}

// Invite bot to Discord server
function inviteBot() {
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands`;
    window.open(inviteUrl, '_blank');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    
    // Handle OAuth callback if on login page
    if (window.location.pathname.includes('login.html')) {
        handleOAuthCallback();
    }
});
