// BASE_URL aponta para o JSON local enquanto a API não está integrada.
// Quando a API estiver pronta, basta trocar para: 'http://localhost:3000/api'
const BASE_URL = 'http://localhost:3000/api/';

async function getData(endpoint) {
    try{
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if(!response.ok){
            throw new Error(`Erro de link: ${response.statusText}`);
        }
        console.log(response);
        const data = await response.json()
        return data;
    }catch(error){
        alert(`Tivemos problemas, tente novamente mais tarde ERRO: ${error}`);
    }
}

// Retorna todos os jogos
async function getJogos() {
    return getData('jogos');
}

// Retorna todos os times
async function getTimes() {
    return getData('times');
}

// Retorna todos os competidores
async function getCompetidores() {
    return getData('competidores');
}

// Retorna todos os confrontos
async function getConfrontos() {
    return getData('confrontos');
}