// ============================================================
// ⚠️ SEU WEB APP
// ============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput'); // O ID CORRETO É ESSE
const loading = document.getElementById('loading');

// Enviar com Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagem();
});

async function enviarMensagem() {
    // Busca pelo ID específico
    const btn = document.getElementById('btn-enviar');
    
    // Proteção
    if (!btn) {
        console.error("Erro: Botão de enviar não encontrado.");
        return;
    }

    if (btn.disabled) return; 
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // Trava o botão
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    
    // Tenta animar o robô (Notebook)
    try {
        const maxAnimacao = document.getElementById('max-animacao');
        if (maxAnimacao && typeof maxAnimacao.setSpeed === 'function') {
            maxAnimacao.setSpeed(2.5); 
        }
    } catch (err) {}

    addMessage(texto, 'user');
    userInput.value = '';
    showLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ mensagem: texto })
        });
        
        const data = await response.json();
        
        showLoading(false);
        const respostaFormatada = formatarTexto(data.resposta);
        addMessage(respostaFormatada, 'bot');

    } catch (error) {
        showLoading(false);
        addMessage("⚠️ O Max teve um problema de conexão. Tente de novo!", 'bot');
    } finally {
        // DESTRAVA O BOTÃO
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        userInput.focus();

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
    formatado = formatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    formatado = formatado.replace(/\*(.*?)\*/g, '<em>$1</em>'); 
    return formatado;
}

// === AQUI ESTAVA O ERRO, AGORA ESTÁ CORRIGIDO ===
function usarChip(pergunta) {
    // Estava 'user-input', mudei para 'userInput' (igual lá no topo)
    const input = document.getElementById('userInput'); 
    
    if (input) {
        input.value = pergunta;
        enviarMensagem();
    } else {
        console.error("Erro: Campo de texto não encontrado.");
    }
}
