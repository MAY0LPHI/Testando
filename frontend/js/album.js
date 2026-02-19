// Album functionality

async function loadAlbums() {
    try {
        let albums;
        
        if (authToken) {
            // Load user's album progress
            const response = await fetch(`${API_URL}/user/albums`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            albums = await response.json();
        } else {
            // Load albums without progress
            const response = await fetch(`${API_URL}/user/albums`, {
                headers: {
                    'Authorization': `Bearer demo_token`
                }
            });
            albums = response.ok ? await response.json() : [
                { id: 1, name: 'Audio Master 1', total_stickers: 10, reward: 'KIT MASTER AUDIO', progress: 0, stickersCollected: [] },
                { id: 2, name: 'CINEMA CONTROLLER PS5 EDITION', total_stickers: 176, reward: 'Controle Dualsense PS5 Original', progress: 0, stickersCollected: [] },
                { id: 3, name: 'PS5 PRO', total_stickers: 1872, reward: 'PS5 PRO', progress: 0, stickersCollected: [] }
            ];
        }
        
        const grid = document.getElementById('albumGrid');
        grid.innerHTML = '';
        
        albums.forEach(album => {
            const card = createAlbumCard(album);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Load albums error:', error);
        // Show default albums
        const grid = document.getElementById('albumGrid');
        grid.innerHTML = '';
        const defaultAlbums = [
            { id: 1, name: 'Audio Master 1', total_stickers: 10, reward: 'KIT MASTER AUDIO', progress: 0, stickersCollected: [] },
            { id: 2, name: 'CINEMA CONTROLLER PS5 EDITION', total_stickers: 176, reward: 'Controle Dualsense PS5 Original', progress: 0, stickersCollected: [] },
            { id: 3, name: 'PS5 PRO', total_stickers: 1872, reward: 'PS5 PRO', progress: 0, stickersCollected: [] }
        ];
        defaultAlbums.forEach(album => {
            const card = createAlbumCard(album);
            grid.appendChild(card);
        });
    }
}

function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card fade-in';
    
    const progressPercentage = (album.progress / album.total_stickers) * 100;
    
    card.innerHTML = `
        <div class="album-header">
            <h3 class="album-name">${album.name}</h3>
            <p class="album-reward">🏆 ${album.reward}</p>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <p class="progress-text">${album.progress || 0}/${album.total_stickers} figurinhas</p>
        <button class="btn-open-album" onclick="openAlbum(${album.id})">
            Abrir álbum
        </button>
    `;
    
    return card;
}

async function openAlbum(albumId) {
    if (!authToken) {
        showAuthModal('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/user/albums/${albumId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const album = await response.json();
        
        showAlbumDetails(album);
    } catch (error) {
        console.error('Open album error:', error);
        alert('Erro ao abrir álbum');
    }
}

function showAlbumDetails(album) {
    const modal = document.getElementById('albumModal');
    const details = document.getElementById('albumDetails');
    
    const stickersCollected = album.stickersCollected || [];
    const progressPercentage = (album.progress / album.total_stickers) * 100;
    
    let stickersHTML = '<div class="album-detail-header">';
    stickersHTML += `<h2>${album.name}</h2>`;
    stickersHTML += `<p class="album-reward">🏆 Recompensa: ${album.reward}</p>`;
    stickersHTML += `<div class="progress-bar"><div class="progress-fill" style="width: ${progressPercentage}%"></div></div>`;
    stickersHTML += `<p class="progress-text">${album.progress}/${album.total_stickers} figurinhas coletadas</p>`;
    stickersHTML += '</div>';
    
    stickersHTML += '<div class="stickers-grid">';
    
    // Show a sample of stickers (limit to first 50 for display)
    const displayLimit = Math.min(album.total_stickers, 50);
    
    for (let i = 1; i <= displayLimit; i++) {
        const collected = stickersCollected.includes(i);
        stickersHTML += `
            <div class="sticker-slot ${collected ? 'collected' : 'empty'}">
                ${collected ? '🎴' : '?'}
                <span class="sticker-number">#${i}</span>
            </div>
        `;
    }
    
    if (album.total_stickers > displayLimit) {
        stickersHTML += `<p class="stickers-note">Mostrando ${displayLimit} de ${album.total_stickers} figurinhas</p>`;
    }
    
    stickersHTML += '</div>';
    
    if (album.completed) {
        stickersHTML += '<div class="album-completed"><h3>✅ Álbum Completo!</h3><p>Entre em contato com o suporte para resgatar sua recompensa.</p></div>';
    }
    
    details.innerHTML = stickersHTML;
    modal.style.display = 'block';
}

// Add CSS for album details
const albumStyle = document.createElement('style');
albumStyle.textContent = `
    .album-detail-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--bg-secondary);
    }
    
    .album-detail-header h2 {
        color: var(--accent-cyan);
        margin-bottom: 15px;
    }
    
    .stickers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .sticker-slot {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        border-radius: 10px;
        border: 2px solid var(--bg-primary);
        font-size: 32px;
        position: relative;
        transition: all 0.3s;
    }
    
    .sticker-slot.collected {
        border-color: var(--accent-cyan);
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(168, 85, 247, 0.1));
    }
    
    .sticker-slot.empty {
        opacity: 0.5;
        color: var(--text-secondary);
    }
    
    .sticker-slot:hover {
        transform: scale(1.05);
    }
    
    .sticker-number {
        font-size: 10px;
        position: absolute;
        bottom: 5px;
        color: var(--text-secondary);
    }
    
    .stickers-note {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--text-secondary);
        margin-top: 20px;
    }
    
    .album-completed {
        background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        margin-top: 30px;
    }
    
    .album-completed h3 {
        font-size: 28px;
        margin-bottom: 15px;
    }
    
    .album-content {
        max-width: 800px;
    }
`;
document.head.appendChild(albumStyle);
