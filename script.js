// ATENÇÃO: Gere um NOVO deploy e cole a URL aqui
const API_URL = "https://script.google.com/macros/s/AKfycbwE4GWn_b-LDGT827HexO49mhsmjv0FDWRhzacw_V_bCSwPZeZClNl8SSqHhrZ7gIA9ag/exec"; 

const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const chat = document.getElementById('chat-content');

async function falarComMax() {
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    input.value = '';
    const loading = appendMessage("O Max está consultando o sistema...", 'max');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ mensagem: msg }),
            headers: { 'Content-Type': 'text/plain' }
        });
        const data = await response.json();
        loading.innerText = data.resposta;
    } catch (err) {
        loading.innerText = "Max offline. Verifique a URL do App Script e o deploy.";
    }
}

function appendMessage(txt, side) {
    const div = document.createElement('div');
    div.className = `bubble ${side}`;
    div.innerText = txt;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
}

btn.onclick = falarComMax;
input.onkeypress = (e) => { if(e.key === 'Enter') falarComMax(); };