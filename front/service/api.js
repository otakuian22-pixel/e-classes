const BASE_URL = 'http://localhost:3000/api/';

// Função genérica: serve para GET, POST, PUT e DELETE
async function request(endpoint, method = 'GET', body) {
    try {
        const opcoes = { method, headers: {} };

        if (body !== undefined) {
            opcoes.headers['Content-Type'] = 'application/json';
            opcoes.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, opcoes);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.erro || response.statusText);
        }
        return data;
    } catch (error) {
        alert(`Tivemos problemas, tente novamente mais tarde. ERRO: ${error.message}`);
        return null;
    }
}

// --- GET ---
const getJogos = async () => (await request('jogos')) || [];
const getTimes = async () => (await request('times')) || [];
const getCompetidores = async () => (await request('competidores')) || [];
const getConfrontos = async () => (await request('confrontos')) || [];

// --- POST / PUT / DELETE (colecao: 'jogos' | 'times' | 'competidores' | 'confrontos') ---
const criarItem = (colecao, dados) => request(colecao, 'POST', dados);
const atualizarItem = (colecao, id, dados) => request(`${colecao}/${id}`, 'PUT', dados);
const excluirItemApi = (colecao, id) => request(`${colecao}/${id}`, 'DELETE');