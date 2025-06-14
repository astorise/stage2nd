// src/components/NetworkMonitor/NetworkMonitor.js

export class NetworkMonitor {
  constructor(container) {
    this.container = container;
    this.requests = [];
    this.maxRequests = 100;
    this.isRecording = true;
    this.requestMap = new Map(); // Pour tracker les requêtes par ID
    this.requestId = 0;
    
    this.init();
  }
  
  init() {
    // Créer l'interface
    this.render();
    
    // Écouter les messages de l'iframe
    this.setupMessageListener();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="network-monitor">
        <div class="network-header">
          <span class="network-title">🌐 Réseau</span>
          <div class="network-controls">
            <select class="network-filter" id="network-filter">
              <option value="all">Toutes les requêtes</option>
              <option value="iframe">Iframe seulement</option>
              <option value="app">Application seulement</option>
            </select>
            <button class="network-toggle" id="network-toggle" title="Pause/Reprendre">
              ${this.isRecording ? '⏸️' : '▶️'}
            </button>
            <button class="network-clear" id="network-clear" title="Effacer">🗑️</button>
          </div>
        </div>
        <div class="network-stats">
          <span class="stat-item">Requêtes: <strong id="request-count">0</strong></span>
          <span class="stat-item">Total: <strong id="total-size">0 KB</strong></span>
        </div>
        <div class="network-table-container">
          <table class="network-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Statut</th>
                <th>Taille</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody id="network-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
    this.tbody = document.getElementById('network-tbody');
  }
  
  setupEventListeners() {
    document.getElementById('network-toggle').addEventListener('click', () => {
      this.toggleRecording();
    });
    
    document.getElementById('network-clear').addEventListener('click', () => {
      this.clear();
    });
    
    document.getElementById('network-filter').addEventListener('change', (e) => {
      this.filterRequests(e.target.value);
    });
  }
  
  setupMessageListener() {
    // Écouter les messages postMessage de l'iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'network' && this.isRecording) {
        this.handleNetworkMessage(event.data.data);
      }
    });
  }
  
  handleNetworkMessage(data) {
    if (data.status === 'pending') {
      // Nouvelle requête
      const request = {
        id: data.id,
        url: this.formatUrl(data.url),
        method: data.method,
        status: 'pending',
        size: '-',
        duration: '-',
        startTime: data.startTime,
        source: 'iframe'
      };
      
      this.requestMap.set(data.id, request);
      this.addRequest(request);
    } else {
      // Mise à jour d'une requête existante
      const request = this.requestMap.get(data.id);
      if (request) {
        this.updateRequest(data.id, {
          status: data.status,
          statusText: data.statusText || '',
          size: this.formatSize(data.size || 0),
          duration: `${data.duration}ms`,
          headers: data.headers
        });
      }
    }
  }
  
  addRequest(request) {
    this.requests.push(request);
    
    // Limiter le nombre de requêtes
    if (this.requests.length > this.maxRequests) {
      const removedRequest = this.requests.shift();
      this.requestMap.delete(removedRequest.id);
      this.tbody.removeChild(this.tbody.firstChild);
    }
    
    this.renderRequest(request);
    this.updateStats();
  }
  
  updateRequest(id, updates) {
    const request = this.requestMap.get(id);
    if (!request) return;
    
    // Mettre à jour l'objet request
    Object.assign(request, updates);
    
    // Mettre à jour l'affichage
    const row = document.querySelector(`[data-request-id="${id}"]`);
    if (row) {
      row.className = `network-row ${this.getStatusClass(updates.status)}`;
      row.innerHTML = this.getRowHTML(request);
    }
    
    this.updateStats();
  }
  
  renderRequest(request) {
    const row = document.createElement('tr');
    row.className = `network-row ${this.getStatusClass(request.status)}`;
    row.setAttribute('data-request-id', request.id);
    row.innerHTML = this.getRowHTML(request);
    
    this.tbody.appendChild(row);
    
    // Scroll automatique vers le bas
    const tableContainer = this.container.querySelector('.network-table-container');
    tableContainer.scrollTop = tableContainer.scrollHeight;
  }
  
  getRowHTML(request) {
    const sourceIcon = request.source === 'iframe' ? '🌐' : '🏠';
    
    return `
      <td class="url-cell" title="${request.url}">
        <span class="source-icon" title="${request.source === 'iframe' ? 'Iframe' : 'App'}">${sourceIcon}</span>
        <span class="method-badge method-${request.method.toLowerCase()}">${request.method}</span>
        <span class="url-text">${request.url}</span>
      </td>
      <td class="status-cell">${this.formatStatus(request.status, request.statusText)}</td>
      <td class="size-cell">${request.size}</td>
      <td class="duration-cell">${request.duration}</td>
    `;
  }
  
  formatUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      // Retirer le domaine si c'est le même que l'origine
      if (urlObj.origin === window.location.origin) {
        return urlObj.pathname + urlObj.search;
      }
      // Pour les URLs externes, garder le domaine mais pas le protocole
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }
  
  formatStatus(status, statusText) {
    if (status === 'pending') {
      return '<span class="status-pending">⏳</span>';
    }
    if (status === 'error') {
      return '<span class="status-error">❌ Erreur</span>';
    }
    if (status >= 200 && status < 300) {
      return `<span class="status-success">${status}</span>`;
    }
    if (status >= 300 && status < 400) {
      return `<span class="status-redirect">${status}</span>`;
    }
    if (status >= 400) {
      return `<span class="status-error">${status}</span>`;
    }
    return status;
  }
  
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    if (!bytes || bytes === '-') return '-';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  getStatusClass(status) {
    if (status === 'pending') return 'pending';
    if (status === 'error') return 'error';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirect';
    if (status >= 400) return 'error';
    return '';
  }
  
  updateStats() {
    const count = this.requests.length;
    let totalSize = 0;
    
    this.requests.forEach(req => {
      if (req.size && req.size !== '-') {
        const match = req.size.match(/(\d+\.?\d*)\s*(\w+)/);
        if (match) {
          const value = parseFloat(match[1]);
          const unit = match[2];
          
          // Convertir en bytes
          const multipliers = { 'B': 1, 'KB': 1024, 'MB': 1048576, 'GB': 1073741824 };
          totalSize += value * (multipliers[unit] || 1);
        }
      }
    });
    
    document.getElementById('request-count').textContent = count;
    document.getElementById('total-size').textContent = this.formatSize(totalSize);
  }
  
  filterRequests(filter) {
    const rows = this.tbody.querySelectorAll('.network-row');
    
    rows.forEach(row => {
      const requestId = parseInt(row.dataset.requestId);
      const request = this.requestMap.get(requestId);
      
      if (!request) return;
      
      if (filter === 'all') {
        row.style.display = '';
      } else if (filter === 'iframe' && request.source === 'iframe') {
        row.style.display = '';
      } else if (filter === 'app' && request.source !== 'iframe') {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  toggleRecording() {
    this.isRecording = !this.isRecording;
    const button = document.getElementById('network-toggle');
    button.textContent = this.isRecording ? '⏸️' : '▶️';
    button.title = this.isRecording ? 'Pause' : 'Reprendre';
  }
  
  clear() {
    this.requests = [];
    this.requestMap.clear();
    this.tbody.innerHTML = '';
    this.updateStats();
  }
  
  // Méthode optionnelle pour capturer aussi les requêtes de l'app principale
  interceptAppRequests() {
    const self = this;
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      if (!self.isRecording) {
        return originalFetch.apply(window, args);
      }
      
      const requestId = ++self.requestId;
      const startTime = performance.now();
      const url = args[0].toString();
      const method = args[1]?.method || 'GET';
      
      // Ajouter la requête en attente
      const request = {
        id: requestId,
        url: self.formatUrl(url),
        method,
        status: 'pending',
        size: '-',
        duration: '-',
        startTime,
        source: 'app'
      };
      
      self.requestMap.set(requestId, request);
      self.addRequest(request);
      
      // Exécuter la requête
      return originalFetch.apply(window, args)
        .then(async response => {
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          
          // Cloner la réponse pour lire le contenu
          const clonedResponse = response.clone();
          
          // Essayer de récupérer la taille
          let size = 0;
          try {
            const blob = await clonedResponse.blob();
            size = blob.size;
          } catch (e) {
            // Si on ne peut pas lire le blob, utiliser Content-Length
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              size = parseInt(contentLength);
            }
          }
          
          // Mettre à jour la requête
          self.updateRequest(requestId, {
            status: response.status,
            statusText: response.statusText,
            size: self.formatSize(size),
            duration: `${duration}ms`,
            responseType: response.headers.get('content-type') || 'unknown'
          });
          
          return response;
        })
        .catch(error => {
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          
          self.updateRequest(requestId, {
            status: 'error',
            statusText: error.message,
            size: '0',
            duration: `${duration}ms`
          });
          
          throw error;
        });
    };
  }
  
  destroy() {
    // Nettoyer les event listeners si nécessaire
    // Note: Les event listeners sur window.message ne sont pas supprimés
    // car ils pourraient être utilisés par d'autres composants
    this.clear();
  }
}
