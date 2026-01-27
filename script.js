// ============================================================
// ⚠️ COLE AQUI O LINK DO SEU WEB APP (APPS SCRIPT)
// ============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbwV5hjWHFnZw25ECLLc3FTscDn-yH0-LmScHrLq1tP3K0TER-lc0utyUA39nrI8xNvKgg/exec"; 
// ============================================================

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');

// Enviar com Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagem();
});

async function enviarMensagem() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // 1. Adiciona msg do usuário
    addMessage(texto, 'user');
    userInput.value = '';
    userInput.focus();

    // 2. Mostra "Digitando..."
    showLoading(true);

    try {
        // 3. Envia para o Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ mensagem: texto })
        });
        
        // 4. Recebe a resposta
        const data = await response.json();
        
        // 5. Mostra a resposta formatada
        showLoading(false);
        const respostaFormatada = formatarTexto(data.resposta);
        addMessage(respostaFormatada, 'bot');

    } catch (error) {
        showLoading(false);
        addMessage("Opa, tive um erro de conexão. Tente de novo!", 'bot');
        console.error(error);
    }
}

function addMessage(text, sender) {
    loading.style.display = 'none';

    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text;
    
    chatContainer.insertBefore(div, loading);
    scrollToBottom();
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
    formatado = formatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Negrito
    formatado = formatado.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Itálico
    return formatado;
}

