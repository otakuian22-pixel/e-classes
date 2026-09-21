const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuração de Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// BASE DE DADOS EM MEMÓRIA (Arrays)
// ==========================================

const autores = [
  { id: 1, nome: "Machado de Assis", nacionalidade: "Brasileira" },
  { id: 2, nome: "Clarice Lispector", nacionalidade: "Brasileira" },
  { id: 3, nome: "J.K. Rowling", nacionalidade: "Britânica" },
  { id: 4, nome: "J.R.R. Tolkien", nacionalidade: "Britânica" },
  { id: 5, nome: "George R.R. Martin", nacionalidade: "Norte-americana" },
  { id: 6, nome: "Isaac Asimov", nacionalidade: "Russa/Norte-americana" },
  { id: 7, nome: "Arthur C. Clarke", nacionalidade: "Britânica" },
  { id: 8, nome: "Agatha Christie", nacionalidade: "Britânica" },
  { id: 9, nome: "Stephen King", nacionalidade: "Norte-americana" },
  { id: 10, nome: "Gabriel García Márquez", nacionalidade: "Colombiana" }
];

const livros = [
  { id: 101, titulo: "Dom Casmurro", autor_id: 1, anoPublicacao: 1899, genero: "Romance" },
  { id: 102, titulo: "A Hora da Estrela", autor_id: 2, anoPublicacao: 1977, genero: "Ficção" },
  { id: 103, titulo: "Harry Potter e a Pedra Filosofal", autor_id: 3, anoPublicacao: 1997, genero: "Fantasia" },
  { id: 104, titulo: "O Senhor dos Anéis: A Sociedade do Anel", autor_id: 4, anoPublicacao: 1954, genero: "Fantasia" },
  { id: 105, titulo: "A Guerra dos Tronos", autor_id: 5, anoPublicacao: 1996, genero: "Fantasia Épica" },
  { id: 106, titulo: "Fundação", autor_id: 6, anoPublicacao: 1951, genero: "Ficção Científica" },
  { id: 107, titulo: "2001: Uma Odisseia no Espaço", autor_id: 7, anoPublicacao: 1968, genero: "Ficção Científica" },
  { id: 108, titulo: "O Assassinato no Expresso do Oriente", autor_id: 8, anoPublicacao: 1934, genero: "Mistério" },
  { id: 109, titulo: "O Iluminado", autor_id: 9, anoPublicacao: 1977, genero: "Terror" },
  { id: 110, titulo: "Cem Anos de Solidão", autor_id: 10, anoPublicacao: 1967, genero: "Realismo Mágico" }
];

const emprestimos = [
  { id: 1001, livro_id: 101, usuario: "João Silva", dataEmprestimo: "2023-10-01", dataDevolucao: "2023-10-15", status: "Devolvido" },
  { id: 1002, livro_id: 103, usuario: "Maria Oliveira", dataEmprestimo: "2023-10-05", dataDevolucao: "2023-10-20", status: "Devolvido" },
  { id: 1003, livro_id: 105, usuario: "Carlos Souza", dataEmprestimo: "2023-11-01", dataDevolucao: "2023-11-15", status: "Devolvido" },
  { id: 1004, livro_id: 110, usuario: "Ana Costa", dataEmprestimo: "2023-11-10", dataDevolucao: null, status: "Atrasado" },
  { id: 1005, livro_id: 102, usuario: "Pedro Santos", dataEmprestimo: "2023-11-20", dataDevolucao: "2023-12-05", status: "Devolvido" },
  { id: 1006, livro_id: 107, usuario: "Fernanda Lima", dataEmprestimo: "2023-12-01", dataDevolucao: null, status: "Em andamento" },
  { id: 1007, livro_id: 109, usuario: "Lucas Mendes", dataEmprestimo: "2023-12-02", dataDevolucao: null, status: "Em andamento" },
  { id: 1008, livro_id: 104, usuario: "Juliana Ferreira", dataEmprestimo: "2023-12-03", dataDevolucao: null, status: "Em andamento" },
  { id: 1009, livro_id: 108, usuario: "Marcos Rocha", dataEmprestimo: "2023-11-15", dataDevolucao: "2023-11-30", status: "Devolvido" },
  { id: 1010, livro_id: 106, usuario: "Camila Alves", dataEmprestimo: "2023-12-04", dataDevolucao: null, status: "Em andamento" }
];

// ==========================================
// ROTAS DA API
// ==========================================

// Rota Global (Documentação da API)
app.get('/', (req, res) => {
  res.json({
    nome: "API Monolítica de Biblioteca",
    versao: "1.0.0",
    descricao: "Esta API fornece informações sobre o acervo de uma biblioteca, incluindo dados sobre livros, autores e o registro de empréstimos.",
    organizacao_dados: {
      autores: "Lista os escritores disponíveis. Cada autor possui um 'id' único, 'nome' e 'nacionalidade'.",
      livros: "Lista as obras do acervo. Cada livro possui um 'id', 'titulo', 'anoPublicacao', 'genero' e um 'autor_id' (que faz referência ao id do autor).",
      emprestimos: "Lista os registros de saída de livros. Cada empréstimo possui um 'id', 'usuario', datas, status e um 'livro_id' (referenciando o livro emprestado)."
    },
    portas_de_entrada: [
      { metodo: "GET", endpoint: "/autores", descricao: "Retorna a lista completa de autores." },
      { metodo: "GET", endpoint: "/autores/:id", descricao: "Retorna um autor específico pelo ID." },
      { metodo: "GET", endpoint: "/livros", descricao: "Retorna a lista completa de livros." },
      { metodo: "GET", endpoint: "/livros/:id", descricao: "Retorna um livro específico pelo ID." },
      { metodo: "GET", endpoint: "/emprestimos", descricao: "Retorna a lista de todos os empréstimos." },
      { metodo: "GET", endpoint: "/emprestimos/:id", descricao: "Retorna um empréstimo específico pelo ID." }
    ]
  });
});

// --- Rotas de Autores ---
app.get('/autores', (req, res) => {
  res.json(autores);
});

app.get('/autores/:id', (req, res) => {
  const autor = autores.find(a => a.id === parseInt(req.params.id));
  if (!autor) return res.status(404).json({ erro: "Autor não encontrado." });
  res.json(autor);
});

// --- Rotas de Livros ---
app.get('/livros', (req, res) => {
  res.json(livros);
});

app.get('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === parseInt(req.params.id));
  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
  res.json(livro);
});

// --- Rotas de Empréstimos ---
app.get('/emprestimos', (req, res) => {
  res.json(emprestimos);
});

app.get('/emprestimos/:id', (req, res) => {
  const emprestimo = emprestimos.find(e => e.id === parseInt(req.params.id));
  if (!emprestimo) return res.status(404).json({ erro: "Empréstimo não encontrado." });
  res.json(emprestimo);
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso!`);
  console.log(`Acesse a documentação da API em: http://localhost:${PORT}/`);
});