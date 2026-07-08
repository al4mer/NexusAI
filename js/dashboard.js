// Dashboard functionality

let currentServer = null;
let servers = [];

// Initialize dashboard
async function initDashboard() {
    const token = localStorage.getItem('discordToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    await loadServers();
    loadApiKeys();
}

// Load servers
async function loadServers() {
    try {
        const serverList = document.getElementById('serverList');
        serverList.innerHTML = '<div class="loading">Server werden geladen...</div>';
        
        // Placeholder - Replace with actual API call
        servers = [
            { id: '123456', name: 'Test Server', icon: '🎮' },
            { id: '234567', name: 'Dev Server', icon: '⚙️' }
        ];
        
        serverList.innerHTML = '';
        servers.forEach(server => {
            const item = document.createElement('div');
            item.className = 'server-item';
            item.textContent = `${server.icon} ${server.name}`;
            item.onclick = () => selectServer(server);
            serverList.appendChild(item);
        });
        
        if (servers.length > 0) {
            selectServer(servers[0]);
        }
    } catch (error) {
        console.error('Error loading servers:', error);
        document.getElementById('serverList').innerHTML = '<div class="loading">Fehler beim Laden der Server</div>';
    }
}

// Select server
function selectServer(server) {
    currentServer = server;
    document.querySelectorAll('.server-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    loadServerSettings();
}

// Load server settings
async function loadServerSettings() {
    if (!currentServer) return;
    
    try {
        // Load language
        const langResponse = await getLanguage(currentServer.id);
        document.getElementById('currentLanguage').textContent = langResponse.language || 'Deutsch';
        document.getElementById('languageSelect').value = langResponse.language || 'de';
        
        // Load AI channel
        const channelResponse = await getAiChannel(currentServer.id);
        if (channelResponse.channelId) {
            document.getElementById('channelSelect').value = channelResponse.channelId;
        }
        
        // Load API keys
        await loadApiKeys();
        
        document.getElementById('serverCount').textContent = servers.length;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load API keys
async function loadApiKeys() {
    if (!currentServer) return;
    
    try {
        const keysList = document.getElementById('keysList');
        keysList.innerHTML = '<div class="loading">Keys werden geladen...</div>';
        
        const keysResponse = await getApiKeys(currentServer.id);
        const keys = keysResponse.keys || [];
        
        if (keys.length === 0) {
            keysList.innerHTML = '<p>Keine API Keys vorhanden. Füge einen hinzu!</p>';
            return;
        }
        
        keysList.innerHTML = '';
        keys.forEach(key => {
            const item = document.createElement('div');
            item.className = 'key-item';
            item.innerHTML = `
                <div class="key-info">
                    <strong>${key.name}</strong>
                    <span class="key-status">● Aktiv</span>
                </div>
                <button onclick="deleteKey('${key.id}')" class="btn-delete">🗑️ Löschen</button>
            `;
            keysList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading API keys:', error);
        document.getElementById('keysList').innerHTML = '<div class="loading">Fehler beim Laden der Keys</div>';
    }
}

// Add API key
async function addKey() {
    const keyInput = document.getElementById('newKeyInput');
    const key = keyInput.value.trim();
    
    if (!key) {
        alert('Bitte geben Sie einen API Key ein');
        return;
    }
    
    if (!currentServer) {
        alert('Bitte wählen Sie einen Server');
        return;
    }
    
    try {
        // Prompt for key name
        const keyName = prompt('Name für diesen API Key:');
        if (!keyName) return;
        
        await addApiKey(currentServer.id, keyName, key);
        
        keyInput.value = '';
        await loadApiKeys();
        alert('✅ API Key hinzugefügt!');
    } catch (error) {
        console.error('Error adding key:', error);
        alert('❌ Fehler beim Hinzufügen des Keys');
    }
}

// Delete API key
async function deleteKey(keyId) {
    if (!currentServer) return;
    
    if (!confirm('Sind Sie sicher, dass Sie diesen Key löschen möchten?')) {
        return;
    }
    
    try {
        await deleteApiKey(currentServer.id, keyId);
        await loadApiKeys();
        alert('✅ API Key gelöscht!');
    } catch (error) {
        console.error('Error deleting key:', error);
        alert('❌ Fehler beim Löschen des Keys');
    }
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load keys when opening keys tab
    if (tabName === 'keys') {
        loadApiKeys();
    }
}

// Save settings
async function saveLanguage() {
    if (!currentServer) return;
    
    const language = document.getElementById('languageSelect').value;
    try {
        await setLanguage(currentServer.id, language);
        console.log('✅ Sprache gespeichert:', language);
    } catch (error) {
        console.error('Error saving language:', error);
    }
}

async function saveChannel() {
    if (!currentServer) return;
    
    const channel = document.getElementById('channelSelect').value;
    try {
        await setAiChannel(currentServer.id, channel);
        console.log('✅ Channel gespeichert:', channel);
    } catch (error) {
        console.error('Error saving channel:', error);
    }
}

async function saveAutoReply() {
    const enabled = document.getElementById('autoReplyToggle').checked;
    console.log('Saving auto-reply:', enabled);
}

async function savePersonality() {
    if (!currentServer) return;
    
    const personality = document.getElementById('personalityEditor').value;
    try {
        await saveGuildPersonality(currentServer.id, personality);
        alert('✅ Persönlichkeit gespeichert!');
    } catch (error) {
        console.error('Error saving personality:', error);
        alert('❌ Fehler beim Speichern');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);
