// ============================================================
// ⚠️ SUA URL DO APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

let listaExercicios = [];
let numeroDigitado = ""; 

// MUDANÇA: DOMContentLoaded aciona instantaneamente
document.addEventListener('DOMContentLoaded', async () => {
    const statusLoading = document.getElementById('loading-search');
    
    try {
        // Tenta baixar a planilha imediatamente
        const res = await fetch(API_URL);
        const dados = await res.json();
        
        if (Array.isArray(dados)) {
            listaExercicios = dados;
        }
        
        // Sucesso: Arranca o spinner da tela!
        if (statusLoading) statusLoading.classList.add('hidden');
        
    } catch (err) {
        console.error("Erro no Fetch:", err);
        // Se a internet cair, ele avisa na tela em vez de girar infinito
        if (statusLoading) statusLoading.innerHTML = "❌ Erro ao sincronizar. Verifique a internet e recarregue.";
    }
});

// --- FUNÇÕES DO TECLADO KIOSK ---
function digitar(numero) {
    if (numeroDigitado.length < 4) { 
        numeroDigitado += numero;
        atualizarDisplay();
    }
}

function apagar() {
    if (numeroDigitado.length > 0) {
        numeroDigitado = numeroDigitado.slice(0, -1);
        atualizarDisplay();
    }
}

function atualizarDisplay() {
    const display = document.getElementById('display-numero');
    const erroMsg = document.getElementById('erro-msg');
    
    erroMsg.classList.remove('erro-visivel');

    if (numeroDigitado === "") {
        display.innerText = "_ _ _";
        display.classList.remove('display-ativo');
        display.classList.add('display-vazio');
    } else {
        display.innerText = numeroDigitado;
        display.classList.remove('display-vazio');
        display.classList.add('display-ativo');
    }
}

// --- FUNÇÃO DE BUSCA E TRANSIÇÃO DE TELA ---
function buscarExercicio() {
    if (numeroDigitado === "") return;

    const exercicio = listaExercicios.find(item => item.id == numeroDigitado);
    const erroMsg = document.getElementById('erro-msg');

    if (exercicio) {
        erroMsg.classList.remove('erro-visivel');
        abrirTelaVideo(exercicio);
    } else {
        erroMsg.classList.add('erro-visivel');
        setTimeout(() => {
            numeroDigitado = "";
            atualizarDisplay();
        }, 1500);
    }
}

function abrirTelaVideo(ex) {
    document.getElementById('ex-nome').innerText = ex.nome || "Exercício";
    document.getElementById('ex-id').innerText = ex.id;
    document.getElementById('ex-dica').innerText = ex.dica || "Mantenha a postura correta.";

    const containerMedia = document.getElementById('media-content');
    containerMedia.innerHTML = ''; 

    if (ex.media && (ex.media.includes('youtube') || ex.media.includes('youtu.be'))) {
        let videoId = ex.media.split('v=')[1] || ex.media.split('/').pop();
        videoId = videoId.split('?')[0];
        containerMedia.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        containerMedia.innerHTML = `<img src="${ex.media}" alt="${ex.nome}">`;
    }

    document.getElementById('tela-busca').classList.remove('active');
    document.getElementById('tela-busca').classList.add('hidden');
    
    document.getElementById('tela-video').classList.remove('hidden');
    document.getElementById('tela-video').classList.add('active');
}

function fecharVideo() {
    document.getElementById('media-content').innerHTML = '';
    
    numeroDigitado = "";
    atualizarDisplay();

    document.getElementById('tela-video').classList.remove('active');
    document.getElementById('tela-video').classList.add('hidden');
    
    document.getElementById('tela-busca').classList.remove('hidden');
    document.getElementById('tela-busca').classList.add('active');
}
