/* BioTetris - Lógica do jogo de classificação dos vertebrados */

// Lista das 4 colunas na ordem da tela (índices 0, 1, 2 e 3)
const GRUPOS_COLUNAS = ["Mamíferos", "Aves", "Répteis", "Anfíbios"];

// Banco de 10 animais desafiadores com explicação educativa para cada um
const LISTA_ANIMAIS = [
  {
    nome: "Baleia-jubarte",
    grupo: "Mamíferos",
    explicacao: "A baleia vive na água, mas respira por pulmões, tem glândulas mamárias e pelos na fase fetal."
  },
  {
    nome: "Pinguim",
    grupo: "Aves",
    explicacao: "Mesmo sem voar, o pinguim possui penas, bico e põe ovos com casca calcária, sendo uma ave."
  },
  {
    nome: "Salamandra",
    grupo: "Anfíbios",
    explicacao: "A salamandra parece um lagarto, mas tem pele úmida sem escamas e passa por metamorfose."
  },
  {
    nome: "Morcego",
    grupo: "Mamíferos",
    explicacao: "O morcego é o único mamífero capaz de voar de verdade; possui pelos e amamenta seus filhotes."
  },
  {
    nome: "Tartaruga-marinha",
    grupo: "Répteis",
    explicacao: "A tartaruga tem pele seca e queratinizada (casco e escamas) e bota ovos em terra firme."
  },
  {
    nome: "Cobra-cega",
    grupo: "Anfíbios",
    explicacao: "Apesar do nome, a cobra-cega (cecília) não tem escamas e tem pele fina e úmida, sendo um anfíbio."
  },
  {
    nome: "Ornitorrinco",
    grupo: "Mamíferos",
    explicacao: "Mesmo pondo ovos e tendo bico, o ornitorrinco tem pelos e produz leite para os filhotes."
  },
  {
    nome: "Avestruz",
    grupo: "Aves",
    explicacao: "O avestruz não voa, mas tem corpo coberto de penas, asas e bico característicos das aves."
  },
  {
    nome: "Jacaré-do-papo-amarelo",
    grupo: "Répteis",
    explicacao: "O jacaré possui pele grossa com placas córneas e respiração exclusivamente pulmonar."
  },
  {
    nome: "Perereca",
    grupo: "Anfíbios",
    explicacao: "A perereca depende de ambientes úmidos para respiração cutânea e reprodução na água."
  }
];

// Variáveis de estado da partida
let animaisDaPartida = [];
let indiceAtual = 0;
let colunaAtual = 1; // Começa na segunda coluna (índice 1)
let posicaoY = 0; // Distância em pixels do topo da arena
let pontos = 0;
let vidas = 2; // Nível difícil: apenas 2 vidas
let jogoRodando = false;
let acelerando = false;
let tempoInicio = 0;
let ultimoQuadro = 0;
let idAnimacao = null;

// Constantes de física da queda
const ALTURA_ARENA = 310;
const ALTURA_BASE = 58;
const ALTURA_BLOCO = 48;
const LIMITE_QUEDA = ALTURA_ARENA - ALTURA_BASE - ALTURA_BLOCO;
const META_ACERTOS = 7; // Precisa de pelo menos 7 de 10 para vencer

// Referências aos elementos da tela
const telaInicio = document.getElementById("tela-inicio");
const telaFim = document.getElementById("tela-fim");
const blocoAtivo = document.getElementById("bloco-ativo");
const nomeAnimalEl = document.getElementById("nome-animal");
const placarRodada = document.getElementById("placar-rodada");
const placarPontos = document.getElementById("placar-pontos");
const placarVidas = document.getElementById("placar-vidas");
const caixaFeedback = document.getElementById("caixa-feedback");
const tituloFim = document.getElementById("titulo-fim");
const resumoFim = document.getElementById("resumo-fim");
const detalheFim = document.getElementById("detalhe-fim");

// Embaralha uma lista para cada partida ter uma ordem diferente
function embaralharLista(listaOriginal) {
  const copia = [...listaOriginal];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}

// Atualiza os textos de rodada, pontos e corações no cabeçalho
function atualizarPlacar() {
  const numeroExibido = Math.min(indiceAtual + 1, LISTA_ANIMAIS.length);
  placarRodada.textContent = `Bloco: ${numeroExibido}/${LISTA_ANIMAIS.length}`;
  placarPontos.textContent = `Acertos: ${pontos}`;
  placarVidas.textContent = vidas > 0 ? `Vidas: ${"❤️".repeat(vidas)}` : "Vidas: 💔";
}

// Atualiza a posição horizontal e vertical do bloco na tela
function desenharBloco() {
  blocoAtivo.style.left = `${colunaAtual * 25}%`;
  blocoAtivo.style.top = `${posicaoY}px`;
}

// Prepara o próximo animal no topo da arena
function carregarProximoBloco() {
  if (indiceAtual >= animaisDaPartida.length || vidas <= 0) {
    finalizarPartida();