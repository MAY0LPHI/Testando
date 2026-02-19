// Album System - Sticker Collection

const ALBUMS = {
    'audio-master-1': {
        id: 1,
        name: 'Álbum Audio Master 1',
        totalStickers: 10,
        reward: 'KIT MASTER AUDIO',
        rewardImage: 'kit-master-audio.png',
        stickers: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Sticker ${i + 1}`,
            rarity: i < 2 ? 'legendary' : i < 5 ? 'epic' : 'common'
        }))
    },
    'cinema-controller-ps5': {
        id: 2,
        name: 'CINEMA CONTROLLER PS5 EDITION',
        totalStickers: 176,
        reward: 'Controle Dualsense ps5 Original',
        rewardImage: 'ps5-controller.png',
        stickers: Array.from({ length: 176 }, (_, i) => ({
            id: i + 1,
            name: `Sticker ${i + 1}`,
            rarity: i < 10 ? 'legendary' : i < 50 ? 'epic' : i < 100 ? 'rare' : 'common'
        }))
    },
    'ps5-pro': {
        id: 3,
        name: 'PS5 PRO',
        totalStickers: 1872,
        reward: 'PS5 PRO',
        rewardImage: 'ps5-pro.png',
        stickers: Array.from({ length: 1872 }, (_, i) => ({
            id: i + 1,
            name: `Sticker ${i + 1}`,
            rarity: i < 50 ? 'legendary' : i < 200 ? 'epic' : i < 600 ? 'rare' : 'common'
        }))
    }
};

class AlbumSystem {
    constructor() {
        this.userAlbums = this.loadUserAlbums();
        this.initializeUI();
    }

    loadUserAlbums() {
        const saved = localStorage.getItem('userAlbums');
        if (saved) {
            return JSON.parse(saved);
        }

        // Initialize empty albums
        const albums = {};
        Object.keys(ALBUMS).forEach(albumId => {
            albums[albumId] = {
                collectedStickers: [],
                progress: 0,
                completed: false
            };
        });

        this.saveUserAlbums(albums);
        return albums;
    }

    saveUserAlbums(albums) {
        localStorage.setItem('userAlbums', JSON.stringify(albums || this.userAlbums));
    }

    initializeUI() {
        this.displayAlbumList();
        this.setupEventListeners();
    }

    displayAlbumList() {
        const container = document.getElementById('albumsList');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(ALBUMS).forEach(([albumId, album]) => {
            const userAlbum = this.userAlbums[albumId];
            const progress = userAlbum.collectedStickers.length;
            const percentage = ((progress / album.totalStickers) * 100).toFixed(1);

            const card = document.createElement('div');
            card.className = `album-card ${userAlbum.completed ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="album-image">
                    <img src="assets/images/prizes/${album.rewardImage}" 
                         alt="${album.reward}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2216%22%3E${album.name}%3C/text%3E%3C/svg%3E'">
                </div>
                <h3>${album.name}</h3>
                <div class="album-progress">${progress}/${album.totalStickers}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p class="album-reward">Recompensa: ${album.reward}</p>
                ${userAlbum.completed 
                    ? '<button class="btn-album claimed">RECOMPENSA RECEBIDA</button>'
                    : `<button class="btn-album" onclick="albumSystem.openAlbum('${albumId}')">Abrir álbum</button>`
                }
            `;
            container.appendChild(card);
        });
    }

    openAlbum(albumId) {
        const album = ALBUMS[albumId];
        const userAlbum = this.userAlbums[albumId];

        if (!album) return;

        // Show album detail view
        this.showAlbumDetail(albumId, album, userAlbum);
    }

    showAlbumDetail(albumId, album, userAlbum) {
        const modal = document.getElementById('albumModal');
        if (!modal) {
            this.createAlbumModal(albumId, album, userAlbum);
            return;
        }

        const title = modal.querySelector('.modal-title');
        const progress = modal.querySelector('.modal-progress');
        const stickersGrid = modal.querySelector('.stickers-grid');

        title.textContent = album.name;
        progress.textContent = `${userAlbum.collectedStickers.length}/${album.totalStickers}`;

        // Display stickers (show first 50 for performance)
        stickersGrid.innerHTML = '';
        const stickersToShow = album.stickers.slice(0, 50);
        
        stickersToShow.forEach(sticker => {
            const isCollected = userAlbum.collectedStickers.includes(sticker.id);
            const stickerEl = document.createElement('div');
            stickerEl.className = `sticker-slot ${isCollected ? 'collected' : 'empty'}`;
            stickerEl.innerHTML = `
                <div class="sticker-number">#${sticker.id}</div>
                ${isCollected ? '<div class="sticker-check">✓</div>' : ''}
            `;
            stickersGrid.appendChild(stickerEl);
        });

        modal.classList.remove('hidden');
    }

    createAlbumModal(albumId, album, userAlbum) {
        const modal = document.createElement('div');
        modal.id = 'albumModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${album.name}</h2>
                    <button class="modal-close" onclick="albumSystem.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-progress">${userAlbum.collectedStickers.length}/${album.totalStickers}</div>
                    <div class="stickers-grid"></div>
                    <p class="note">Abra caixas para ganhar figurinhas!</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                padding: 1rem;
            }
            .modal.hidden {
                display: none;
            }
            .modal-content {
                background: var(--card-bg);
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .modal-title {
                font-size: 1.5rem;
                margin: 0;
            }
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
            }
            .modal-body {
                padding: 2rem;
            }
            .modal-progress {
                text-align: center;
                font-size: 1.5rem;
                color: var(--primary);
                margin-bottom: 2rem;
                font-weight: 700;
            }
            .stickers-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .sticker-slot {
                aspect-ratio: 1;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: all 0.3s ease;
            }
            .sticker-slot.empty {
                background: rgba(255, 255, 255, 0.05);
            }
            .sticker-slot.collected {
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border-color: var(--gold);
            }
            .sticker-number {
                font-size: 0.9rem;
                font-weight: 600;
            }
            .sticker-check {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 1.2rem;
                color: var(--gold);
            }
            .progress-bar {
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin: 1rem 0;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary), var(--gold));
                transition: width 0.5s ease;
            }
            .album-card.completed {
                border-color: var(--gold);
            }
            .btn-album.claimed {
                background: #10b981;
                cursor: default;
            }
            .note {
                text-align: center;
                color: var(--text-secondary);
                font-style: italic;
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => this.showAlbumDetail(albumId, album, userAlbum), 100);
    }

    closeModal() {
        const modal = document.getElementById('albumModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Add sticker from box opening
    addSticker(albumId, stickerId) {
        const userAlbum = this.userAlbums[albumId];
        if (!userAlbum) return false;

        if (!userAlbum.collectedStickers.includes(stickerId)) {
            userAlbum.collectedStickers.push(stickerId);
            userAlbum.progress = userAlbum.collectedStickers.length;

            const album = ALBUMS[albumId];
            if (userAlbum.progress >= album.totalStickers) {
                userAlbum.completed = true;
                this.claimReward(albumId);
            }

            this.saveUserAlbums();
            this.displayAlbumList();
            return true;
        }
        return false;
    }

    claimReward(albumId) {
        const album = ALBUMS[albumId];
        window.NotificationSystem.show(
            `Parabéns! Você completou o álbum ${album.name} e ganhou: ${album.reward}!`,
            'success'
        );
    }

    setupEventListeners() {
        // Close modal on background click
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('albumModal');
            if (modal && e.target === modal) {
                this.closeModal();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('albumsList')) {
        window.albumSystem = new AlbumSystem();
    }
});

// Export for use in other scripts
window.AlbumSystem = AlbumSystem;
window.ALBUMS = ALBUMS;
