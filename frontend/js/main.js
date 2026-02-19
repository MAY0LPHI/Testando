// API Configuration
const API_URL = window.location.origin + '/api';

// Global state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadStatistics();
    
    // Update statistics every 5 seconds
    setInterval(loadStatistics, 5000);
});

async function initializeApp() {
    if (authToken) {
        try {
            await loadUserProfile();
            showUserInfo();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            logout();
        }
    }
    
    await loadLootboxes();
    await loadAlbums();
}

function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });
}

function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Form`).classList.add('active');
}

function showAuthModal(tab = 'login') {
    switchAuthTab(tab);
    document.getElementById('authModal').style.display = 'block';
}

function showDepositModal() {
    if (!authToken) {
        showAuthModal('login');
        return;
    }
    document.getElementById('depositModal').style.display = 'block';
}

async function register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        alert('Preencha todos os campos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showUserInfo();
            document.getElementById('authModal').style.display = 'none';
            alert(`Bem-vindo! Você ganhou R$ ${data.user.balance.toFixed(2)} de bônus!`);
            await loadUserProfile();
            await loadAlbums();
        } else {
            alert(data.error || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Erro ao criar conta');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Preencha todos os campos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showUserInfo();
            document.getElementById('authModal').style.display = 'none';
            await loadUserProfile();
            await loadAlbums();
        } else {
            alert(data.error || 'Email ou senha incorretos');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Erro ao fazer login');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showAuthButtons();
    window.location.reload();
}

function showUserInfo() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
}

function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
}

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            updateUserDisplay();
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Load profile error:', error);
        throw error;
    }
}

function updateUserDisplay() {
    if (currentUser) {
        document.getElementById('username').textContent = currentUser.username.toUpperCase();
        document.getElementById('userBalance').textContent = `R$ ${currentUser.balance.toFixed(2)}`;
    }
}

async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('statBoxes').textContent = stats.boxesOpened.toLocaleString('pt-BR');
        document.getElementById('statShipments').textContent = stats.shipments.toLocaleString('pt-BR');
        document.getElementById('statUsers').textContent = stats.users.toLocaleString('pt-BR');
        document.getElementById('statOnline').textContent = stats.online.toLocaleString('pt-BR');
    } catch (error) {
        console.error('Load statistics error:', error);
    }
}

function scrollToBoxes() {
    document.getElementById('lootboxes').scrollIntoView({ behavior: 'smooth' });
}

function showSection(section) {
    // Navigation logic for different sections
    switch(section) {
        case 'boxes':
            scrollToBoxes();
            break;
        case 'album':
            document.querySelector('.albums').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'profile':
            if (!authToken) {
                showAuthModal('login');
            } else {
                // Show profile section
                alert('Perfil em desenvolvimento');
            }
            break;
        case 'support':
            alert('Suporte: suporte@surpriseboxjor.com');
            break;
        case 'shop':
            alert('Lojinha em desenvolvimento');
            break;
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });
    
    return response;
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple alert for now, can be enhanced with custom notifications
    alert(message);
}
