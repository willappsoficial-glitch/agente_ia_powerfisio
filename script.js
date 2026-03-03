// ============================================================
// ⚠️ SUA URL DO APPS SCRIPT (MANTENHA ESTA)
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

let listaExercicios = [];

window.addEventListener('load', async () => {
    console.log("Sistema Guia de Execução Iniciado");
    
    // 1. Inicia download da base e configura status
    const statusLoading = document.getElementById('loading-search');
    if (statusLoading) statusLoading.classList.remove('hidden');

    await carregarBaseDeDados();
    
    // 2. Base carregada? Esconde o loading
    if (statusLoading) statusLoading.classList.add('hidden');

    configurarEventos();
});

// --- FUNÇÃO 1: CARREGAR DADOS ---
async function carregarBaseDeDados() {
    try {
        const res = await fetch(API_URL);
        const dados = await res.json();
        
        if (Array.isArray(dados)) {
            listaExercicios = dados;
        }
        console.log("Exercícios carregados:", listaExercicios.length);
    } catch (err) {
        console.error("Erro ao carregar DB:", err);
        // Se der erro, muda o texto do loading para avisar
        const statusLoading = document.getElementById('loading-search');
        if (statusLoading) statusLoading.innerHTML = "❌ Erro de conexão. Recarregue a página.";
    }
}

function configurarEventos() {
    // Busca
    const inputBusca = document.getElementById('input-id');
    const btnBusca = document.getElementById('btn-buscar');
    const btnNovaBusca = document.getElementById('btn-nova-busca');

    if (inputBusca) inputBusca.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarExercicio(); });
    if (btnBusca) btnBusca.addEventListener('click', buscarExercicio);
    if (btnNovaBusca) btnNovaBusca.addEventListener('click', fecharResultado);
}

// --- FUNÇÃO 2: BUSCAR EXERCÍCIO ---
function buscarExercicio() {
    const input = document.getElementById('input-id');
    const cardResultado = document.getElementById('resultado');
    const divErro = document.getElementById('erro');
    const divLoading = document.getElementById('loading-search'); 
    
    // Limpa estados anteriores
    if (divLoading) divLoading.classList.add('hidden');
    if (divErro) divErro.classList.add('hidden');
    if (cardResultado) cardResultado.classList.add('hidden');

    if (!input) return;
    const termo = input.value.trim();
    if (!termo) return;

    // Busca exata pelo ID
    const exercicio = listaExercicios.find(item => item.id == termo);

    if (exercicio) {
        mostrarCard(exercicio);
    } else {
        // Se não achou, só agora mostra o erro
        if (divErro) divErro.classList.remove('hidden');
    }
    input.blur();
}

function mostrarCard(ex) {
    const card = document.getElementById('resultado');
    
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
        containerMedia.innerHTML = `<img src="${ex.media}" alt="${ex.nome}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    card.classList.remove('hidden');
    setTimeout(() => { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
}

function fecharResultado() {
    const card = document.getElementById('resultado');
    const input = document.getElementById('input-id');
    const divErro = document.getElementById('erro');
    
    if (card) card.classList.add('hidden');
    if (divErro) divErro.classList.add('hidden');
    
    if (input) {
        input.value = '';
        input.focus();
    }
}
