// ============================================================
// ⚠️ COLE AQUI O LINK DO SEU WEB APP (APPS SCRIPT)
// ============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');

// Enviar com Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagem();
});

async function enviarMensagem() {
    // ... seu código de travar botão ...
    
    // Pega o mascote
    const max = document.getElementById('max-animacao');
    
    // MUDANÇA DE ESTADO: Max fica rápido (Pensando) ⚡
    if(max) max.setSpeed(2.5); 

    try {
        // ... seu fetch ...
    } catch (e) {
        // ... erro ...
    } finally {
        // VOLTA AO NORMAL: Max acalma 🧘‍♂️
        if(max) max.setSpeed(1);
        
        // ... destrava botão ...
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



