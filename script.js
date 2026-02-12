// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 

let listaExercicios = [];
let conversationHistory = [];

// ============================================================
// INICIALIZAÇÃO (CARREGA TUDO)
// ============================================================
window.addEventListener('load', async () => {
    console.log("Sistema Max v2.0 Iniciado");

    // 1. Carrega a lista de exercícios para busca rápida
    await carregarBaseDeDados();

    // 2. Configura todos os botões e inputs
    configurarEventos();
});

function configurarEventos() {
    // --- EVENTOS DA BUSCA DE EXERCÍCIO ---
    const inputBusca = document.getElementById('input-id'); // O input laranja do vídeo
    const btnBusca = document.querySelector('.search-box button'); // O botão de lupa

    if (inputBusca) {
        inputBusca.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarExercicio(); });
    }
    if (btnBusca) {
        btnBusca.addEventListener('click', buscarExercicio);
    }

    // --- EVENTOS DO CHAT ---
    const btnFab = document.getElementById('fab-max'); // O botão flutuante laranja
    const btnFechar = document.querySelector('.btn-close-chat');
    const btnEnviarChat = document.getElementById('btn-enviar');
    const inputChat = document.getElementById('userInput');

    // ABRIR/FECHAR CHAT (AQUI ESTAVA O ERRO)
    if (btnFab) {
        btnFab.addEventListener('click', toggleChat);
    }
    if (btnFechar) {
        btnFechar.addEventListener('click', toggleChat);
    }

    // ENVIAR MENSAGEM NO CHAT
    if (inputChat) {
        inputChat.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); });
    }
    if (btnEnviarChat) {
        btnEnviarChat.addEventListener('click', enviarMensagem);
    }
}

// ============================================================
// FUNÇÕES: BUSCA DE EXERCÍCIO (TELA PRINCIPAL)
// ============================================================
async function carregarBaseDeDados() {
    try {
        // Usa a mesma API, mas espera JSON (doGet no Apps Script)
        const res = await fetch(API_URL);
        const dados = await res.json();
        
        // Se a API retornar a lista direta (array)
        if (Array.isArray(dados)) {
            listaExercicios = dados;
        } else {
            console.log("API retornou formato diferente, tentando adaptar...");
        }
        console.log("Exercícios carregados:", listaExercicios.length);
    } catch (err) {
        console.error("Erro ao carregar exercícios:", err);
    }
}

function buscarExercicio() {
    const input = document.getElementById('input-id');
    const cardResultado = document.getElementById('resultado'); // O card preto
    const divErro = document.getElementById('erro');
    
    if (!input) return;
    const termo = input.value.trim();
    if (!termo) return;

    // Procura na lista local (ID igual ao digitado)
    const exercicio = listaExercicios.find(item => item.id == termo);

    if (exercicio) {
        mostrarCard(exercicio);
        if (divErro) divErro.classList.add('hidden');
    } else {
        if (cardResultado) cardResultado.classList.add('hidden');
        if (divErro) divErro.classList.remove('hidden');
    }
    
    // Fecha teclado
    input.blur();
}

function mostrarCard(ex) {
    const card = document.getElementById('resultado');
    
    // Preenche os dados
    document.getElementById('ex-nome').innerText = ex.nome || "Exercício";
    document.getElementById('ex-id').innerText = ex.id;
    document.getElementById('ex-dica').innerText = ex.dica || "Mantenha a postura correta e controle a respiração."; // Dica padrão se não tiver

    // Lógica do Vídeo/Imagem
    const containerMedia = document.getElementById('media-content');
    containerMedia.innerHTML = ''; // Limpa anterior

    if (ex.media && (ex.media.includes('youtube') || ex.media.includes('youtu.be'))) {
        let videoId = ex.media.split('v=')[1] || ex.media.split('/').pop();
        videoId = videoId.split('?')[0];
        containerMedia.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        containerMedia.innerHTML = `<img src="${ex.media}" alt="${ex.nome}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    card.classList.remove('hidden');
    
    // Rola a página suavemente até o card para garantir que a dica apareça
    setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// ============================================================
// FUNÇÕES: CHAT DO MAX
// ============================================================
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget'); // O container do chat
    if (chatWidget) {
        // Troca a classe hidden (mostra/esconde)
        if (chatWidget.style.display === 'none' || chatWidget.classList.contains('hidden')) {
            chatWidget.classList.remove('hidden');
            chatWidget.style.display = 'flex';
        } else {
            chatWidget.classList.add('hidden');
            chatWidget.style.display = 'none';
        }
    } else {
        console.error("Elemento 'chat-widget' não encontrado no HTML!");
    }
}

async function enviarMensagem() {
    const userInput = document.getElementById('userInput');
    const btnEnviar = document.getElementById('btn-enviar');
    const chatContainer = document.getElementById('chat-container');
    const loading = document.getElementById('loading');
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // UI: Bloqueia envio duplicado
    btnEnviar.disabled = true;
    
    // 1. Adiciona msg do usuário
    addMessage(texto, 'user');
    userInput.value = '';
    userInput.blur();
    conversationHistory.push({ role: 'user', content: texto });

    // 2. Mostra Loading
    loading.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // 3. Envia para API
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ mensagem: texto, historico: conversationHistory })
        });
        const data = await response.json();

        // 4. Resposta do Robô
        loading.style.display = 'none';
        const respostaFormatada = formatarTexto(data.resposta);
        addMessage(respostaFormatada, 'bot');
        conversationHistory.push({ role: 'model', content: data.resposta });

    } catch (error) {
        loading.style.display = 'none';
        addMessage("⚠️ Estou sem sinal... Tente de novo!", 'bot');
    } finally {
        btnEnviar.disabled = false;
    }
}

function addMessage(text, sender) {
    const chatContainer = document.getElementById('chat-container');
    const loading = document.getElementById('loading');
    
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text;
    
    chatContainer.insertBefore(div, loading); // Insere antes do loading
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatarTexto(texto) {
    if (!texto) return "";
    let t = texto.replace(/\n/g, '<br>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return t;
}
