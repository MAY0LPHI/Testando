// Main JavaScript for SurpriseBoxJor
// Handles navigation, user state, statistics updates

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// User State Management
class UserState {
    constructor() {
        this.balance = parseFloat(localStorage.getItem('userBalance') || '0.01');
        this.username = localStorage.getItem('username') || 'MARCELO';
        this.userId = localStorage.getItem('userId') || this.generateUserId();
    }

    generateUserId() {
        const id = 'user_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('userId', id);
        return id;
    }

    getBalance() {
        return this.balance;
    }

    setBalance(amount) {
        this.balance = parseFloat(amount);
        localStorage.setItem('userBalance', this.balance.toString());
        this.updateBalanceDisplay();
    }

    addBalance(amount) {
        this.setBalance(this.balance + parseFloat(amount));
    }

    deductBalance(amount) {
        if (this.balance >= amount) {
            this.setBalance(this.balance - parseFloat(amount));
            return true;
        }
        return false;
    }

    updateBalanceDisplay() {
        const balanceElements = document.querySelectorAll('#userBalance');
        balanceElements.forEach(el => {
            el.textContent = this.balance.toFixed(2).replace('.', ',');
        });
    }

    updateUsernameDisplay() {
        const nameElements = document.querySelectorAll('#userName');
        nameElements.forEach(el => {
            el.textContent = this.username;
        });
    }
}

// Initialize user state
const userState = new UserState();

// Statistics Animation
class Statistics {
    constructor() {
        this.stats = {
            boxesOpened: 12097,
            shipments: 9032,
            totalUsers: 37142,
            onlineUsers: 199
        };
        this.animateCounters();
        this.startRealTimeUpdates();
    }

    animateCounters() {
        const animateValue = (element, start, end, duration) => {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
            }, 16);
        };

        const boxesEl = document.getElementById('boxesOpened');
        const shipmentsEl = document.getElementById('shipments');
        const usersEl = document.getElementById('totalUsers');
        const onlineEl = document.getElementById('onlineUsers');

        if (boxesEl) animateValue(boxesEl, 0, this.stats.boxesOpened, 2000);
        if (shipmentsEl) animateValue(shipmentsEl, 0, this.stats.shipments, 2000);
        if (usersEl) animateValue(usersEl, 0, this.stats.totalUsers, 2000);
        if (onlineEl) animateValue(onlineEl, 0, this.stats.onlineUsers, 2000);
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            const random = Math.random();
            if (random < 0.3) {
                this.stats.boxesOpened += Math.floor(Math.random() * 5) + 1;
                const el = document.getElementById('boxesOpened');
                if (el) el.textContent = this.stats.boxesOpened.toLocaleString('pt-BR');
            }
            if (random < 0.2) {
                this.stats.shipments += Math.floor(Math.random() * 3) + 1;
                const el = document.getElementById('shipments');
                if (el) el.textContent = this.stats.shipments.toLocaleString('pt-BR');
            }
            if (random < 0.1) {
                this.stats.totalUsers += Math.floor(Math.random() * 2) + 1;
                const el = document.getElementById('totalUsers');
                if (el) el.textContent = this.stats.totalUsers.toLocaleString('pt-BR');
            }
            
            // Online users fluctuate
            const change = Math.floor(Math.random() * 7) - 3;
            this.stats.onlineUsers = Math.max(150, Math.min(250, this.stats.onlineUsers + change));
            const onlineEl = document.getElementById('onlineUsers');
            if (onlineEl) onlineEl.textContent = this.stats.onlineUsers.toLocaleString('pt-BR');
            
            // Update online counter in header
            const onlineBadges = document.querySelectorAll('.online-badge');
            onlineBadges.forEach(badge => {
                badge.textContent = `${this.stats.onlineUsers} ON-LINE`;
            });
        }, 5000); // Update every 5 seconds
    }
}

// Navigation
class Navigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.highlightCurrentNav();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('caixas')) return 'caixas';
        if (path.includes('album')) return 'album';
        if (path.includes('deposito')) return 'deposito';
        if (path.includes('perfil')) return 'perfil';
        if (path.includes('lojinha')) return 'lojinha';
        if (path.includes('suporte')) return 'suporte';
        return 'home';
    }

    highlightCurrentNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href') || '';
            if (href.includes(this.currentPage)) {
                item.classList.add('active');
            }
        });
    }
}

// API Helper
class API {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    static async getUserBalance() {
        try {
            const data = await this.request('/user/balance');
            return data.balance;
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            return userState.getBalance();
        }
    }

    static async updateBalance() {
        try {
            const balance = await this.getUserBalance();
            userState.setBalance(balance);
        } catch (error) {
            console.error('Failed to update balance:', error);
        }
    }
}

// Notification System
class NotificationSystem {
    static show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize user state display
    userState.updateBalanceDisplay();
    userState.updateUsernameDisplay();

    // Initialize statistics
    new Statistics();

    // Initialize navigation
    new Navigation();

    // Try to sync balance with server
    API.updateBalance().catch(err => {
        console.log('Running in offline mode');
    });

    // Welcome message for new users
    if (!localStorage.getItem('hasVisited')) {
        localStorage.setItem('hasVisited', 'true');
        setTimeout(() => {
            NotificationSystem.show('Bem-vindo! Ganhe R$ 4 ao se cadastrar!', 'success');
        }, 1000);
    }
});

// Export for use in other scripts
window.userState = userState;
window.API = API;
window.NotificationSystem = NotificationSystem;
