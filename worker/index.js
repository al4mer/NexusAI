/**
 * Cloudflare Worker for NexusAI
 * Handles API calls between dashboard and Discord bot
 */

// CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Main request handler
export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // Route requests
        if (path.startsWith('/api/user')) {
            return handleUserAPI(request, env);
        } else if (path.startsWith('/api/guilds')) {
            return handleGuildAPI(request, env, path);
        } else {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }
    }
};

// Handle user API
async function handleUserAPI(request, env) {
    const token = getAuthToken(request);
    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }

    try {
        // Get user info from Discord API
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await userResponse.json();

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

// Handle guild API
async function handleGuildAPI(request, env, path) {
    const token = getAuthToken(request);
    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }

    const pathParts = path.split('/');
    const guildId = pathParts[3];

    if (!guildId) {
        return new Response(JSON.stringify({ error: 'Guild ID required' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }

    try {
        if (path.includes('/settings')) {
            if (request.method === 'GET') {
                // Get guild settings from KV store
                const settings = await env.KV.get(`guild:${guildId}:settings`);
                return new Response(JSON.stringify(settings ? JSON.parse(settings) : {}), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'PATCH') {
                // Update guild settings
                const data = await request.json();
                await env.KV.put(`guild:${guildId}:settings`, JSON.stringify(data));
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        } else if (path.includes('/channels')) {
            // Get guild channels
            const channelsResponse = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
                headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
            });
            const channels = await channelsResponse.json();
            return new Response(JSON.stringify(channels), {
                status: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        } else if (path.includes('/personality')) {
            if (request.method === 'POST') {
                const data = await request.json();
                await env.KV.put(`guild:${guildId}:personality`, data.personality);
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'GET') {
                const personality = await env.KV.get(`guild:${guildId}:personality`);
                return new Response(JSON.stringify({ personality: personality || '' }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to extract auth token
function getAuthToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
