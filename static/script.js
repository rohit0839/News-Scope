document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.getElementById('query');
    const submitBtn = searchForm?.querySelector('button[type="submit"]');

    // -------------------------------------------------------------
    // 1. Global Keyboard Shortcut ('/' or 'Ctrl/Cmd + K' to search)
    // -------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        const isEditing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        
        // Focus with '/' when not typing, or 'Cmd/Ctrl + K'
        if ((e.key === '/' && !isEditing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
            e.preventDefault();
            searchInput?.focus();
            searchInput?.select();
        }

        // Clear and blur with 'Escape'
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.blur();
        }
    });

    // -------------------------------------------------------------
    // 2. Loading State on Form Submission
    // -------------------------------------------------------------
    if (searchForm && submitBtn) {
        searchForm.addEventListener('submit', () => {
            const query = searchInput.value.trim();
            if (!query) return;

            // Save to recent search history
            saveRecentSearch(query);

            // Visual feedback
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span style="display:inline-flex; align-items:center; gap:6px;">
                    <svg style="animation: spin 0.8s linear infinite; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" fill="none"/>
                    </svg>
                    Searching...
                </span>
            `;
        });
    }

    // -------------------------------------------------------------
    // 3. Native Share & Copy Link for Cards
    // -------------------------------------------------------------
    initCardShareButtons();

    // -------------------------------------------------------------
    // 4. Render Recent Searches under the search bar
    // -------------------------------------------------------------
    renderRecentSearches();
});

// Helper: Save unique query to LocalStorage (max 5)
function saveRecentSearch(query) {
    let history = JSON.parse(localStorage.getItem('newsscope_history') || '[]');
    history = [query, ...history.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    localStorage.setItem('newsscope_history', JSON.stringify(history));
}

// Helper: Render search history badges
function renderRecentSearches() {
    const history = JSON.parse(localStorage.getItem('newsscope_history') || '[]');
    if (!history.length) return;

    const heroSection = document.querySelector('.hero-search');
    if (!heroSection) return;

    const tagContainer = document.createElement('div');
    tagContainer.className = 'recent-tags';
    tagContainer.style.cssText = 'margin-top: 14px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; align-items: center;';

    tagContainer.innerHTML = `<span style="font-size: 0.8rem; color: #94a3b8; font-weight: 500;">Recent:</span>`;

    history.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = item;
        btn.style.cssText = `
            background: #e2e8f0; border: none; border-radius: 12px;
            padding: 4px 10px; font-size: 0.78rem; font-weight: 500;
            color: #334155; cursor: pointer; transition: background 0.15s;
        `;
        btn.addEventListener('mouseenter', () => btn.style.background = '#cbd5e1');
        btn.addEventListener('mouseleave', () => btn.style.background = '#e2e8f0');
        btn.addEventListener('click', () => {
            const input = document.getElementById('query');
            if (input) {
                input.value = item;
                input.closest('form').submit();
            }
        });
        tagContainer.appendChild(btn);
    });

    heroSection.appendChild(tagContainer);
}

// Helper: Wire Web Share API or Clipboard Copying
function initCardShareButtons() {
    document.querySelectorAll('.news-card').forEach(card => {
        const linkElem = card.querySelector('.card-title a');
        const footer = card.querySelector('.card-footer');
        if (!linkElem || !footer) return;

        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.setAttribute('aria-label', 'Share article');
        shareBtn.style.cssText = 'background:none; border:none; cursor:pointer; color:#64748b; padding:4px; display:flex; align-items:center;';
        shareBtn.innerHTML = `
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
        `;

        shareBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const shareData = {
                title: linkElem.textContent.trim(),
                url: linkElem.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    /* User aborted dialog */
                }
            } else {
                navigator.clipboard.writeText(shareData.url);
                showToast('Link copied to clipboard!');
            }
        });

        footer.insertBefore(shareBtn, footer.lastElementChild);
    });
}

// Simple Toast Notification
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 1000;
            background: #0f172a; color: #fff; padding: 10px 18px;
            border-radius: 8px; font-size: 0.85rem; font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0;
            transform: translateY(10px); transition: opacity 0.2s, transform 0.2s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 2500);
}