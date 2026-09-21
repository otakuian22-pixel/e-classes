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
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

// --- Funções de renderização ---

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
        <div class="card">
            <span class="card-tag">${j.genre}</span>
            <h3>${j.name}</h3>
            <p class="subtitle">ID: ${j.id}</p>
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
                    <input type="text" name="name" required placeholder="Ex: CS2">
                </div>
                <div class="form-group">
                    <label>Gênero</label>
                    <input type="text" name="genre" required placeholder="Ex: FPS">
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
                    <label>Nome da Equipe</label>
                    <input type="text" name="name" required placeholder="Ex: Ninjas da Noite">
                </div>
                <div class="form-group">
                    <label>Cor Identidade</label>
                    <input type="color" name="color" value="#6366f1">
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Criar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
        competidor: `
            <h2>Registrar Competidor</h2>
            <form onsubmit="salvarItem(event, 'competidores')">
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" name="nickname" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <select name="teamId" required>${optionsTimes}</select>
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Registrar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
        confronto: `
            <h2>Novo Confronto</h2>
            <form onsubmit="salvarItem(event, 'confrontos')">
                <div class="form-group">
                    <label>Jogo</label>
                    <select name="gameId" required>${optionsJogos}</select>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Time A</label>
                        <select name="team1Id" required>${optionsTimes}</select>
                    </div>
                    <div class="form-group">
                        <label>Time B</label>
                        <select name="team2Id" required>${optionsTimes}</select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Data/Hora</label>
                    <input type="datetime-local" name="date" required value="${new Date().toISOString().slice(0, 16)}">
                </div>
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Agendar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
    };

    formContent.innerHTML = formularios[tipo] || '';
};

window.fecharModal = function () {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
};

window.salvarItem = function (event, colecao) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());

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