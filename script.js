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
    // 1. CORREÇÃO: Busca pelo ID específico, não pelo primeiro botão
    const btn = document.getElementById('btn-enviar');
    
    // Proteção: Se por algum motivo o botão não existir no HTML, para tudo
    if (!btn) {
        console.error("Erro: Botão de enviar não encontrado (verifique o ID no HTML)");
        return;
    }

    if (btn.disabled) return; // Se já está enviando, ignora
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // 2. Trava o botão visualmente
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    
    // 3. Tenta animar o robô (Notebook)
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
        // 4. DESTRAVA O BOTÃO CERTO
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
    formatado = formatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Negrito
    formatado = formatado.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Itálico
    return formatado;
}

// Função para os Botões de Ação Rápida
function usarChip(pergunta) {
    const input = document.getElementById('user-input');
    
    // 1. Preenche o campo
    input.value = pergunta;
    
    // 2. Envia automaticamente
    enviarMensagem();
}

