// Estado global da aplicação
let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: [],
};

// tipo do formulário -> coleção da API/state
const COLECOES = {
    jogo: 'jogos',
    time: 'times',
    competidor: 'competidores',
    confronto: 'confrontos',
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarNavegacao();
    renderizarTudo();
});

// Busca todos os dados via service
async function carregarDados() {
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
}

// Configura cliques na navegação lateral
function configurarNavegacao() {
    const itens = document.querySelectorAll('#sidebar-nav li');

    itens.forEach(item => {
        item.addEventListener('click', () => {
            trocarView(item.getAttribute('data-view'));
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

// Botões Editar / Excluir usados em todos os cards
function acoesHTML(tipo, id) {
    return `
        <div class="card-actions">
            <button class="btn-secondary" onclick="event.stopPropagation(); abrirFormulario('${tipo}', ${id})">Editar</button>
            <button class="btn-danger" onclick="event.stopPropagation(); excluirItem('${COLECOES[tipo]}', ${id})">Excluir</button>
        </div>
    `;
}

function renderizarBannerHero() {
    const banner = document.getElementById('hero-banner');
    if (!banner || state.jogos.length === 0) return;

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

    const track = banner.querySelector('.hero-banner-track');
    track.style.animationDuration = `${state.jogos.length * 6}s`;
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
    <span class="card-tag">${j.genre}</span>
    <img src="${j.logo}" alt="Logo ${j.name}" class="card-logo" onerror="this.style.display='none'">
    <h3>${j.name}</h3>
    ${acoesHTML('jogo', j.id)}
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
            ${acoesHTML('time', t.id)}
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
                ${acoesHTML('competidor', c.id)}
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
                        <div class="score">${c.score1 ?? 0}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-score">
                        <strong>${time2?.name || '???'}</strong>
                        <div class="score">${c.score2 ?? 0}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <span class="card-tag" style="background: ${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled'
                        ? `<button class="btn-secondary" onclick="encerrarConfrontos(${c.id})" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 8px;">Finalizar</button>`
                        : ''}
                </div>
                ${acoesHTML('confronto', c.id)}
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

// --- Modal e formulários ---

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

// Converte uma data qualquer para o formato do <input type="datetime-local">
function paraInputData(valor) {
    const d = new Date(valor);
    if (!valor || isNaN(d)) return '';
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Gera <option>s marcando o selecionado
function opcoesHTML(lista, selecionadoId, rotulo) {
    return lista.map(i =>
        `<option value="${i.id}" ${i.id == selecionadoId ? 'selected' : ''}>${i[rotulo]}</option>`
    ).join('');
}

function formularioHTML(tipo, item) {
    const v = item || {};
    const colecao = COLECOES[tipo];
    const idAttr = item ? item.id : 'null';
    const acao = item ? 'Editar' : 'Adicionar';

    const botoes = `
        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    const abrir = titulo => `<h2 style="margin-bottom:1.5rem">${acao} ${titulo}</h2>
        <form onsubmit="salvarItem(event, '${colecao}', ${idAttr})">`;

    if (tipo === 'jogo') {
        const generos = ['MOBA', 'FPS', 'Esport', 'Fighting', 'RPG', 'Battle Royale', 'Estratégia', 'Card Game', 'Outro'];
        return `
            ${abrir('Jogo')}
                <div class="form-group">
                    <label>Nome do Jogo</label>
                    <input type="text" name="name" required placeholder="Ex: League of Legends" value="${v.name || ''}">
                </div>
                <div class="form-group">
                    <label>Gênero</label>
                    <select name="genre" required>
                        <option value="" disabled ${v.genre ? '' : 'selected'}>Selecione um gênero</option>
                        ${generos.map(g => `<option value="${g}" ${g === v.genre ? 'selected' : ''}>${g}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>URL da Logo</label>
                    <input type="url" name="logo" required placeholder="https://exemplo.com/logo.png"
                        value="${v.logo || ''}" oninput="previewLogo(this.value)">
                    <small style="color: var(--text-dim); font-size: 0.75rem; display: block; margin-top: 0.5rem;">
                        Cole o link direto da imagem (deve terminar em .png, .jpg ou .svg)
                    </small>
                    <div id="logo-preview" style="margin-top: 1rem; display: none;">
                        <img id="logo-preview-img" src="" alt="Preview" style="max-width: 120px; max-height: 120px; object-fit: contain; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 12px;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Trailer (ID ou link do YouTube)</label>
                    <input type="text" name="trailerId" required placeholder="Ex: vzHrjOMfHPY" value="${v.trailerId || ''}">
                    <small style="color: var(--text-dim); font-size: 0.75rem; display: block; margin-top: 0.5rem;">
                        Pode colar o link inteiro: o ID é extraído automaticamente.
                    </small>
                </div>
                ${botoes}
            </form>`;
    }

    if (tipo === 'time') {
        return `
            ${abrir('Time')}
                <div class="form-group">
                    <label>Nome do Time</label>
                    <input type="text" name="name" required placeholder="Ex: 3º Info A" value="${v.name || ''}">
                </div>
                <div class="form-group">
                    <label>Cor do Time</label>
                    <input type="color" name="color" value="${v.color || '#6E1E1F'}">
                </div>
                ${botoes}
            </form>`;
    }

    if (tipo === 'competidor') {
        return `
            ${abrir('Competidor')}
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="name" required placeholder="Nome completo" value="${v.name || ''}">
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" name="nickname" required placeholder="Ex: Faker" value="${v.nickname || ''}">
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <select name="teamId" required>
                        <option value="" disabled ${v.teamId ? '' : 'selected'}>Selecione um time</option>
                        ${opcoesHTML(state.times, v.teamId, 'name')}
                    </select>
                </div>
                ${botoes}
            </form>`;
    }

    if (tipo === 'confronto') {
        return `
            ${abrir('Confronto')}
                <div class="form-group">
                    <label>Jogo</label>
                    <select name="gameId" required>
                        <option value="" disabled ${v.gameId ? '' : 'selected'}>Selecione um jogo</option>
                        ${opcoesHTML(state.jogos, v.gameId, 'name')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Time 1</label>
                    <select name="team1Id" required>
                        <option value="" disabled ${v.team1Id ? '' : 'selected'}>Selecione o time 1</option>
                        ${opcoesHTML(state.times, v.team1Id, 'name')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Time 2</label>
                    <select name="team2Id" required>
                        <option value="" disabled ${v.team2Id ? '' : 'selected'}>Selecione o time 2</option>
                        ${opcoesHTML(state.times, v.team2Id, 'name')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Data e hora</label>
                    <input type="datetime-local" name="date" required value="${paraInputData(v.date)}">
                </div>
                <div style="display:flex; gap: 1rem;">
                    <div class="form-group" style="flex:1">
                        <label>Placar Time 1</label>
                        <input type="number" name="score1" min="0" value="${v.score1 ?? 0}">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label>Placar Time 2</label>
                        <input type="number" name="score2" min="0" value="${v.score2 ?? 0}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="scheduled" ${v.status !== 'finished' ? 'selected' : ''}>Agendado</option>
                        <option value="finished" ${v.status === 'finished' ? 'selected' : ''}>Finalizado</option>
                    </select>
                </div>
                ${botoes}
            </form>`;
    }

    return '';
}

// id opcional: se vier, abre em modo edição
window.abrirFormulario = function (tipo, id) {
    const item = id !== undefined
        ? state[COLECOES[tipo]].find(i => i.id == id)
        : null;

    formContent.innerHTML = formularioHTML(tipo, item);

    // Mostra o preview da logo ao editar um jogo
    if (tipo === 'jogo' && item) previewLogo(item.logo);

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    }, 10);
};

window.previewLogo = function (url) {
    const container = document.getElementById('logo-preview');
    const img = document.getElementById('logo-preview-img');
    if (!container || !img) return;

    if (!url || url.trim() === '') {
        container.style.display = 'none';
        return;
    }

    img.src = url;
    img.onload = () => { container.style.display = 'block'; };
    img.onerror = () => { container.style.display = 'none'; };
};

window.fecharModal = function () {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

// Recarrega do servidor e redesenha a tela
async function atualizarTela() {
    await carregarDados();
    renderizarTudo();
}

// Cria (POST) ou atualiza (PUT) conforme houver id
window.salvarItem = async function (event, colecao, id) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());

    if (colecao === 'confrontos' && dados.team1Id === dados.team2Id) {
        alert('Os times do confronto devem ser diferentes!');
        return;
    }

    if (dados.trailerId) dados.trailerId = extrairIdYoutube(dados.trailerId);

    ['teamId', 'gameId', 'team1Id', 'team2Id', 'score1', 'score2'].forEach(campo => {
        if (dados[campo] !== undefined && dados[campo] !== '') dados[campo] = Number(dados[campo]);
    });

    const resultado = id
        ? await atualizarItem(colecao, id, dados)
        : await criarItem(colecao, dados);

    if (!resultado) return; // erro já foi mostrado pelo api.js

    await atualizarTela();
    fecharModal();
};

// Remove (DELETE)
window.excluirItem = async function (colecao, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const resultado = await excluirItemApi(colecao, id);
    if (resultado) await atualizarTela();
};

// Finaliza um confronto agendado (PUT)
window.encerrarConfrontos = async function (id) {
    const confronto = state.confrontos.find(c => c.id == id);
    if (!confronto) return;

    const time1 = state.times.find(t => t.id == confronto.team1Id);
    const time2 = state.times.find(t => t.id == confronto.team2Id);

    const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
    if (placar1 === null) return;
    const placar2 = prompt(`Placar para ${time2?.name}:`, '0');
    if (placar2 === null) return;

    if (isNaN(Number(placar1)) || isNaN(Number(placar2))) {
        alert('Digite apenas números nos placares.');
        return;
    }

    const resultado = await atualizarItem('confrontos', id, {
        score1: Number(placar1),
        score2: Number(placar2),
        status: 'finished',
    });

    if (resultado) await atualizarTela();
};

// --- Modal de Detalhes do Jogo ---

window.abrirDetalhesJogo = function (jogoId) {
    const jogo = state.jogos.find(j => j.id === jogoId);
    if (!jogo) return;

    document.getElementById('detalhe-logo').src = jogo.logo;
    document.getElementById('detalhe-titulo').textContent = jogo.name;
    document.getElementById('detalhe-genero').textContent = jogo.genre;

    const videoFrame = document.getElementById('detalhe-video');
    videoFrame.src = `https://www.youtube.com/embed/${jogo.trailerId}?autoplay=1`;

    const confrontosDoJogo = state.confrontos.filter(c => c.gameId === jogoId);
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

    document.getElementById('detalhe-video').src = '';

    setTimeout(() => {
        modalDetalhes.style.display = 'none';
    }, 300);
};