// ============================================================
// ⚠️ MANTENHA SUA URL DO APPS SCRIPT AQUI
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');
const btnEnviar = document.getElementById('btn-enviar'); // Pegamos o botão aqui fora pra garantir

// --- MEMÓRIA DO NAVEGADOR ---
let conversationHistory = [];

// Enviar com Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagem();
});

// Enviar com Clique
if (btnEnviar) {
    btnEnviar.addEventListener('click', enviarMensagem);
}

async function enviarMensagem() {
    // 1. Verificações iniciais
    if (!btnEnviar || btnEnviar.disabled) return;
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // 2. Trava o botão e muda visual
    btnEnviar.disabled = true;
    btnEnviar.style.opacity = "0.5";
    btnEnviar.style.cursor = "not-allowed";
    
    // 3. Tenta acelerar o robô (sem travar se falhar)
    try {
        const maxAnimacao = document.getElementById('max-animacao');
        if (maxAnimacao && typeof maxAnimacao.setSpeed === 'function') {
            maxAnimacao.setSpeed(2.5);
        }
    } catch (e) { console.log("Robô offline, seguindo..."); }

    // 4. Adiciona mensagem do usuário na tela
    addMessage(texto, 'user');
    
    // 5. Limpa campo e FECHA TECLADO
    userInput.value = '';
    userInput.blur(); // <--- O segredo para fechar o teclado
    
    showLoading(true);

    // 6. Atualiza histórico
    conversationHistory.push({ role: 'user', content: texto });

    try {
        // 7. Envia para o Google
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                mensagem: texto,
                historico: conversationHistory 
            })
        });
        
        const data = await response.json();
        
        // 8. Recebeu resposta
        showLoading(false);
        const respostaFormatada = formatarTexto(data.resposta);
        addMessage(respostaFormatada, 'bot');

        // Salva resposta no histórico
        conversationHistory.push({ role: 'model', content: data.resposta });

    } catch (error) {
        showLoading(false);
        addMessage("⚠️ O Max piscou... Tente de novo! (Erro de conexão)", 'bot');
        console.error(error);
    } finally {
        // 9. Destrava tudo (Sempre roda, mesmo com erro)
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.style.opacity = "1";
            btnEnviar.style.cursor = "pointer";
        }
        
        // Garante que o teclado continue fechado
        userInput.blur(); 

        // Desacelera robô
        try {
            const maxAnimacao = document.getElementById('max-animacao');
            if (maxAnimacao && typeof maxAnimacao.setSpeed === 'function') {
                maxAnimacao.setSpeed(1);
            }
        } catch (e) {}
    }
}

function addMessage(text, sender) {
    loading.style.display = 'none';

    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text;
    
    chatContainer.insertBefore(div, loading);
    
    // --- LÓGICA DE SCROLL INTELIGENTE ---
    if (sender === 'user') {
        // Se foi você, desce tudo pra ver o que escreveu
        scrollToBottom();
    } else {
        // Se foi o Max, rola suave para o INÍCIO da mensagem dele
        setTimeout(() => {
            div.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
    // Só rola pra baixo se estiver MOSTRANDO o loading
    if (show) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatarTexto(texto) {
    if (!texto) return "";
    let formatado = texto.replace(/\n/g, '<br>');
    formatado = formatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    formatado = formatado.replace(/\*(.*?)\*/g, '<em>$1</em>'); 
    return formatado;
}

// Função dos Botões Rápidos (Chips)
function usarChip(pergunta) {
    if (userInput) {
        userInput.value = pergunta;
        enviarMensagem();
    }
}
