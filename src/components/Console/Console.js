export class Console {
  constructor(container) {
    this.container = container;
    this.logs = [];
    this.maxLogs = 1000;
    
    this.init();
  }
  
  init() {
    this.container.innerHTML = `
      <div class="console-wrapper">
        <div class="console-header">
          <span class="console-title">Console</span>
          <button class="console-clear" title="Effacer">🗑️</button>
        </div>
        <div class="console-content"></div>
      </div>
    `;
    
    this.content = this.container.querySelector('.console-content');
    this.container.querySelector('.console-clear').addEventListener('click', () => this.clear());
  }
  
  log(...args) {
    this.addEntry('log', args);
  }
  
  error(...args) {
    this.addEntry('error', args);
  }
  
  warn(...args) {
    this.addEntry('warn', args);
  }
  
  info(...args) {
    this.addEntry('info', args);
  }
  
  addEntry(type, args) {
    const entry = {
      type,
      timestamp: new Date(),
      content: args.map(arg => this.formatValue(arg)).join(' ')
    };
    
    this.logs.push(entry);
    
    // Limiter le nombre de logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
      this.content.firstChild?.remove();
    }
    
    this.renderEntry(entry);
  }
  
  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    switch (typeof value) {
      case 'object':
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return value.toString();
        }
      case 'function':
        return value.toString();
      default:
        return String(value);
    }
  }
  
  renderEntry(entry) {
    const div = document.createElement('div');
    div.className = `console-entry console-${entry.type}`;
    
    const time = document.createElement('span');
    time.className = 'console-time';
    time.textContent = entry.timestamp.toLocaleTimeString();
    
    const content = document.createElement('span');
    content.className = 'console-message';
    content.textContent = entry.content;
    
    div.appendChild(time);
    div.appendChild(content);
    
    this.content.appendChild(div);
    this.content.scrollTop = this.content.scrollHeight;
  }
  
  clear() {
    this.logs = [];
    this.content.innerHTML = '';
    this.info('Console cleared');
  }
}
