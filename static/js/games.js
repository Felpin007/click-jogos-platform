// Banco de dados simples de jogos
// Atribuído ao window para torná-lo globalmente acessível
window.gameDatabase = {
    "asphalt-wings": {
        "id": "asphalt-wings",
        "name": "Asphalt Wings",
        "description": "Desvie dos obstáculos e coleta de power-ups nesta corrida infinita de alta velocidade. Mostre suas habilidades de piloto e tente alcançar a maior pontuação!",
        "controls": [
            {
                "key": "Setas",
                "action": "controlam o personagem"
            },
            {
                "key": "Espaço",
                "action": "Impulso"
            }
        ],
        "imagePath": "jogos/Asphalt-Wings/capa.png",
        "gamePath": "jogos/Asphalt-Wings/index.html",
        "category": "Jogos de Corrida",
        "categoryLink": "#",
        "ageRating": "L"
    },
    "penguin-commander": {
        "id": "penguin-commander",
        "name": "Penguin Commander",
        "description": "Comande seu exército de pinguins neste jogo de estratégia!",
        "controls": [
            {
                "key": "Setas",
                "action": "Movimentar Pinguim"
            },
            {
                "key": "Espaço",
                "action": "Ainda não definido"
            }
        ],
        "imagePath": "jogos/Penguin Commander/capa.png",
        "gamePath": "jogos/Penguin Commander/index.html",
        "category": "Estratégia",
        "categoryLink": "#",
        "ageRating": "L"
    },
    "ninja-dojo-master": {
        "id": "ninja-dojo-master",
        "name": "Ninja Dojo Master",
        "description": "Teste suas habilidades ninja neste dojo!",
        "controls": [
            { "key": "Setas", "action": "Movimentar" },
            { "key": "Espaço", "action": "Atacar" }
        ],
        "imagePath": "jogos/Ninja-Dojo-Master/capa.png",
        "gamePath": "jogos/Ninja-Dojo-Master/index.html",
        "category": "Ação",
        "categoryLink": "#",
        "ageRating": "L"
    }
};

// Função para obter dados do jogo pelo ID
// Atualizada para usar explicitamente window.gameDatabase
function getGameData(gameId) {
    if (window.gameDatabase && window.gameDatabase[gameId]) {
        return window.gameDatabase[gameId];
    }
    console.warn(`Dados do jogo não encontrados para o ID: ${gameId}`);
    return undefined; // Retorna undefined se o jogo não for encontrado
}