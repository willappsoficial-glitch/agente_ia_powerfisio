// CONFIGURAÇÃO
const API_URL = 'https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec';

// ESTADO GLOBAL
let listaExercicios = [];
let historicoChat = [];

// ==========================================
// INICIALIZAÇÃO (Ao carregar a página)
// ==========================================
window.addEventListener('load', async () => {
    console.log("Sistema iniciado...");

    // 1. Carrega banco de dados
    await carregarBaseDeDados();

    // 2. Configura EVENTOS (Cliques e Teclas)
    configurarEventos();
});

function configurarEventos() {
    // Busca de Exercício (Input e Botão)
    const inputBusca = document.getElementById('input-id');
    const btnBusca = document.getElementById('btn-buscar');
    
    if (inputBusca) {
        inputBusca.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarExercicio(); });
    }
    if (btnBusca) {
        btnBusca.addEventListener('click', buscarExercicio);
    }

    // Chat do Max (Input e Botão Enviar)
    const inputChat = document.getElementById('chat-input');
    const btnEnviar = document.getElementById('btn-enviar'); // CERTIFIQUE-SE QUE O ID NO HTML É ESSE
    const btnFab = document.getElementById('fab-max');
    const btnFecharChat = document.querySelector('.btn-close-chat');

    if (inputChat) {
        inputChat.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagemMax(); });
    }
    
    // AQUI ESTAVA O PROBLEMA: Agora forçamos o evento de clique
    if (btnEnviar) {
        console.log("Botão de enviar detectado!");
        btnEnviar.addEventListener('click', () => {
            console.log("Clique no enviar detectado");
            enviarMensagemMax();
        });
    } else {
        console.error("ERRO CRÍTICO: Botão 'btn-enviar' não encontrado no HTML");
    }

    if (btnFab) btnFab.addEventListener('click', toggleChat);
    if (btnFecharChat) btnFecharChat.addEventListener('click', toggleChat);
}

// ==========================================
// LÓGICA DE EXERCÍCIOS
// ==========================================
async function carregarBaseDeDados() {
    const loading = document.getElementById('loading');
    if(loading) loading.classList.remove('hidden');
    
    try {
        const res = await fetch(API_URL);
        listaExercicios = await res.json();
        if(loading) loading.classList.add('hidden');
        console.log("Base carregada:", listaExercicios.length);
    } catch (err) {
        console.error("Erro ao carregar:", err);
        if(loading) loading.innerText = "Erro de conexão.";
    }
}

function buscarExercicio() {
    const input = document.getElementById('input-id');
    const resultadoDiv = document.getElementById('resultado');
    const erroDiv = document.getElementById('erro');
    
    if (!input) return;
    const idBusca = input.value.trim();
    
    if (!idBusca) return;

    const exercicio = listaExercicios.find(item => item.id == idBusca);

    if (exercicio) {
        mostrarResultado(exercicio);
        if(erroDiv) erroDiv.classList.add('hidden');
    } else {
        if(erroDiv) erroDiv.classList.remove('hidden');
        if(resultadoDiv) resultadoDiv.classList.add('hidden');
    }
    input.value = '';
    input.blur();
}

function mostrarResultado(ex) {
    const divNome = document.getElementById('ex-nome');
    const divId = document.getElementById('ex-id');
    const divDica = document.getElementById('ex-dica');
    const mediaDiv = document.getElementById('media-content');
    const resultadoDiv = document.getElementById('resultado');

    if(divNome) divNome.innerText = ex.nome;
    if(divId) divId.innerText = ex.id;
    if(divDica) divDica.innerText = "Dica do Max: Mantenha a postura!";

    if(mediaDiv) {
        mediaDiv.innerHTML = '';
        if (ex.media.includes('youtube') || ex.media.includes('youtu.be')) {
            let videoId = ex.media.split('v=')[1] || ex.media.split('/').pop();
            videoId = videoId.split('?')[0];
            mediaDiv.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            mediaDiv.innerHTML = `<video autoplay loop muted playsinline src="${ex.media}"></video>`;
        }
    }
    if(resultadoDiv) resultadoDiv.classList.remove('hidden');
}

// ==========================================
// LÓGICA DO CHAT (MAX)
// ==========================================
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) chatWidget.classList.toggle('hidden');
}

async function enviarMensagemMax() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    const texto = input.value.trim();
    if (!texto) return;

    // 1. UI: Mostra mensagem do usuário
    adicionarBalao(texto, 'user');
    input.value = '';
    historicoChat.push({ role: "user", content: texto });

    // 2. UI: Mostra "Digitando..."
    const idDigitando = 'loading-temp';
    adicionarBalao('...', 'bot', idDigitando);

    try {
        // 3. ENVIA PARA API (AJUSTE O MODO CONFORME NECESSÁRIO)
        // Se der erro de CORS, use mode: 'no-cors' mas saiba que não receberá resposta JSON
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ mensagem: texto, historico: historicoChat })
            // mode: 'cors' é o padrão. Se falhar, tente usar proxy ou verificar o script.google
        });
        
        const data = await response.json(); // Tenta ler JSON

        // 4. UI: Substitui "Digitando..." pela resposta
        const msgDigitando = document.getElementById(idDigitando);
        if(msgDigitando) msgDigitando.remove();
        
        adicionarBalao(data.resposta, 'bot');
        historicoChat.push({ role: "model", content: data.resposta });

    } catch (err) {
        console.error(err);
        const msgDigitando = document.getElementById(idDigitando);
        if(msgDigitando) msgDigitando.remove();
        adicionarBalao("Estou offline agora. Tente depois! 🔌", 'bot');
    }
}

function adicionarBalao(texto, tipo, idOpcional = null) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;

    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    if (idOpcional) div.id = idOpcional;
    
    let conteudo = '';
    if (tipo === 'bot') {
        // Avatar do Max
        conteudo += `<div class="avatar-max"><span class="material-icons" style="font-size:16px">smart_toy</span></div>`;
    }
    
    // Se for o indicador de digitação (3 pontinhos)
    if (texto === '...') {
        conteudo += `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    } else {
        conteudo += `<div class="bubble">${texto}</div>`;
    }

    div.innerHTML = conteudo;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}
