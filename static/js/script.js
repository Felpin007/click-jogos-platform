document.addEventListener('DOMContentLoaded', () => {
    if (typeof gameDatabase !== 'undefined' && typeof window.gameDatabase === 'undefined') {
        console.log("Atribuindo manualmente gameDatabase ao objeto window.");
        window.gameDatabase = gameDatabase;
    }

    const featuredContainer = document.getElementById('featured-games-container');
    const newestContainer = document.getElementById('newest-games-container');
    const topContainer = document.getElementById('top-games-container');
    const dotsContainer = document.getElementById('featured-dots-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let paginationConfig = null;
    let featuredGamesPages = [];
    let newestGamesPages = [];
    let topGamesPages = [];
    let currentFeaturedIndex = 0;

    /**
     * Gera o HTML para um único item de jogo com base em seu ID e tamanho desejado.
     * @param {string|null} gameId - O ID do jogo do gameDatabase.
     * @param {'large'|'small'|'medium'|'icon'} size - O tamanho/estilo de exibição.
     * @returns {string} String HTML para o item do jogo ou um placeholder vazio.
     */
    function getGameHtml(gameId, size) {
        const game = typeof getGameData === 'function' ? getGameData(gameId) : null;

        if (!gameId || !game) {
            if (size === 'large' || size === 'small') {
                return `<div class="game-image ${size}"></div><div class="game-info"></div>`;
            } else if (size === 'medium') {
                return `<div class="game-item"><div class="game-image medium"></div><div class="game-info"></div></div>`;
            } else if (size === 'icon') {
                 return `<div class="game-item"><div class="game-image icon-only"></div></div>`;
            }
            return '';
        }

        const gameUrl = `play-game.html?game=${game.id}`;
        const imageUrl = game.imagePath ? `static/${game.imagePath}` : 'static/images/placeholder.png';

        switch (size) {
            case 'large':
                return `
                    <div class="game-image large"><img src="${imageUrl}" alt="${game.name || ''}" onerror="this.style.display='none'; this.src='static/images/placeholder.png';"></div>
                    <div class="game-info">
                        <h3><a href="${gameUrl}">${game.name || 'Jogo Desconhecido'}</a></h3>
                        <p>${(game.description || '').substring(0, 80)}${(game.description || '').length > 80 ? '...' : ''}</p>
                        ${game.category ? `<div class="category-link"><a href="${game.categoryLink || '#'}">${game.category}</a></div>` : ''}
                    </div>
                `;
            case 'small':
                return `
                    <div class="game-image small"><img src="${imageUrl}" alt="${game.name || ''}" onerror="this.style.display='none'; this.src='static/images/placeholder.png';"></div>
                    <div class="game-info">
                         <h3><a href="${gameUrl}">${(game.name || 'Jogo Desconhecido').substring(0, 25)}${(game.name || '').length > 25 ? '...' : ''}</a></h3>
                    </div>
                `;
            case 'medium':
                 return `
                    <div class="game-item">
                         <div class="game-image medium"><img src="${imageUrl}" alt="${game.name || ''}" onerror="this.style.display='none'; this.src='static/images/placeholder.png';"></div>
                         <div class="game-info">
                             <h3><a href="${gameUrl}">${game.name || 'Jogo Desconhecido'}</a></h3>
                             <p>${(game.description || '').substring(0, 40)}${(game.description || '').length > 40 ? '...' : ''}</p>
                         </div>
                    </div>
                 `;
             case 'icon':
                 return `
                    <div class="game-item">
                        <a href="${gameUrl}">
                            <div class="game-image icon-only"><img src="${imageUrl}" alt="${game.name || ''}" title="${game.name || 'Jogo Desconhecido'}" onerror="this.style.display='none'; this.src='static/images/placeholder.png';"></div>
                        </a>
                    </div>
                 `;
            default:
                return '';
        }
    }

    /**
     * Renderiza a seção de jogos em destaque para um índice de página específico.
     * @param {number} index - O índice da página de jogos em destaque a ser exibida.
     */
    function renderFeaturedGames(index) {
        if (!featuredContainer || !paginationConfig || !featuredGamesPages || index < 0 || index >= featuredGamesPages.length) {
            console.error("Não é possível renderizar jogos em destaque. Container, configuração ausente ou índice inválido:", index);
            if (featuredContainer) featuredContainer.innerHTML = '<p>Erro ao carregar jogos em destaque.</p>';
            return;
        }

        currentFeaturedIndex = index;
        const pageData = featuredGamesPages[index];
        const leftCol = pageData.left_column || {};
        const rightCol = pageData.right_column || {};

        featuredContainer.innerHTML = `
            <div class="featured-column">
                <div class="featured-game large">
                    ${getGameHtml(leftCol.large, 'large')}
                </div>
                <div class="featured-row-small">
                    <div class="featured-game small">
                        ${getGameHtml(leftCol.small1, 'small')}
                    </div>
                    <div class="featured-game small">
                        ${getGameHtml(leftCol.small2, 'small')}
                    </div>
                </div>
            </div>
            <div class="featured-column">
                 <div class="featured-game large">
                    ${getGameHtml(rightCol.large, 'large')}
                </div>
                <div class="featured-row-small">
                     <div class="featured-game small">
                        ${getGameHtml(rightCol.small1, 'small')}
                    </div>
                    <div class="featured-game small">
                        ${getGameHtml(rightCol.small2, 'small')}
                    </div>
                </div>
            </div>
        `;
        updateFeaturedPaginationControls();
    }

    function renderNewestGames() {
        if (!newestContainer || !paginationConfig || !Array.isArray(newestGamesPages)) {
             console.error("Não é possível renderizar novos jogos. Container, configuração ausente ou newestGamesPages não é um array.");
             if(newestContainer) newestContainer.innerHTML = '<p>Erro ao carregar jogos novos.</p>';
            return;
        }

        let content = '';
        if (newestGamesPages.length === 0) {
            content = '<p>Nenhum jogo novo configurado.</p>';
        } else {
            newestGamesPages.forEach(gameId => {
                content += getGameHtml(gameId, 'medium');
            });
            if (!content.trim()) {
                 content = '<p>Nenhum jogo novo encontrado.</p>';
            }
        }
        newestContainer.innerHTML = content;
    }

    function renderTopGames() {
        if (!topContainer || !paginationConfig || !Array.isArray(topGamesPages)) {
             console.error("Não é possível renderizar top jogos. Container, configuração ausente ou topGamesPages não é um array.");
             if(topContainer) topContainer.innerHTML = '<p>Erro ao carregar top jogos.</p>';
            return;
        }

        let content = '';
        if (topGamesPages.length === 0) {
            content = '<p>Nenhum jogo top configurado.</p>';
        } else {
            topGamesPages.forEach(gameId => {
                content += getGameHtml(gameId, 'icon');
            });
            if (!content.trim()) {
                 content = '<p>Nenhum jogo top encontrado.</p>';
            }
        }
        topContainer.innerHTML = content;
    }

    function updateFeaturedPaginationControls() {
        if (!dotsContainer || featuredGamesPages.length === 0) {
            if (dotsContainer) dotsContainer.innerHTML = ''; // Limpa os pontos se não houver páginas
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        dotsContainer.innerHTML = '';
        for (let i = 0; i < featuredGamesPages.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.index = i;
            if (i === currentFeaturedIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                renderFeaturedGames(i);
            });
            dotsContainer.appendChild(dot);
        }

        if (prevBtn) prevBtn.disabled = currentFeaturedIndex === 0;
        if (nextBtn) nextBtn.disabled = currentFeaturedIndex >= featuredGamesPages.length - 1;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentFeaturedIndex > 0) {
                renderFeaturedGames(currentFeaturedIndex - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentFeaturedIndex < featuredGamesPages.length - 1) {
                renderFeaturedGames(currentFeaturedIndex + 1);
            }
        });
    }

    function initializePage() {
        if (typeof gameDatabase !== 'undefined' && typeof window.gameDatabase === 'undefined') {
            console.log("Atribuindo manualmente gameDatabase ao objeto window (dentro de initializePage).");
            window.gameDatabase = gameDatabase;
        }

        const isGameDataFuncAvailable = typeof getGameData === 'function';
        console.log("Função getGameData disponível (dentro de initializePage):", isGameDataFuncAvailable ? 'Sim' : 'Não');

        if (!isGameDataFuncAvailable) {
            console.error("Função getGameData não está disponível. Não é possível prosseguir.");
            if(featuredContainer) featuredContainer.innerHTML = '<p>Erro crítico: Função de dados de jogos não encontrada.</p>';
            if(newestContainer) newestContainer.innerHTML = '<p>Erro crítico: Função de dados de jogos não encontrada.</p>';
            if(topContainer) topContainer.innerHTML = '<p>Erro crítico: Função de dados de jogos não encontrada.</p>';
            return;
        }

        fetch('pagination_config.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }
                return response.json();
            })
            .then(config => {
                paginationConfig = config;
                featuredGamesPages = Array.isArray(config['featured-games']) ? config['featured-games'] : [];
                newestGamesPages = Array.isArray(config['new-games']) ? config['new-games'] : [];
                topGamesPages = Array.isArray(config['top-games']) ? config['top-games'] : [];

                console.log("Configuração de Paginação Carregada:", paginationConfig);

                if (featuredGamesPages.length > 0) {
                    renderFeaturedGames(0);
                } else {
                     if(featuredContainer) featuredContainer.innerHTML = '<p>Nenhum jogo em destaque configurado.</p>';
                     updateFeaturedPaginationControls();
                }
                renderNewestGames();
                renderTopGames();
            })
            .catch(error => {
                console.error('Erro ao carregar ou analisar pagination_config.json:', error);
                if(featuredContainer) featuredContainer.innerHTML = '<p>Erro ao carregar jogos em destaque.</p>';
                if(newestContainer) newestContainer.innerHTML = '<p>Erro ao carregar jogos novos.</p>';
                if(topContainer) topContainer.innerHTML = '<p>Erro ao carregar top jogos.</p>';
                if(prevBtn) prevBtn.disabled = true;
                if(nextBtn) nextBtn.disabled = true;
                if(dotsContainer) dotsContainer.innerHTML = '';
            });
    }

    setTimeout(initializePage, 50);

});