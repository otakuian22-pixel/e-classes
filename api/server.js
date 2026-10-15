const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..', 'front')));

const CAMINHO_DADOS = path.join(__dirname, 'data.json');

// Rota da API -> chave dentro do data.json + campos obrigatórios no POST
const RECURSOS = {
    jogos:        { chave: 'games',       nome: 'Jogo',       obrigatorios: ['name', 'genre', 'logo', 'trailerId'] },
    times:        { chave: 'teams',       nome: 'Time',       obrigatorios: ['name', 'color'] },
    competidores: { chave: 'competitors', nome: 'Competidor', obrigatorios: ['name', 'nickname', 'teamId'] },
    confrontos:   { chave: 'matches',     nome: 'Confronto',  obrigatorios: ['gameId', 'team1Id', 'team2Id', 'date'] },
};

function lerDados() {
    return JSON.parse(fs.readFileSync(CAMINHO_DADOS, 'utf-8'));
}

function escreverDados(dados) {
    fs.writeFileSync(CAMINHO_DADOS, JSON.stringify(dados, null, 2), 'utf-8');
}

// Valida o recurso da URL (jogos, times, ...)
function validarRecurso(req, res, next) {
    const recurso = RECURSOS[req.params.recurso];
    if (!recurso) {
        return res.status(404).json({ erro: 'Recurso não encontrado' });
    }
    req.recurso = recurso;
    next();
}

// GET / - boas vindas
app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: 'Bem vindo à API GamerClass',
        status: 'sucesso',
        rotas: Object.keys(RECURSOS).map(r => `/api/${r}`),
    });
});

// GET /api/:recurso - lista
app.get('/api/:recurso', validarRecurso, (req, res) => {
    res.status(200).json(lerDados()[req.recurso.chave]);
});

// GET /api/:recurso/:id - um item
app.get('/api/:recurso/:id', validarRecurso, (req, res) => {
    const { chave, nome } = req.recurso;
    const item = lerDados()[chave].find(i => i.id === Number(req.params.id));

    if (!item) return res.status(404).json({ erro: `${nome} não encontrado` });
    res.status(200).json(item);
});

// POST /api/:recurso - cria
app.post('/api/:recurso', validarRecurso, (req, res) => {
    const { chave, obrigatorios } = req.recurso;
    const faltando = obrigatorios.filter(c => req.body[c] === undefined || req.body[c] === '');

    if (faltando.length) {
        return res.status(400).json({ erro: `Campos obrigatórios: ${faltando.join(', ')}` });
    }

    const dados = lerDados();
    const maxId = dados[chave].reduce((max, i) => Math.max(max, i.id), 0);
    const novo = { ...req.body, id: maxId + 1 };

    dados[chave].push(novo);
    escreverDados(dados);
    res.status(201).json(novo);
});

// PUT /api/:recurso/:id - atualiza (mescla os campos enviados)
app.put('/api/:recurso/:id', validarRecurso, (req, res) => {
    const { chave, nome } = req.recurso;
    const dados = lerDados();
    const indice = dados[chave].findIndex(i => i.id === Number(req.params.id));

    if (indice === -1) return res.status(404).json({ erro: `${nome} não encontrado` });

    dados[chave][indice] = { ...dados[chave][indice], ...req.body, id: dados[chave][indice].id };
    escreverDados(dados);
    res.status(200).json(dados[chave][indice]);
});

// DELETE /api/:recurso/:id - remove
app.delete('/api/:recurso/:id', validarRecurso, (req, res) => {
    const { chave, nome } = req.recurso;
    const id = Number(req.params.id);
    const dados = lerDados();
    const existe = dados[chave].some(i => i.id === id);

    if (!existe) return res.status(404).json({ erro: `${nome} não encontrado` });

    dados[chave] = dados[chave].filter(i => i.id !== id);

    // Mantém a consistência dos dados relacionados
    if (chave === 'games') {
        dados.matches = dados.matches.filter(m => m.gameId !== id);
    }
    if (chave === 'teams') {
        dados.matches = dados.matches.filter(m => m.team1Id !== id && m.team2Id !== id);
        dados.competitors = dados.competitors.map(c => (c.teamId === id ? { ...c, teamId: null } : c));
    }

    escreverDados(dados);
    res.status(200).json({ mensagem: `${nome} removido com sucesso` });
});

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});