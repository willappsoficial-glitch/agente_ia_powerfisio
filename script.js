// ============================================================
// ⚠️ MANTENHA SUA URL DO APPS SCRIPT AQUI
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');

// --- MEMÓRIA DO NAVEGADOR ---
let conversationHistory = [];

// Enviar com Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagem();
});

async function enviarMensagem() {
    const btn = document.getElementById('btn-enviar');
    if (!btn || btn.disabled) return;
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // Trava botão
    btn.disabled = true;
    btn.style.opacity = "0.5";
    
    // Animação Robô
    try {
        const maxAnimacao = document.getElementById('max-animacao');
        if (maxAnimacao && typeof maxAnimacao.setSpeed === 'function') maxAnimacao.setSpeed(2.5);
    } catch (e) {}

    addMessage(texto, 'user');
    userInput.value = '';
    showLoading(true);

    // --- SALVA NO HISTÓRICO ---
    conversationHistory.push({ role: 'user', content: texto });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            // --- ENVIA O HISTÓRICO PRO GOOGLE ---
            body: JSON.stringify({ 
                mensagem: texto,
                historico: conversationHistory 
            })
        });
        
        const data = await response.json();
        showLoading(false);
        
        const respostaFormatada = formatarTexto(data.resposta);
        addMessage(respostaFormatada, 'bot');

        // --- SALVA A RESPOSTA NO HISTÓRICO ---
        conversationHistory.push({ role: 'model', content: data.resposta });

    } catch (error) {
        showLoading(false);
        addMessage("⚠️ Problema de conexão. Tente novamente.", 'bot');
    } finally {
        btn.disabled = false;
        btn.style.opacity = "1";
        userInput.focus();
        try {
            const maxAnimacao = document.getElementById('max-animacao');
            if (maxAnimacao && typeof maxAnimacao.setSpeed === 'function') maxAnimacao.setSpeed(1);
        } catch (e) {}
    }
}

function addMessage(text, sender) {
    loading.style.display = 'none';

    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text;
    
    chatContainer.insertBefore(div, loading);
    
    // --- SCROLL INTELIGENTE ---
    if (sender === 'user') {
        scrollToBottom();
    } else {
        // Se for o Max, rola suavemente para o INÍCIO da mensagem dele
        setTimeout(() => {
            div.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
    scrollToBottom();
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

function usarChip(pergunta) {
    const input = document.getElementById('userInput');
    if (input) {
        input.value = pergunta;
        enviarMensagem();
    }
}
