# Plataforma de Jogos HTML5 com Gerenciador Flask

Este projeto consiste em uma plataforma web para exibir e jogar jogos HTML5, acompanhada de uma ferramenta de gerenciamento de conteúdo construída com Python e Flask.

## 🚀 Visão Geral

A plataforma permite aos usuários navegar por diferentes categorias de jogos e jogar os jogos selecionados diretamente no navegador. O sistema de gerenciamento oferece uma interface para editar os metadados dos jogos e configurar quais jogos aparecem nas seções da página inicial.

## 🌟 Funcionalidades

**Plataforma Web (Frontend - `index.html`, `play-game.html`):**

*   **Página Inicial (`index.html`):**
    *   Exibe jogos em seções como "Jogos em Destaque", "Jogos Mais Novos" e "Top Jogos".
    *   Conteúdo das seções carregado dinamicamente via JavaScript (`static/js/script.js`) com base em `pagination_config.json` e `static/js/games.js`.
    *   Sidebar com categorias de jogos.
    *   Paginação para a seção "Jogos em Destaque".
    *   Barra de navegação superior e área de logo/busca.
*   **Página de Jogo (`play-game.html`):**
    *   Carrega e exibe um jogo HTML5 dentro de um `<iframe>`.
    *   Busca e exibe dinamicamente informações do jogo (título, descrição, controles, classificação etária) de `static/js/games.js`.
    *   Barra de progresso para o carregamento do iframe.
    *   Controles de zoom e tela cheia para o iframe do jogo.
    *   Scripts para tratar problemas comuns de iframe (foco e scroll de teclado).
*   **Estrutura de Estilos:** CSS modularizado em arquivos (`base.css`, `layout.css`, `nav.css`, `components.css`, `index-page.css`, `game-page.css`).

**Ferramenta de Gerenciamento (Backend - `game_manager.py`):**

*   **Interface Web (Flask):**
    *   Lista os jogos existentes com suas capas (`/`).
    *   Permite editar detalhes de cada jogo (nome, descrição, caminho da capa, controles, categoria, classificação etária) através de um formulário (`/edit/<game_id>`).
    *   Interface visual para gerenciar a configuração de quais jogos aparecem e em que ordem nas seções "Jogos em Destaque", "Jogos Mais Novos" e "Top Jogos" da página inicial (`/pagination`).
    *   Utiliza SortableJS para reordenar páginas e slots de jogos via drag-and-drop.
    *   Modal para selecionar jogos a serem adicionados aos slots.
*   **Persistência de Dados:**
    *   As informações dos jogos são lidas e salvas no arquivo `static/js/games.js`.
    *   A configuração de paginação das seções da página inicial é lida e salva no arquivo `pagination_config.json`.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:**
    *   HTML5
    *   CSS3
    *   JavaScript (ES6+)
        *   `importmap` para gerenciamento de módulos Three.js (nos jogos).
        *   Manipulação dinâmica do DOM.
        *   Fetch API para carregar `pagination_config.json`.
*   **Backend (Ferramenta de Gerenciamento):**
    *   Python 3
    *   Flask
    *   Jinja2 (Templates)
*   **Bibliotecas JavaScript (Frontend):**
    *   Three.js (para os jogos 3D como "Asphalt Wings").
    *   SortableJS (para a interface de gerenciamento de paginação).
*   **Formato de Dados:**
    *   JSON (`pagination_config.json`)
    *   Objeto JavaScript (`static/js/games.js`)

## ⚙️ Configuração e Execução

**1. Plataforma Web (Frontend):**

*   Abra o arquivo `index.html` diretamente em um navegador web moderno.
*   Para que os jogos funcionem corretamente, especialmente aqueles com módulos JavaScript (como "Asphalt Wings" usando Three.js via `importmap`), pode ser necessário servir os arquivos através de um servidor web local simples devido a restrições de CORS ou políticas de segurança para módulos ES6 carregados via `file:///`.
    *   Exemplo com Python: `python -m http.server` na raiz do projeto.
    *   Acesse via `http://localhost:8000/index.html`.

**2. Ferramenta de Gerenciamento (Backend):**

*   **Pré-requisitos:** Python 3 instalado.
*   **Ambiente Virtual (Recomendado):**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
*   **Instalar Dependências:**
    ```bash
    pip install Flask
    ```
*   **Executar a Aplicação Flask:**
    ```bash
    python game_manager.py
    ```
*   Acesse a ferramenta de gerenciamento em `http://127.0.0.1:5000/` no seu navegador.
    *   `http://127.0.0.1:5000/` para listar e acessar a edição dos jogos.
    *   `http://127.0.0.1:5000/pagination` para gerenciar a configuração das seções da página inicial.

## 📄 Principais Arquivos de Dados e Configuração

1.  **`static/js/games.js`**:
    *   Define o objeto global `window.gameDatabase`.
    *   Contém um dicionário onde cada chave é o ID único de um jogo e o valor é um objeto com os metadados do jogo (nome, descrição, caminhos de imagem e jogo, controles, categoria, classificação etária).
    *   Este arquivo é modificado pela ferramenta de gerenciamento ao salvar edições de jogos.
    *   Também define `getGameData(gameId)` para fácil acesso aos dados de um jogo.

2.  **`pagination_config.json`**:
    *   Define a estrutura e o conteúdo das seções dinâmicas ("Jogos em Destaque", "Jogos Mais Novos", "Top Jogos") na `index.html`.
    *   Para "featured-games", é uma lista de páginas, cada uma com duas colunas (`left_column`, `right_column`), e cada coluna com slots (`large`, `small1`, `small2`).
    *   Para "new-games" e "top-games", é uma lista simples de IDs de jogos.
    *   Os IDs de jogo referenciam as chaves definidas em `static/js/games.js`.
    *   Este arquivo é modificado pela interface de gerenciamento de paginação.

## 🎮 Integração de Novos Jogos

1.  **Crie uma Pasta para o Jogo:**
    *   Dentro de `static/jogos/`, crie uma nova pasta com um nome único para o seu jogo (ex: `static/jogos/meu-novo-jogo/`).
2.  **Adicione os Arquivos do Jogo:**
    *   Coloque todos os arquivos do seu jogo HTML5 (HTML principal, JS, CSS, imagens, áudios, etc.) dentro desta nova pasta.
    *   Certifique-se que o jogo funciona corretamente quando o HTML principal dele é aberto.
3.  **Crie uma Imagem de Capa:**
    *   Adicione uma imagem de capa para o jogo (ex: `capa.png` ou `cover.jpg`) dentro da pasta do jogo.
4.  **Adicione a Entrada no `static/js/games.js`:**
    *   Abra o arquivo `static/js/games.js`.
    *   Adicione uma nova entrada ao objeto `window.gameDatabase`. Use um ID único (geralmente o nome da pasta do jogo) como chave.
    *   **Estrutura da Entrada:**
        ```javascript
        "id-unico-do-jogo": {
            id: "id-unico-do-jogo",
            name: "Nome do Jogo",
            description: "Descrição concisa do jogo.",
            controls: [
                { key: "Tecla A", action: "Faz Ação A" },
                { key: "Tecla B", action: "Faz Ação B" }
            ],
            imagePath: "jogos/id-unico-do-jogo/nome_da_capa.png", // Caminho relativo à raiz do projeto (sem 'static/')
            gamePath: "jogos/id-unico-do-jogo/index.html",     // Caminho relativo à raiz do projeto (sem 'static/')
            category: "Categoria do Jogo",
            categoryLink: "#", // Ou um link real para a página da categoria
            ageRating: "L" // (L, 10, 12, 14, 16, 18)
        },
        ```
    *   **Importante:** Os caminhos `imagePath` e `gamePath` são relativos à pasta `static/`. Por exemplo, se sua capa está em `static/jogos/meu-novo-jogo/cover.png`, o valor de `imagePath` será `"jogos/meu-novo-jogo/cover.png"`.
5.  **Adicione aos Destaques (Opcional):**
    *   Use a ferramenta de gerenciamento (`http://127.0.0.1:5000/pagination`) para adicionar o novo jogo às seções "Jogos em Destaque", "Jogos Mais Novos" ou "Top Jogos" conforme desejado.

## <iframe> Considerações para Jogos

Ao incorporar jogos HTML5 via `<iframe>`:

1.  **Foco do Teclado:**
    *   O iframe precisa ter foco para receber eventos de teclado.
    *   O script em `play-game.html` tenta devolver o foco ao iframe se o usuário clicar fora dele (em áreas não interativas da página principal).
2.  **Eventos de Teclado e Scroll da Página:**
    *   Teclas como Setas (Cima/Baixo) ou Espaço podem causar scroll na página principal.
    *   O `play-game.html` inclui um listener para `event.preventDefault()` para as teclas de seta.
    *   É recomendado que o próprio jogo também utilize `event.preventDefault()` para as teclas que ele controla, para evitar comportamentos indesejados.
3.  **Comunicação com o Iframe (Avançado):**
    *   Se o jogo precisar comunicar informações de volta para a página principal (ex: pontuação final), utilize `window.postMessage()`.
4.  **Permissões do Iframe:**
    *   Para funcionalidades como tela cheia, o atributo `allowfullscreen` deve estar presente na tag `<iframe>`.
    *   Outras permissões (`camera`, `microphone`) podem ser necessárias dependendo do jogo, usando o atributo `allow`.