document.addEventListener('DOMContentLoaded', () => {

    // 1. Inietta le opere nel portfolio
    const grid = document.getElementById('portfolio-grid');

    // Assumiamo che artworks sia definito in data.js incluso prima di questo file
    if (typeof artworks !== 'undefined' && artworks.length > 0) {
        artworks.forEach((artwork, index) => {
            const card = document.createElement('div');
            // Aggiungiamo un ritardo scaglionato per l'animazione di entrata
            card.className = 'artwork-card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.dataset.id = artwork.id;

            card.innerHTML = `
                <div class="artwork-image-wrapper">
                    <img src="${artwork.thumb}" alt="${artwork.title}" class="artwork-img" loading="lazy">
                </div>
                <div class="artwork-info">
                    <h3 class="artwork-title">${artwork.title}</h3>
                    <p class="artwork-meta">${artwork.material} &bull; ${artwork.year}</p>
                </div>
            `;

            card.addEventListener('click', () => openModal(artwork));
            grid.appendChild(card);
        });
    }

    // 2. Modal Logic
    const modal = document.getElementById('artwork-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalMaterial = document.getElementById('modal-material');
    const modalDesc = document.getElementById('modal-description');
    const btnShare = document.getElementById('btn-share');

    let currentArtwork = null;

    function openModal(artwork) {
        currentArtwork = artwork;
        modalImg.src = artwork.image;
        modalImg.alt = artwork.title;
        modalTitle.textContent = artwork.title;
        modalMaterial.textContent = `${artwork.material} - ${artwork.year}`;
        modalDesc.innerHTML = `<p>${artwork.description}</p>`;

        // Update URL hash for sharing (Deeplinking)
        window.history.pushState(null, null, `#${artwork.id}`);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Remove hash without scrolling the page
        window.history.replaceState(null, null, window.location.pathname);
        currentArtwork = null;
    }

    modalClose.addEventListener('click', closeModal);

    // Close on click outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 3. Web Share API
    btnShare.addEventListener('click', async () => {
        if (!currentArtwork) return;

        const shareUrl = window.location.href; // Assumes hash is present
        const shareData = {
            title: `Tuscany Stone: ${currentArtwork.title}`,
            text: `Scopri l'opera in pietra "${currentArtwork.title}" di Tuscany Stone.`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Condiviso con successo');
            } catch (err) {
                console.log('Condivisione annullata o fallita:', err);
            }
        } else {
            // Fallback: Copy to clipboard specifically for desktop
            navigator.clipboard.writeText(shareUrl).then(() => {
                const originalText = btnShare.innerHTML;
                btnShare.innerHTML = 'Link Copiato!';
                setTimeout(() => { btnShare.innerHTML = originalText; }, 2000);
            }).catch(err => {
                console.error('Impossibile copiare', err);
                alert('Impossibile copiare il link automaticamente. Copia questo link: ' + shareUrl);
            });
        }
    });

    // 4. Handle direct link rendering (Hash routing on load)
    function checkHash() {
        const hash = window.location.hash.substring(1);
        if (hash && typeof artworks !== 'undefined') {
            const artwork = artworks.find(a => a.id === hash);
            if (artwork) {
                // Leggero delay per assicurarsi che i font e CSS siano caricati
                setTimeout(() => openModal(artwork), 100);
            }
        }
    }

    checkHash();

    // 5. Scroll Reveal Animation Logic
    const revealElements = document.querySelectorAll('.reveal, .section');

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load in case elements are visible
});
