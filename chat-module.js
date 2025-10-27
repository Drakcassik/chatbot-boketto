export function startChat({ webhookUrl, inputId, buttonId, bodyId }) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  const chatBody = document.getElementById(bodyId);

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    button.disabled = true;

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const reply = data.text || data.reply || JSON.stringify(data);
      appendMessage('bot', reply);
    } catch (err) {
      appendMessage('bot', '⚠️ Connection error.');
      console.error(err);
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('✅ Service Worker registered:', reg.scope))
        .catch(err => console.error('❌ SW registration failed:', err));
    });
  }
}
