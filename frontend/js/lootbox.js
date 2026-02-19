// Lootbox functionality

async function loadLootboxes() {
    try {
        const response = await fetch(`${API_URL}/lootbox/boxes`);
        const lootboxes = await response.json();
        
        const grid = document.getElementById('lootboxGrid');
        grid.innerHTML = '';
        
        lootboxes.forEach(box => {
            const card = createLootboxCard(box);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Load lootboxes error:', error);
    }
}

function createLootboxCard(box) {
    const card = document.createElement('div');
    card.className = 'lootbox-card fade-in';
    
    const icon = getBoxIcon(box.id);
    
    card.innerHTML = `
        <div class="lootbox-icon">${icon}</div>
        <h3 class="lootbox-name">${box.name}</h3>
        <p class="lootbox-description">${box.description || ''}</p>
        <div class="lootbox-price">R$ ${box.price.toFixed(2)}</div>
        <button class="btn-open-box" onclick="openLootbox(${box.id})">
            ABRIR POR R$ ${box.price.toFixed(2)}
        </button>
        <button class="btn-view-prizes" onclick="viewPrizes(${box.id})">
            Ver prêmios possíveis
        </button>
    `;
    
    return card;
}

function getBoxIcon(boxId) {
    const icons = {
        1: '📦',
        2: '🎁',
        3: '💎',
        4: '⭐',
        5: '🏆',
        6: '👑'
    };
    return icons[boxId] || '📦';
}

async function viewPrizes(lootboxId) {
    try {
        const response = await fetch(`${API_URL}/lootbox/prizes/${lootboxId}`);
        const prizes = await response.json();
        
        const modal = document.getElementById('lootboxModal');
        const details = document.getElementById('lootboxDetails');
        
        let prizesHTML = '<h2>Prêmios Possíveis</h2><div class="prizes-grid">';
        
        prizes.forEach(prize => {
            const probability = (prize.weight / prizes.reduce((sum, p) => sum + p.weight, 0) * 100).toFixed(2);
            prizesHTML += `
                <div class="prize-item">
                    <div class="prize-name">${prize.name}</div>
                    <div class="prize-type">${prize.type === 'physical' ? '🎁 Físico' : '🎴 Figurinha'}</div>
                    ${prize.value > 0 ? `<div class="prize-value">R$ ${prize.value.toFixed(2)}</div>` : ''}
                    <div class="prize-probability">${probability}% de chance</div>
                </div>
            `;
        });
        
        prizesHTML += '</div>';
        details.innerHTML = prizesHTML;
        modal.style.display = 'block';
    } catch (error) {
        console.error('View prizes error:', error);
        alert('Erro ao carregar prêmios');
    }
}

async function openLootbox(lootboxId) {
    if (!authToken) {
        showAuthModal('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/lootbox/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ lootboxId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update user balance
            currentUser.balance = data.newBalance;
            updateUserDisplay();
            
            // Show opening animation and result
            showLootboxOpening(data);
        } else {
            alert(data.error || 'Erro ao abrir caixa');
        }
    } catch (error) {
        console.error('Open lootbox error:', error);
        alert('Erro ao abrir caixa');
    }
}

function showLootboxOpening(result) {
    const modal = document.getElementById('lootboxModal');
    const details = document.getElementById('lootboxDetails');
    
    // Show opening animation
    details.innerHTML = `
        <div class="lootbox-opening-container">
            <h2>Abrindo caixa...</h2>
            <div class="opening-animation">
                <div class="box-icon lootbox-opening">📦</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // After animation, show result
    setTimeout(() => {
        const prizeEmoji = result.prizeType === 'physical' ? '🎁' : '🎴';
        details.innerHTML = `
            <div class="prize-result">
                <h2>Parabéns!</h2>
                <div class="prize-icon prize-reveal">${prizeEmoji}</div>
                <h3 class="prize-name-result">${result.prize}</h3>
                ${result.prizeValue > 0 ? `<div class="prize-value-result">Valor: R$ ${result.prizeValue.toFixed(2)}</div>` : ''}
                <p class="prize-type-result">${result.prizeType === 'physical' ? 'Prêmio Físico' : 'Figurinha adicionada ao álbum'}</p>
                <button class="btn-primary" onclick="closeModal()">OK</button>
            </div>
        `;
        
        // Reload albums if sticker was received
        if (result.prizeType === 'sticker') {
            loadAlbums();
        }
    }, 2000);
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Add CSS for prizes grid and opening animation
const style = document.createElement('style');
style.textContent = `
    .prizes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .prize-item {
        background: var(--bg-secondary);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        border: 2px solid var(--accent-cyan);
    }
    
    .prize-name {
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--accent-cyan);
    }
    
    .prize-type {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 5px;
    }
    
    .prize-value {
        color: var(--accent-gold);
        font-weight: bold;
        margin: 10px 0;
    }
    
    .prize-probability {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .lootbox-opening-container {
        text-align: center;
        padding: 40px;
    }
    
    .opening-animation {
        margin: 40px 0;
    }
    
    .box-icon {
        font-size: 100px;
        display: inline-block;
    }
    
    .prize-result {
        text-align: center;
        padding: 40px;
    }
    
    .prize-icon {
        font-size: 100px;
        margin: 30px 0;
    }
    
    .prize-name-result {
        font-size: 28px;
        color: var(--accent-cyan);
        margin: 20px 0;
    }
    
    .prize-value-result {
        font-size: 24px;
        color: var(--accent-gold);
        margin: 15px 0;
    }
    
    .prize-type-result {
        color: var(--text-secondary);
        margin: 20px 0;
    }
`;
document.head.appendChild(style);
