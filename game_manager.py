import os
import re
import json
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify

app = Flask(__name__)

# Caminhos para os arquivos de dados
GAMES_JS_PATH = os.path.join(os.path.dirname(__file__), 'static', 'js', 'games.js')
PAGINATION_CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'pagination_config.json')

def load_games_from_js():
    """
    Lê o arquivo games.js e tenta analisar o objeto gameDatabase.
    Retorna um dicionário de jogos ou um dicionário vazio em caso de erro.
    """
    try:
        with open(GAMES_JS_PATH, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex para encontrar o conteúdo do objeto gameDatabase
        match = re.search(r'(?:const|window\.)\s*gameDatabase\s*=\s*(\{[\s\S]*?\});', content)
        if match:
            js_object_str = match.group(1)

            # Remove comentários
            js_object_str = re.sub(r'//.*', '', js_object_str)
            js_object_str = re.sub(r'/\*[\s\S]*?\*/', '', js_object_str)

            # Tentativa de tornar mais parecido com JSON (frágil)
            js_object_str = re.sub(r'([{,]\s*)([a-zA-Z0-9_-]+)(\s*:)', r'\1"\2"\3', js_object_str)
            js_object_str = re.sub(r',\s*([}\]])', r'\1', js_object_str)

            try:
                json_str = js_object_str.replace("'", '"')
                games = json.loads(json_str)
                return games
            except json.JSONDecodeError as json_err:
                print(f"Erro ao decodificar JSON de games.js: {json_err}")
                print(f"Parte problemática da string JSON: {json_str[json_err.pos-10:json_err.pos+10]}")
                return {}
        else:
            print("Erro: Não foi possível encontrar o objeto gameDatabase em games.js")
            return {}
    except FileNotFoundError:
        print(f"Erro: {GAMES_JS_PATH} não encontrado.")
        return {}
    except Exception as e:
        print(f"Um erro inesperado ocorreu ao carregar os jogos: {e}")
        return {}

def load_pagination_config():
    """Carrega a configuração de paginação do arquivo JSON."""
    try:
        if not os.path.exists(PAGINATION_CONFIG_PATH):
            default_config = {
                "featured-games": [],
                "new-games": [],
                "top-games": []
            }
            save_pagination_config(default_config)
            return default_config

        with open(PAGINATION_CONFIG_PATH, 'r', encoding='utf-8') as f:
            config = json.load(f)
            for key in ["featured-games", "new-games", "top-games"]:
                if key not in config:
                    config[key] = []
            return config
    except Exception as e:
        print(f"Erro ao carregar configuração de paginação: {e}. Retornando padrão.")
        return {
            "featured-games": [],
            "new-games": [],
            "top-games": []
        }

def save_pagination_config(config_dict):
    """Salva a configuração de paginação no arquivo JSON."""
    try:
        with open(PAGINATION_CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(config_dict, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Ocorreu um erro ao salvar a configuração de paginação: {e}")
        return False

def save_games_to_js(games_dict):
    """
    Escreve o dicionário de jogos de volta para o arquivo games.js,
    garantindo o uso de window.gameDatabase para escopo global.
    """
    try:
        js_object_string = json.dumps(games_dict, indent=4, ensure_ascii=False)

        output_content = f"""// Banco de dados simples de jogos
// Atribuído ao window para torná-lo globalmente acessível
window.gameDatabase = {js_object_string};

// Função para obter dados do jogo pelo ID
// Atualizada para usar explicitamente window.gameDatabase
function getGameData(gameId) {{
    if (window.gameDatabase && window.gameDatabase[gameId]) {{
        return window.gameDatabase[gameId];
    }}
    console.warn(`Dados do jogo não encontrados para o ID: ${{gameId}}`);
    return undefined; // Retorna undefined se o jogo não for encontrado
}}
"""
        with open(GAMES_JS_PATH, 'w', encoding='utf-8') as f:
            f.write(output_content)
            print(f"window.gameDatabase gravado com sucesso em {GAMES_JS_PATH}")
        return True
    except Exception as e:
        print(f"Ocorreu um erro ao salvar os jogos no JS: {e}")
        return False

@app.route('/')
def index():
    """Exibe a lista de jogos (índice do gerenciador)."""
    games = load_games_from_js()
    return render_template('index.html', games=games)

@app.route('/edit/<game_id>', methods=['GET'])
def edit_game_form(game_id):
    """Mostra o formulário para editar um jogo específico."""
    games = load_games_from_js()
    game = games.get(game_id)
    if not game:
        flash(f"Jogo com ID '{game_id}' não encontrado.", "error")
        return redirect(url_for('index'))

    controls_str = ""
    if isinstance(game.get('controls'), list):
        controls_str = "\n".join([f"{c.get('key', '')}:{c.get('action', '')}" for c in game['controls']])

    available_ratings = ["L", "10", "12", "14", "16", "18"]

    return render_template('edit_game.html',
                           game=game,
                           game_id=game_id,
                           controls_str=controls_str,
                           available_ratings=available_ratings)

@app.route('/save/<game_id>', methods=['POST'])
def save_game(game_id):
    """Salva os dados do jogo editado."""
    games = load_games_from_js()
    if game_id not in games:
        flash(f"Jogo com ID '{game_id}' não encontrado.", "error")
        return redirect(url_for('index'))

    try:
        games[game_id]['name'] = request.form.get('name', games[game_id].get('name', '')).strip()
        games[game_id]['description'] = request.form.get('description', games[game_id].get('description', '')).strip()

        image_path = request.form.get('imagePath', games[game_id].get('imagePath', '')).strip()
        if image_path.startswith('static/'):
             image_path = image_path[len('static/'):]
        games[game_id]['imagePath'] = image_path

        games[game_id]['ageRating'] = request.form.get('ageRating', games[game_id].get('ageRating', 'L')).strip()
        if games[game_id]['ageRating'] not in ["L", "10", "12", "14", "16", "18"]:
             games[game_id]['ageRating'] = "L"

        controls_str = request.form.get('controls', '').strip()
        new_controls = []
        if controls_str:
            for line in controls_str.splitlines():
                if ':' in line:
                    key, action = line.split(':', 1)
                    new_controls.append({'key': key.strip(), 'action': action.strip()})
        games[game_id]['controls'] = new_controls

        if save_games_to_js(games):
            flash(f"Jogo '{games[game_id]['name']}' atualizado com sucesso!", "success")
        else:
            flash("Erro ao salvar dados do jogo no arquivo JS.", "error")

    except Exception as e:
        flash(f"Ocorreu um erro ao processar o formulário: {e}", "error")
        print(f"Erro ao processar formulário para {game_id}: {e}")

    return redirect(url_for('edit_game_form', game_id=game_id))

@app.route('/pagination')
def pagination_manager():
    """Exibe a interface de gerenciamento de paginação."""
    all_games = load_games_from_js()
    pagination_config = load_pagination_config()

    sections_data = {}
    for section_id, section_content in pagination_config.items():
        sections_data[section_id] = []
        if section_id == 'new-games':
            if isinstance(section_content, list):
                for game_id in section_content:
                    game_info = all_games.get(game_id) if all_games else None
                    sections_data[section_id].append({
                        'id': game_id,
                        'game': game_info
                    })
            else:
                print(f"Aviso: Esperava lista para 'new-games' na config, obteve {type(section_content)}. Pulando.")
        else:
            if isinstance(section_content, list):
                for page_definition in section_content:
                    def get_slot_data(column_data, slot_key):
                        game_id = column_data.get(slot_key)
                        game_info = all_games.get(game_id) if all_games else None
                        return {
                            'game': game_info,
                            'id': game_id
                        }

                    left_col_data = page_definition.get('left_column', {})
                    right_col_data = page_definition.get('right_column', {})

                    page_data = {
                        'left_column': {
                            'large': get_slot_data(left_col_data, 'large'),
                            'small1': get_slot_data(left_col_data, 'small1'),
                            'small2': get_slot_data(left_col_data, 'small2')
                        },
                        'right_column': {
                            'large': get_slot_data(right_col_data, 'large'),
                            'small1': get_slot_data(right_col_data, 'small1'),
                            'small2': get_slot_data(right_col_data, 'small2')
                        }
                    }
                    sections_data[section_id].append(page_data)
            else:
                 print(f"Aviso: Esperava lista para '{section_id}' na config, obteve {type(section_content)}. Pulando.")

    if all_games is None:
        all_games = {}

    return render_template('pagination_manager.html',
                           sections_data=sections_data,
                           all_games=all_games)

@app.route('/pagination/save', methods=['POST'])
def save_pagination():
    """Salva a configuração de paginação atualizada."""
    try:
        new_config_from_frontend = request.get_json()
        if not isinstance(new_config_from_frontend, dict):
            raise ValueError("Formato de dados inválido recebido.")

        expected_sections = ["featured-games", "new-games", "top-games"]
        validated_config = {}
        all_games = load_games_from_js()

        for section_id in expected_sections:
            frontend_section_data = new_config_from_frontend.get(section_id, [])

            if not isinstance(frontend_section_data, list):
                 return jsonify({"status": "error", "message": f"Tipo de dados inválido para seção: {section_id}"}), 400

            if section_id == 'new-games':
                validated_list = []
                for item in frontend_section_data:
                    if item is None or (isinstance(item, str) and item in all_games):
                        validated_list.append(item)
                    elif isinstance(item, str):
                         print(f"Aviso: ID de jogo '{item}' em new-games não encontrado no banco de dados. Salvando como nulo.")
                         validated_list.append(None)
                    else:
                        return jsonify({"status": "error", "message": f"Item inválido '{item}' encontrado na lista new-games."}), 400
                validated_config[section_id] = validated_list
            else:
                validated_pages = []
                for page_data in frontend_section_data:
                    if not isinstance(page_data, dict) or 'left_column' not in page_data or 'right_column' not in page_data:
                        return jsonify({"status": "error", "message": f"Estrutura de página inválida na seção: {section_id}"}), 400

                    validated_page = {'left_column': {}, 'right_column': {}}
                    for col_key in ['left_column', 'right_column']:
                        col_data = page_data.get(col_key)
                        if not isinstance(col_data, dict) or 'large' not in col_data or 'small1' not in col_data or 'small2' not in col_data:
                            return jsonify({"status": "error", "message": f"Estrutura de coluna inválida ({col_key}) na seção: {section_id}"}), 400

                        for slot_key in ['large', 'small1', 'small2']:
                            game_id = col_data.get(slot_key)
                            if game_id is None or (isinstance(game_id, str) and game_id in all_games):
                                validated_page[col_key][slot_key] = game_id
                            elif isinstance(game_id, str):
                                print(f"Aviso: ID de jogo '{game_id}' em {section_id}/{col_key}/{slot_key} não encontrado. Salvando como nulo.")
                                validated_page[col_key][slot_key] = None
                            else:
                                return jsonify({"status": "error", "message": f"ID de jogo inválido '{game_id}' em {section_id}/{col_key}/{slot_key}."}), 400

                    validated_pages.append(validated_page)
                validated_config[section_id] = validated_pages

        if save_pagination_config(validated_config):
            return jsonify({"status": "success", "message": "Paginação salva com sucesso!"})
        else:
            return jsonify({"status": "error", "message": "Falha ao salvar configuração de paginação."}), 500
    except Exception as e:
        print(f"Erro ao salvar paginação: {e}")
        return jsonify({"status": "error", "message": f"Ocorreu um erro interno: {e}"}), 500

if __name__ == '__main__':
    if not os.path.exists('templates'):
        os.makedirs('templates')
    app.run(debug=True, host='127.0.0.1')