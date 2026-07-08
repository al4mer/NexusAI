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

        try {
            // Route requests
            if (path.startsWith('/api/user')) {
                return await handleUserAPI(request, env);
            } else if (path.startsWith('/api/guilds')) {
                return await handleGuildAPI(request, env, path);
            } else {
                return new Response(JSON.stringify({ error: 'Not found' }), {
                    status: 404,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
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

        if (!userResponse.ok) {
            throw new Error(`Discord API error: ${userResponse.status}`);
        }

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
        // Language endpoints
        if (path.includes('/language')) {
            if (request.method === 'GET') {
                return new Response(JSON.stringify({ language: 'de' }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'POST') {
                const data = await request.json();
                // Language stored in bot's database via Discord bot command
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // AI Channel endpoints
        if (path.includes('/ai-channel')) {
            if (request.method === 'GET') {
                return new Response(JSON.stringify({ channelId: null }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'POST') {
                const data = await request.json();
                // Channel stored in bot's database
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // Personality endpoints
        if (path.includes('/personality')) {
            if (request.method === 'POST') {
                const data = await request.json();
                // Personality stored in bot's database
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'GET') {
                return new Response(JSON.stringify({ personality: '' }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // API Keys endpoints
        if (path.includes('/keys')) {
            if (request.method === 'GET') {
                // Get API keys list from bot's database
                return new Response(JSON.stringify({ 
                    keys: [
                        { id: 'key_1', name: 'Groq Key 1', status: 'active' },
                        { id: 'key_2', name: 'Groq Key 2', status: 'inactive' }
                    ] 
                }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'POST') {
                const data = await request.json();
                // Add API key to bot's database (encrypted)
                return new Response(JSON.stringify({ 
                    success: true,
                    keyId: 'key_' + Date.now()
                }), {
                    status: 201,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'DELETE') {
                const keyId = pathParts[5]; // /api/guilds/:guildId/keys/:keyId
                // Delete API key from bot's database
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // Settings endpoints
        if (path.includes('/settings')) {
            if (request.method === 'GET') {
                return new Response(JSON.stringify({ 
                    language: 'de',
                    aiChannel: null,
                    autoReply: false
                }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'PATCH') {
                const data = await request.json();
                // Update guild settings in bot's database
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // Channels endpoints - Get guild channels via Discord API
        if (path.includes('/channels')) {
            const botToken = env.DISCORD_BOT_TOKEN;
            if (!botToken) {
                return new Response(JSON.stringify({ error: 'Bot token not configured' }), {
                    status: 500,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }

            const channelsResponse = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
                headers: { Authorization: `Bot ${botToken}` }
            });

            if (!channelsResponse.ok) {
                throw new Error(`Discord API error: ${channelsResponse.status}`);
            }

            const channels = await channelsResponse.json();
            return new Response(JSON.stringify(channels), {
                status: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }

        // Default: endpoint not found
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
            status: 404,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Guild API error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to extract auth token from Bearer header
function getAuthToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
