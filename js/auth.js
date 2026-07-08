// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = "1521537524462391447";
const REDIRECT_URI = "https://al4mer.github.io/NexusAI/index.html"; 
// WICHTIG: Discord leitet dich zu index.html → also muss das hier stehen
const SCOPES = "identify guilds";

// Login with Discord
function loginWithDiscord() {
    const authUrl =
        `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

    window.location.href = authUrl;
}

// Handle OAuth callback (wird auf index.html ausgeführt)
async function handleOAuthCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) return; // Kein Code → kein Login

    try {
        const response = await fetch("https://nexusai.alamer.workers.dev/auth/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                redirect_uri: REDIRECT_URI,
                client_id: DISCORD_CLIENT_ID
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Token speichern
            localStorage.setItem("discordToken", data.access_token);
            localStorage.setItem("discordUser", JSON.stringify(data.user));

            // Weiter zum Dashboard
            window.location.href = "./dashboard.html";
        } else {
            alert("❌ Token-Austausch fehlgeschlagen!");
        }
    } catch (err) {
        alert("❌ Authentifizierungsfehler!");
    }
}

// Logout
function logout() {
    localStorage.removeItem("discordToken");
    localStorage.removeItem("discordUser");
    window.location.href = "./index.html";
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("discordToken") !== null;
}

// Get logged in user info
function getUser() {
    const userJson = localStorage.getItem("discordUser");
    return userJson ? JSON.parse(userJson) : null;
}

// Update auth button based on login state
function updateAuthButton() {
    const loginBtn = document.getElementById("login-btn");
    const authBtn = document.getElementById("auth-btn");

    if (isLoggedIn()) {
        if (loginBtn) loginBtn.style.display = "none";
        if (authBtn) authBtn.style.display = "block";
    } else {
        if (loginBtn) loginBtn.style.display = "block";
        if (authBtn) authBtn.style.display = "none";
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    updateAuthButton();

    // WICHTIG: Code wird auf index.html abgefangen
    handleOAuthCallback();
});
