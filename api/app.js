const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Lê o arquivo de dados
function lerDados() {
    const caminho = path.join(__dirname, 'data.json');
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    return JSON.parse(conteudo);
}

// GET / - boas vindas
app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: 'Bem vindo à API GamerClass',
        status: 'sucesso',
        rotas: ['/api/jogos', '/api/times', '/api/competidores', '/api/confrontos'],
    });
});

// GET /api/jogos - todos os jogos
app.get('/api/jogos', (req, res) => {
    const { games } = lerDados();
    res.status(200).json(games);
});

// GET /api/jogos/:id - um jogo pelo id
app.get('/api/jogos/:id', (req, res) => {
    const { games } = lerDados();
    const jogo = games.find(j => j.id === Number(req.params.id));

    if (!jogo) {
        return res.status(404).json({ erro: 'Jogo não encontrado' });
    }

    res.status(200).json(jogo);
});

// GET /api/times - todos os times
app.get('/api/times', (req, res) => {
    const { teams } = lerDados();
    res.status(200).json(teams);
});

// GET /api/times/:id - um time pelo id
app.get('/api/times/:id', (req, res) => {
    const { teams } = lerDados();
    const time = teams.find(t => t.id === Number(req.params.id));

    if (!time) {
        return res.status(404).json({ erro: 'Time não encontrado' });
    }

    res.status(200).json(time);
});

// GET /api/competidores - todos os competidores
app.get('/api/competidores', (req, res) => {
    const { competitors } = lerDados();
    res.status(200).json(competitors);
});

// GET /api/competidores/:id - um competidor pelo id
app.get('/api/competidores/:id', (req, res) => {
    const { competitors } = lerDados();
    const competidor = competitors.find(c => c.id === Number(req.params.id));

    if (!competidor) {
        return res.status(404).json({ erro: 'Competidor não encontrado' });
    }

    res.status(200).json(competidor);
});

// GET /api/confrontos - todos os confrontos
app.get('/api/confrontos', (req, res) => {
    const { matches } = lerDados();
    res.status(200).json(matches);
});

// GET /api/confrontos/:id - um confronto pelo id
app.get('/api/confrontos/:id', (req, res) => {
    const { matches } = lerDados();
    const confronto = matches.find(m => m.id === Number(req.params.id));

    if (!confronto) {
        return res.status(404).json({ erro: 'Confronto não encontrado' });
    }

    res.status(200).json(confronto);
});

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        mensagem: 'Apenas requisições GET são suportadas nesta API',
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});