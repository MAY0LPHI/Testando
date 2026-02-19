// Lootbox System
// Handles box opening animations and prize distribution

// Box configurations
const BOXES = {
    'skydrop-x': {
        id: 1,
        name: 'SKYDROP X',
        price: 5.00,
        badge: 'ALINHE 3 PARA GANHAR',
        prizes: [
            { name: 'NFT NÍVEL ALTO BOX DA JOR', rarity: 'legendary', probability: 0.05, image: 'nft-high.png' },
            { name: 'Fone Bluetooth Premium', rarity: 'epic', probability: 0.15, image: 'headphone.png' },
            { name: 'Carregador Portátil', rarity: 'rare', probability: 0.30, image: 'charger.png' },
            { name: 'Cabo USB-C', rarity: 'common', probability: 0.50, image: 'cable.png' }
        ]
    },
    'fortune-x': {
        id: 2,
        name: 'FORTUNE X',
        price: 27.90,
        badge: 'ALINHE 3 PARA GANHAR',
        prizes: [
            { name: 'iPhone 16', rarity: 'legendary', probability: 0.02, image: 'iphone16.png' },
            { name: 'AirPods Pro', rarity: 'epic', probability: 0.10, image: 'airpods.png' },
            { name: 'Caixa de Som JBL', rarity: 'rare', probability: 0.28, image: 'speaker.png' },
            { name: 'Mouse Gamer', rarity: 'common', probability: 0.60, image: 'mouse.png' }
        ]
    },
    'prime-fortune': {
        id: 3,
        name: 'PRIME FORTUNE',
        price: 49.99,
        badge: 'MELHOR ESCOLHA - SOMENTE PRÊMIOS FÍSICOS',
        prizes: [
            { name: 'iPhone 17', rarity: 'legendary', probability: 0.03, image: 'iphone17.png' },
            { name: 'PlayStation 5', rarity: 'legendary', probability: 0.05, image: 'ps5.png' },
            { name: 'Câmera GoPro', rarity: 'epic', probability: 0.12, image: 'gopro.png' },
            { name: 'Smart Watch', rarity: 'rare', probability: 0.30, image: 'smartwatch.png' },
            { name: 'Teclado Mecânico', rarity: 'common', probability: 0.50, image: 'keyboard.png' }
        ]
    },
    'ultra-fortune': {
        id: 4,
        name: 'ULTRA FORTUNE',
        price: 97.00,
        badge: 'SOMENTE PRÊMIOS FÍSICOS - CHANCE DOBRADA',
        prizes: [
            { name: 'iPhone 17 Pro Max', rarity: 'legendary', probability: 0.08, image: 'iphone17pro.png' },
            { name: 'PlayStation 5 Pro', rarity: 'legendary', probability: 0.10, image: 'ps5pro.png' },
            { name: 'MacBook Air', rarity: 'epic', probability: 0.15, image: 'macbook.png' },
            { name: 'iPad Pro', rarity: 'rare', probability: 0.27, image: 'ipad.png' },
            { name: 'Apple Watch Ultra', rarity: 'rare', probability: 0.40, image: 'applewatch.png' }
        ]
    },
    'skydrop-deluxe': {
        id: 5,
        name: 'SKYDROP DELUXE',
        price: 197.00,
        badge: 'SOMENTE PRÊMIOS FÍSICOS',
        prizes: [
            { name: 'iPhone 17 Pro Max 1TB', rarity: 'legendary', probability: 0.12, image: 'iphone17pro.png' },
            { name: 'PS5 + 3 Jogos', rarity: 'legendary', probability: 0.15, image: 'ps5-bundle.png' },
            { name: 'MacBook Pro 14"', rarity: 'epic', probability: 0.20, image: 'macbookpro.png' },
            { name: 'iPad Pro + Apple Pencil', rarity: 'epic', probability: 0.28, image: 'ipad-bundle.png' },
            { name: 'AirPods Max', rarity: 'rare', probability: 0.25, image: 'airpodsmax.png' }
        ]
    },
    'diamond-edition': {
        id: 6,
        name: 'DIAMOND EDITION',
        price: 497.00,
        badge: 'SOMENTE PRÊMIOS FÍSICOS',
        prizes: [
            { name: 'iPhone 17 Pro Max + MacBook', rarity: 'legendary', probability: 0.20, image: 'mega-bundle.png' },
            { name: 'MacBook Pro 16" M3 Max', rarity: 'legendary', probability: 0.25, image: 'macbookpro16.png' },
            { name: 'PlayStation 5 Pro + TV 55"', rarity: 'legendary', probability: 0.18, image: 'ps5-tv.png' },
            { name: 'iPad Pro 12.9" + Magic Keyboard', rarity: 'epic', probability: 0.22, image: 'ipad-magic.png' },
            { name: 'iPhone 17 Pro Max', rarity: 'epic', probability: 0.15, image: 'iphone17pro.png' }
        ]
    }
};

class LootboxSystem {
    constructor(boxId) {
        this.boxId = boxId;
        this.boxConfig = BOXES[boxId];
        
        if (!this.boxConfig) {
            console.error('Invalid box ID:', boxId);
            return;
        }

        this.initializeUI();
    }

    initializeUI() {
        // Update box info
        const nameEl = document.getElementById('boxName');
        const priceEl = document.getElementById('boxPrice');
        const badgeEl = document.getElementById('boxBadge');

        if (nameEl) nameEl.textContent = this.boxConfig.name;
        if (priceEl) priceEl.textContent = this.boxConfig.price.toFixed(2).replace('.', ',');
        if (badgeEl) badgeEl.textContent = this.boxConfig.badge;

        // Display prizes grid
        this.displayPrizes();

        // Setup open button
        const openBtn = document.getElementById('btnOpenBox');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openBox());
            this.updateOpenButton();
        }
    }

    displayPrizes() {
        const grid = document.getElementById('prizesGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Display 9 random prizes (can include duplicates)
        for (let i = 0; i < 9; i++) {
            const prize = this.getRandomPrize();
            const prizeEl = this.createPrizeElement(prize);
            grid.appendChild(prizeEl);
        }
    }

    createPrizeElement(prize) {
        const div = document.createElement('div');
        div.className = 'prize-item';
        div.innerHTML = `
            <img src="assets/images/prizes/${prize.image}" 
                 alt="${prize.name}"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2212%22%3E${prize.name.substring(0, 10)}%3C/text%3E%3C/svg%3E'">
            <div class="prize-name">${prize.name}</div>
            <div class="prize-rarity ${prize.rarity}">${this.getRarityLabel(prize.rarity)}</div>
        `;
        return div;
    }

    getRandomPrize() {
        const prizes = this.boxConfig.prizes;
        return prizes[Math.floor(Math.random() * prizes.length)];
    }

    selectPrizeByProbability() {
        const prizes = this.boxConfig.prizes;
        const random = Math.random();
        let cumulativeProbability = 0;

        for (const prize of prizes) {
            cumulativeProbability += prize.probability;
            if (random <= cumulativeProbability) {
                return prize;
            }
        }

        // Fallback to last prize if something goes wrong
        return prizes[prizes.length - 1];
    }

    getRarityLabel(rarity) {
        const labels = {
            legendary: 'LENDÁRIO',
            epic: 'ÉPICO',
            rare: 'RARO',
            common: 'COMUM'
        };
        return labels[rarity] || rarity.toUpperCase();
    }

    updateOpenButton() {
        const openBtn = document.getElementById('btnOpenBox');
        if (!openBtn) return;

        const balance = window.userState.getBalance();
        const canOpen = balance >= this.boxConfig.price;

        openBtn.disabled = !canOpen;
        
        if (!canOpen) {
            openBtn.textContent = `SALDO INSUFICIENTE (R$ ${this.boxConfig.price.toFixed(2).replace('.', ',')})`;
            openBtn.style.background = 'linear-gradient(135deg, #6b7280, #9ca3af)';
        } else {
            openBtn.textContent = `ABRIR POR R$ ${this.boxConfig.price.toFixed(2).replace('.', ',')}`;
            openBtn.style.background = '';
        }
    }

    async openBox() {
        const balance = window.userState.getBalance();
        
        if (balance < this.boxConfig.price) {
            window.NotificationSystem.show('Saldo insuficiente! Faça um depósito.', 'error');
            setTimeout(() => {
                window.location.href = '../pages/deposito.html';
            }, 2000);
            return;
        }

        // Deduct balance
        if (!window.userState.deductBalance(this.boxConfig.price)) {
            window.NotificationSystem.show('Erro ao processar pagamento.', 'error');
            return;
        }

        // Select prize
        const wonPrize = this.selectPrizeByProbability();

        // Show animation
        this.showOpeningAnimation(wonPrize);

        // Save to history
        this.saveToHistory(wonPrize);

        // Update button
        this.updateOpenButton();
    }

    showOpeningAnimation(prize) {
        const animationContainer = document.getElementById('openingAnimation');
        if (!animationContainer) {
            // Create animation container if it doesn't exist
            this.createAnimationContainer(prize);
            return;
        }

        animationContainer.classList.remove('hidden');

        const boxImg = animationContainer.querySelector('.animation-box img');
        const prizeReveal = animationContainer.querySelector('.prize-reveal');

        // Reset animation
        boxImg.className = 'animation-box';
        prizeReveal.classList.remove('show');

        // Start box animation
        setTimeout(() => {
            boxImg.classList.add('opening');
        }, 500);

        // Show prize
        setTimeout(() => {
            const prizeImg = prizeReveal.querySelector('img');
            const prizeName = prizeReveal.querySelector('h2');
            const prizeRarity = prizeReveal.querySelector('p');

            prizeImg.src = `assets/images/prizes/${prize.image}`;
            prizeImg.onerror = () => {
                prizeImg.src = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2230%22%3E${prize.name}%3C/text%3E%3C/svg%3E`;
            };
            prizeName.textContent = prize.name;
            prizeRarity.textContent = this.getRarityLabel(prize.rarity);

            prizeReveal.classList.add('show');
        }, 1500);

        // Setup close button
        const closeBtn = animationContainer.querySelector('.btn-close-animation');
        closeBtn.onclick = () => {
            animationContainer.classList.add('hidden');
        };
    }

    createAnimationContainer(prize) {
        const container = document.createElement('div');
        container.id = 'openingAnimation';
        container.className = 'opening-animation';
        container.innerHTML = `
            <div class="animation-box">
                <img src="assets/images/boxes/${this.boxId}.png" 
                     alt="${this.boxConfig.name}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22%3EBOX%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="prize-reveal">
                <img src="" alt="Prize">
                <h2>PARABÉNS!</h2>
                <p></p>
                <button class="btn-close-animation">CONTINUAR</button>
            </div>
        `;
        document.body.appendChild(container);
        
        setTimeout(() => this.showOpeningAnimation(prize), 100);
    }

    saveToHistory(prize) {
        const history = JSON.parse(localStorage.getItem('openingHistory') || '[]');
        history.unshift({
            boxId: this.boxId,
            boxName: this.boxConfig.name,
            prize: prize.name,
            rarity: prize.rarity,
            timestamp: new Date().toISOString(),
            price: this.boxConfig.price
        });

        // Keep only last 50 entries
        if (history.length > 50) {
            history.pop();
        }

        localStorage.setItem('openingHistory', JSON.stringify(history));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get box ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('box');

    if (boxId && BOXES[boxId]) {
        window.lootboxSystem = new LootboxSystem(boxId);
    }
});

// Export for use in other scripts
window.LootboxSystem = LootboxSystem;
window.BOXES = BOXES;
