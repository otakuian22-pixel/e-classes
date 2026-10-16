// Estado global da aplicação
let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: [],
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarNavegacao();
    renderizarTudo();
});

// Busca todos os dados via service
async function carregarDados() {
    try {
        const [jogos, times, competidores, confrontos] = await Promise.all([
            getJogos(),
            getTimes(),
            getCompetidores(),
            getConfrontos(),
        ]);

        state.jogos = jogos;
        state.times = times;
        state.competidores = competidores;
        state.confrontos = confrontos;
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

// Configura cliques na navegação lateral
function configurarNavegacao() {
    const itens = document.querySelectorAll('#sidebar-nav li');

    itens.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            trocarView(view);
            itens.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function trocarView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
}

function renderizarTudo() {
    renderizarDashboard();
    renderizarBannerHero();
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

// --- Funções de renderização ---

// Adicione essa função no app.js
function renderizarBannerHero() {
    const banner = document.getElementById('hero-banner');
    if (!banner || state.jogos.length === 0) return;

    // Monta as imagens uma vez
    const imagensHTML = state.jogos.map(j => `
        <img src="${j.logo}" alt="${j.name}">
    `).join('');

    // Duplica as imagens (necessário para o loop infinito)
    banner.innerHTML = `
        <div class="hero-banner-track">
            ${imagensHTML}
            ${imagensHTML}
        </div>
    `;

    // Ajusta a duração da animação conforme a quantidade de jogos
    // (mais jogos = mais tempo para não ficar rápido demais)
    const track = banner.querySelector('.hero-banner-track');
    const duracao = state.jogos.length * 6; // 6 segundos por jogo
    track.style.animationDuration = `${duracao}s`;
}

function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');

    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;

    stats.innerHTML = `
        <div class="card">
            <span class="card-tag">Torneio</span>
            <h3>${state.times.length}</h3>
            <p class="subtitle">Equipes</p>
        </div>
        <div class="card">
            <span class="card-tag">Atletas</span>
            <h3>${state.competidores.length}</h3>
            <p class="subtitle">Competidores</p>
        </div>
        <div class="card">
            <span class="card-tag">Encerrados</span>
            <h3>${encerrados}</h3>
            <p class="subtitle">Resultados</p>
        </div>
        <div class="card">
            <span class="card-tag">Pendentes</span>
            <h3>${agendados}</h3>
            <p class="subtitle">Agendamentos</p>
        </div>
    `;

    const lista = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3);

    proximos.innerHTML = lista.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'}</span>
                <div class="match-card">
                    <div class="team-score"><strong>${time1?.name || 'TBD'}</strong></div>
                    <div class="vs">VS</div>
                    <div class="team-score"><strong>${time2?.name || 'TBD'}</strong></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    lista.innerHTML = state.jogos.map(j => `
        <div class="card card-jogo" onclick="abrirDetalhesJogo(${j.id})">
            <img src="${j.logo}" alt="Logo ${j.name}" class="card-logo">
            <h3>${j.name}</h3>
        </div>
    `).join('');
}

function renderizarTimes() {
    const lista = document.getElementById('list-times');
    lista.innerHTML = state.times.map(t => `
        <div class="card" style="border-right: 4px solid ${t.color}">
            <span class="card-tag">EQUIPE</span>
            <h3>${t.name}</h3>
            <p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>
        </div>
    `).join('');
}

function renderizarCompetidores() {
    const lista = document.getElementById('list-competidores');
    lista.innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id == c.teamId);
        return `
            <div class="card">
                <span class="card-tag">${time?.name || 'Sem Time'}</span>
                <h3>${c.nickname}</h3>
                <p class="subtitle">${c.name}</p>
            </div>
        `;
    }).join('');
}

function renderizarConfrontos() {
    const lista = document.getElementById('list-confrontos');
    lista.innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        const data = new Date(c.date).toLocaleString('pt-BR');

        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span>
                <div class="match-card">
                    <div class="team-score">
                        <strong>${time1?.name || '???'}</strong>
                        <div class="score">${c.score1}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-score">
                        <strong>${time2?.name || '???'}</strong>
                        <div class="score">${c.score2}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <span class="card-tag" style="background: ${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled'
                        ? `<button onclick="encerrarConfrontos(${c.id})" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 8px;">Finalizar</button>`
                        : ''}
                </div>
            </div>
        `;
    }).join('');
}

function extrairIdYoutube(valor) {
    if (!valor) return '';

    // Se já for um ID puro (11 caracteres, sem barras ou pontos)
    if (/^[a-zA-Z0-9_-]{11}$/.test(valor.trim())) {
        return valor.trim();
    }

    // Tenta extrair de URLs comuns do YouTube
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = valor.match(regex);

    return match ? match[1] : valor.trim();
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    lista.innerHTML = state.jogos.map(j => `
        <div class="card card-jogo" onclick="abrirDetalhesJogo(${j.id})">
            <img src="${j.logo}" alt="Logo ${j.name}" class="card-logo" onerror="this.style.display='none'">
            <span class="card-tag">${j.genre}</span>
            <h3>${j.name}</h3>
        </div>
    `).join('');
}

// --- Modal e formulários ---

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

window.abrirFormulario = function (tipo) {
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    }, 10);

    const optionsTimes = state.times.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const optionsJogos = state.jogos.map(j => `<option value="${j.id}">${j.name}</option>`).join('');

    const formularios = {
        jogo: `
    <h2>Adicionar Jogo</h2>
    <form onsubmit="salvarItem(event, 'jogos')">
        <div class="form-group">
            <label>Nome do Jogo</label>
            <input type="text" name="name" required placeholder="Ex: League of Legends">
        </div>

        <div class="form-group">
            <label>Gênero</label>
            <select name="genre" required>
                <option value="" disabled selected>Selecione um gênero</option>
                <option value="MOBA">MOBA</option>
                <option value="FPS">FPS</option>
                <option value="Esport">Esport</option>
                <option value="Fighting">Fighting</option>
                <option value="RPG">RPG</option>
                <option value="Battle Royale">Battle Royale</option>
                <option value="Estratégia">Estratégia</option>
                <option value="Card Game">Card Game</option>
                <option value="Outro">Outro</option>
            </select>
        </div>

        <div class="form-group">
            <label>URL da Logo</label>
            <input 
                type="url" 
                name="logo" 
                required 
                placeholder="https://exemplo.com/logo.png"
                oninput="previewLogo(this.value)"
            >
            <small style="color: var(--text-dim); font-size: 0.75rem; display: block; margin-top: 0.5rem;">
                Cole o link direto da imagem (deve terminar em .png, .jpg ou .svg)
            </small>
            <div id="logo-preview" style="margin-top: 1rem; display: none;">
                <img id="logo-preview-img" src="" alt="Preview" style="max-width: 120px; max-height: 120px; object-fit: contain; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 12px;">
            </div>
        </div>

        <div class="form-group">
            <label>ID do Trailer (YouTube)</label>
            <input 
                type="text" 
                name="trailerId" 
                required 
                placeholder="Ex: vzHrjOMfHPY"
            >
            <small style="color: var(--text-dim); font-size: 0.75rem; display: block; margin-top: 0.5rem;">
                Pegue apenas o código depois de <strong>watch?v=</strong> ou <strong>embed/</strong>. 
                Ex: em <em>youtube.com/watch?v=<strong>vzHrjOMfHPY</strong></em>, o ID é <strong>vzHrjOMfHPY</strong>.
            </small>
        </div>

        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" onclick="fecharModal()">Cancelar</button>
        </div>
    </form>
`,

        time: `
    <h2>Adicionar Time</h2>
    <form onsubmit="salvarItem(event, 'times')">
        <div class="form-group">
            <label>Nome do Time</label>
            <input type="text" name="name" required placeholder="Ex: Cyber Dragons">
        </div>

        <div class="form-group">
            <label>Cor do Time</label>
            <input type="color" name="color" value="#6E1E1F" required>
        </div>

        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" onclick="fecharModal()">Cancelar</button>
        </div>
    </form>
`,

        competidor: `
    <h2>Adicionar Competidor</h2>
    <form onsubmit="salvarItem(event, 'competidores')">
        <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" name="name" required placeholder="Ex: Pedro Santos">
        </div>

        <div class="form-group">
            <label>Nickname</label>
            <input type="text" name="nickname" required placeholder="Ex: Pterodactyl">
        </div>

        <div class="form-group">
            <label>Time</label>
            <select name="teamId" required>
                <option value="" disabled selected>Selecione um time</option>
                ${optionsTimes}
            </select>
        </div>

        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" onclick="fecharModal()">Cancelar</button>
        </div>
    </form>
`,

        confronto: `
    <h2>Registrar Confronto</h2>
    <form onsubmit="salvarItem(event, 'confrontos')">
        <div class="form-group">
            <label>Jogo</label>
            <select name="gameId" required>
                <option value="" disabled selected>Selecione um jogo</option>
                ${optionsJogos}
            </select>
        </div>

        <div class="form-group">
            <label>Time 1</label>
            <select name="team1Id" required>
                <option value="" disabled selected>Selecione o time 1</option>
                ${optionsTimes}
            </select>
        </div>

        <div class="form-group">
            <label>Time 2</label>
            <select name="team2Id" required>
                <option value="" disabled selected>Selecione o time 2</option>
                ${optionsTimes}
            </select>
        </div>

        <div class="form-group">
            <label>Data e Hora</label>
            <input type="datetime-local" name="date" required style="color-scheme: dark;">
        </div>

        <div class="form-group">
            <label>Status</label>
            <select name="status" required>
                <option value="scheduled" selected>Agendado</option>
                <option value="finished">Finalizado</option>
            </select>
        </div>

        <div style="display:flex; gap: 1rem;">
            <div class="form-group" style="flex:1;">
                <label>Placar Time 1</label>
                <input type="number" name="score1" min="0" value="0" required>
            </div>
            <div class="form-group" style="flex:1;">
                <label>Placar Time 2</label>
                <input type="number" name="score2" min="0" value="0" required>
            </div>
        </div>

        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" onclick="fecharModal()">Cancelar</button>
        </div>
    </form>
`,
    };

    formContent.innerHTML = formularios[tipo] || '';
};

window.previewLogo = function (url) {
    const container = document.getElementById('logo-preview');
    const img = document.getElementById('logo-preview-img');

    if (!url || url.trim() === '') {
        container.style.display = 'none';
        return;
    }

    img.src = url;
    img.onload = () => {
        container.style.display = 'block';
    };
    img.onerror = () => {
        container.style.display = 'none';
    };
};

window.fecharModal = function () {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

window.salvarItem = function (event, colecao) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());

    // Validação para confrontos
    if (colecao === 'confrontos') {
        if (dados.team1Id === dados.team2Id) {
            alert('Os times do confronto devem ser diferentes!');
            return;
        }
    }

    // Limpa o trailerId: se o usuário colar a URL inteira, extrai só o ID
    if (dados.trailerId) {
        dados.trailerId = extrairIdYoutube(dados.trailerId);
    }

    const maxId = state[colecao].reduce((max, item) => (item.id > max ? item.id : max), 0);
    dados.id = maxId + 1;

    if (dados.teamId) dados.teamId = Number(dados.teamId);
    if (dados.gameId) dados.gameId = Number(dados.gameId);
    if (dados.team1Id) dados.team1Id = Number(dados.team1Id);
    if (dados.team2Id) dados.team2Id = Number(dados.team2Id);
    if (dados.score1 !== undefined) dados.score1 = Number(dados.score1);
    if (dados.score2 !== undefined) dados.score2 = Number(dados.score2);

    state[colecao].push(dados);
    renderizarTudo();
    fecharModal();
};

window.encerrarConfrontos = function (id) {
    const confronto = state.confrontos.find(c => c.id == id);
    if (!confronto) return;

    const time1 = state.times.find(t => t.id == confronto.team1Id);
    const time2 = state.times.find(t => t.id == confronto.team2Id);

    const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
    const placar2 = prompt(`Placar para ${time2?.name}:`, '0');

    if (placar1 !== null && placar2 !== null) {
        confronto.score1 = Number(placar1);
        confronto.score2 = Number(placar2);
        confronto.status = 'finished';
        renderizarTudo();
    }
};

// --- Modal de Detalhes do Jogo ---

window.abrirDetalhesJogo = function (jogoId) {
    const jogo = state.jogos.find(j => j.id === jogoId);
    if (!jogo) return;

    // Preenche os dados do jogo
    document.getElementById('detalhe-logo').src = jogo.logo;
    document.getElementById('detalhe-titulo').textContent = jogo.name;
    document.getElementById('detalhe-genero').textContent = jogo.genre;

    // Configura o vídeo
    const videoFrame = document.getElementById('detalhe-video');
    videoFrame.src = `https://www.youtube.com/embed/${jogo.trailerId}?autoplay=1`;

    // Filtra os confrontos deste jogo
    const confrontosDoJogo = state.confrontos.filter(c => c.gameId === jogoId);

    // Renderiza os confrontos
    const listaConfrontos = document.getElementById('detalhe-confrontos');

    if (confrontosDoJogo.length === 0) {
        listaConfrontos.innerHTML = '<p class="subtitle">Nenhum confronto agendado para este jogo.</p>';
    } else {
        listaConfrontos.innerHTML = confrontosDoJogo.map(c => {
            const time1 = state.times.find(t => t.id === c.team1Id);
            const time2 = state.times.find(t => t.id === c.team2Id);
            const data = new Date(c.date).toLocaleString('pt-BR');
            const statusClass = c.status === 'finished' ? 'status-finished' : 'status-scheduled';
            const statusText = c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO';

            return `
                <div class="confronto-item">
                    <div class="confronto-info">
                        <span class="confronto-data">${data}</span>
                        <span class="confronto-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="confronto-times">
                        <span class="time-nome">${time1?.name || '???'}</span>
                        <span class="confronto-placar">${c.score1} x ${c.score2}</span>
                        <span class="time-nome">${time2?.name || '???'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Exibe o modal
    const modalDetalhes = document.getElementById('modal-detalhes');
    modalDetalhes.style.display = 'flex';
    setTimeout(() => {
        modalDetalhes.style.opacity = '1';
        modalDetalhes.style.pointerEvents = 'all';
    }, 10);
};

window.fecharDetalhesJogo = function () {
    const modalDetalhes = document.getElementById('modal-detalhes');
    modalDetalhes.style.opacity = '0';
    modalDetalhes.style.pointerEvents = 'none';

    // Para o vídeo
    document.getElementById('detalhe-video').src = '';

    setTimeout(() => {
        modalDetalhes.style.display = 'none';
    }, 300);
};