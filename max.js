// ============================================================
// ⚠️ SUA URL DO APPS SCRIPT (A MESMA DO TABLET)
const API_URL = "https://script.google.com/macros/s/AKfycbxCF_O_KVJ6nRTE_cvCkB-TwATpT2wC2xMyRI8Sb6yPNdYn8mWFEzdcQFAdu89fg31O2w/exec"; 
// ============================================================

let conversationHistory = [];

window.addEventListener('load', () => {
    configurarEventosChat();
});

function configurarEventosChat() {
    const btnEnviarChat = document.getElementById('btn-enviar-chat');
    const inputChat = document.getElementById('chat-input');
    const chips = document.querySelectorAll('.chip');

    if (inputChat) inputChat.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagemChat(); });
    if (btnEnviarChat) btnEnviarChat.addEventListener('click', enviarMensagemChat);

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (inputChat) {
                inputChat.value = chip.getAttribute('data-pergunta');
                enviarMensagemChat();
            }
        });
    });
}

async function enviarMensagemChat() {
    const userInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const loading = document.getElementById('loading-chat');
    
    const texto = userInput.value.trim();
    if (!texto) return;

    // 1. Adiciona mensagem do usuário na tela
    addMessage(texto, 'user');
    userInput.value = '';
    
    // Esconde o teclado no celular para ver a resposta
    userInput.blur(); 
    
    // Salva no histórico do Frontend
    conversationHistory.push({ role: 'user', content: texto });

    // 2. Mostra animação de digitando...
    if (loading) {
        loading.classList.remove('hidden');
        chatBody.appendChild(loading); // Move pro final
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 3. Envia para o Google Apps Script (Rota POST)
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ mensagem: texto, historico: conversationHistory })
        });
        
        const data = await response.json();

        // 4. Esconde o loading e mostra a resposta do Max
        if (loading) loading.classList.add('hidden');
        addMessage(formatarTexto(data.resposta), 'bot');
        conversationHistory.push({ role: 'model', content: data.resposta });

    } catch (error) {
        if (loading) loading.classList.add('hidden');
        addMessage("⚠️ Poxa, minha conexão falhou aqui. Pode tentar de novo? 💪", 'bot');
    }
}

function addMessage(text, sender) {
    const chatBody = document.getElementById('chat-body');
    const loading = document.getElementById('loading-chat');
    
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = text;
    
    // Insere antes do loading (se ele estiver visível)
    if (loading && !loading.classList.contains('hidden')) {
        chatBody.insertBefore(div, loading);
    } else {
        chatBody.appendChild(div);
    }
    
    // Rola para o final
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Converte quebras de linha e negrito do Gemini para HTML
function formatarTexto(texto) {
    if (!texto) return "";
    let t = texto.replace(/\n/g, '<br>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return t;
}
