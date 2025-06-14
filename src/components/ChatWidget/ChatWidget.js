import { ChatService } from '@services/ChatService';

export class ChatWidget {
  constructor(container) {
    this.container = container;
    this.service = new ChatService();
    this.messagesEl = null;
    this.inputEl = null;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-widget">
        <div class="chat-messages"></div>
        <div class="chat-input">
          <input type="text" class="chat-text" placeholder="Message..." />
          <button class="chat-send">Envoyer</button>
        </div>
      </div>
    `;
    this.messagesEl = this.container.querySelector('.chat-messages');
    this.inputEl = this.container.querySelector('.chat-text');
    this.container
      .querySelector('.chat-send')
      .addEventListener('click', () => this.handleSend());
  }

  async register(username) {
    this.service.register(username);
    this.service.onMessage(msg => this.addMessage(msg));
  }

  connect(peerId) {
    this.service.connect(peerId);
  }

  handleSend() {
    const msg = this.inputEl.value.trim();
    if (!msg) return;
    this.service.sendMessage(msg);
    this.addMessage(msg);
    this.inputEl.value = '';
  }

  addMessage(msg) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.textContent = msg;
    this.messagesEl.appendChild(div);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  onMessage(cb) {
    this.service.onMessage(cb);
  }
}
