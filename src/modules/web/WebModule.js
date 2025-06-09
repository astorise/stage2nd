import { BaseModule } from '@core/BaseModule';

export default class WebModule extends BaseModule {
  constructor() {
    super('web', 'HTML/CSS/JS', '🌐');
    
    this.capabilities = {
      console: true,
      preview: true,
      multiFile: true,
      packages: false
    };
    
    this.files = new Map([
      ['index.html', { language: 'html', content: '' }],
      ['style.css', { language: 'css', content: '' }],
      ['script.js', { language: 'javascript', content: '' }]
    ]);
    
    this.activeFile = 'index.html';
    this.previewFrame = null;
  }
  
  async init() {
    // Configuration pour multi-fichiers
    return {
      editorConfig: {
        language: 'html',
        theme: 'vs-dark'
      }
    };
  }
  
  async execute(code, context = {}) {
    // Mettre à jour le fichier actif
    this.files.get(this.activeFile).content = code;
    
    // Construire le HTML complet
    const html = this.buildCompleteHTML();
    
    // Créer ou mettre à jour la preview
    this.updatePreview(html);
    
    // Capturer les logs de la console dans l'iframe
    const logs = await this.captureLogs();
    
    return {
      success: true,
      logs,
      errors: [],
      preview: true
    };
  }
  
  buildCompleteHTML() {
    const htmlContent = this.files.get('index.html').content;
    const cssContent = this.files.get('style.css').content;
    const jsContent = this.files.get('script.js').content;
    
    // Si le HTML contient déjà une structure complète
    if (htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html>')) {
      return htmlContent
        .replace('</head>', `<style>${cssContent}</style></head>`)
        .replace('</body>', `<script>${jsContent}</script></body>`);
    }
    
    // Sinon, créer une structure complète
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        /* Reset de base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* Styles utilisateur */
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        // Capturer console.log pour l'affichage dans CodePlay
        (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            const sendToParent = (type, args) => {
                window.parent.postMessage({
                    type: 'console',
                    method: type,
                    args: Array.from(args).map(arg => {
                        try {
                            return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                        } catch {
                            return String(arg);
                        }
                    })
                }, '*');
            };
            
            console.log = function() {
                originalLog.apply(console, arguments);
                sendToParent('log', arguments);
            };
            
            console.error = function() {
                originalError.apply(console, arguments);
                sendToParent('error', arguments);
            };
            
            console.warn = function() {
                originalWarn.apply(console, arguments);
                sendToParent('warn', arguments);
            };
            
            // Capturer les erreurs
            window.addEventListener('error', (e) => {
                sendToParent('error', [e.message]);
            });
        })();
        
        // Code utilisateur
        ${jsContent}
    </script>
</body>
</html>`;
  }
  
  updatePreview(html) {
    // Trouver ou créer le conteneur de preview
    let previewContainer = document.getElementById('preview-container');
    if (!previewContainer) {
      previewContainer = document.createElement('div');
      previewContainer.id = 'preview-container';
      previewContainer.style.cssText = `
        position: fixed;
        top: 60px;
        right: 0;
        width: 50%;
        height: calc(100vh - 60px);
        background: white;
        border-left: 1px solid #e2e8f0;
        z-index: 100;
        display: flex;
        flex-direction: column;
      `;
      
      // Ajouter la barre d'outils de preview
      const toolbar = document.createElement('div');
      toolbar.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: #f7fafc;
        border-bottom: 1px solid #e2e8f0;
      `;
      
      toolbar.innerHTML = `
        <button onclick="window.codePlayApp.modules.getActiveModule().setViewport('mobile')" title="Mobile">📱</button>
        <button onclick="window.codePlayApp.modules.getActiveModule().setViewport('tablet')" title="Tablette">📱</button>
        <button onclick="window.codePlayApp.modules.getActiveModule().setViewport('desktop')" title="Desktop">🖥️</button>
        <button onclick="window.codePlayApp.modules.getActiveModule().closePreview()" title="Fermer">❌</button>
      `;
      
      previewContainer.appendChild(toolbar);
      
      // Créer l'iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'preview-frame';
      iframe.style.cssText = `
        flex: 1;
        width: 100%;
        border: none;
        background: white;
      `;
      
      previewContainer.appendChild(iframe);
      document.body.appendChild(previewContainer);
      
      this.previewFrame = iframe;
    }
    
    // Mettre à jour le contenu
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this.previewFrame.src = url;
    
    // Nettoyer l'ancienne URL après chargement
    this.previewFrame.onload = () => {
      URL.revokeObjectURL(url);
    };
  }
  
  async captureLogs() {
    const logs = [];
    
    // Écouter les messages de l'iframe
    const messageHandler = (event) => {
      if (event.data && event.data.type === 'console') {
        logs.push({
          type: event.data.method,
          args: event.data.args
        });
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Attendre un peu pour collecter les logs
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.removeEventListener('message', messageHandler);
    
    return logs;
  }
  
  setViewport(size) {
    if (!this.previewFrame) return;
    
    const sizes = {
      mobile: '375px',
      tablet: '768px',
      desktop: '100%'
    };
    
    this.previewFrame.style.width = sizes[size] || '100%';
    
    if (size !== 'desktop') {
      this.previewFrame.style.margin = '0 auto';
      this.previewFrame.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
    } else {
      this.previewFrame.style.margin = '0';
      this.previewFrame.style.boxShadow = 'none';
    }
  }
  
  closePreview() {
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
      previewContainer.remove();
      this.previewFrame = null;
    }
  }
  
  switchFile(filename) {
    if (this.files.has(filename)) {
      // Sauvegarder le contenu actuel
      const currentCode = window.codePlayApp.ui.editor.getValue();
      this.files.get(this.activeFile).content = currentCode;
      
      // Changer de fichier
      this.activeFile = filename;
      const file = this.files.get(filename);
      
      // Mettre à jour l'éditeur
      window.codePlayApp.ui.editor.setLanguage(file.language);
      window.codePlayApp.ui.editor.setValue(file.content);
    }
  }
  
  async getEditorConfig() {
    const file = this.files.get(this.activeFile);
    return {
      language: file.language,
      theme: 'vs-dark',
      options: {
        wordWrap: 'on',
        minimap: { enabled: false }
      }
    };
  }
  
  getStarterCode() {
    // Retourner le contenu du fichier actif
    const file = this.files.get(this.activeFile);
    
    if (file.content) {
      return file.content;
    }
    
    // Contenu par défaut selon le fichier
    switch (this.activeFile) {
      case 'index.html':
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page Web</title>
</head>
<body>
    <h1>Bienvenue sur CodePlay !</h1>
    <p>Modifie ce code HTML pour créer ta propre page web.</p>
    
    <button id="monBouton">Clique-moi !</button>
    
    <div id="message"></div>
</body>
</html>`;
        
      case 'style.css':
        return `/* Styles CSS */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

button {
    background-color: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #5a67d8;
}

#message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}`;
        
      case 'script.js':
        return `// JavaScript
console.log("Page chargée !");

// Ajouter de l'interactivité
document.getElementById('monBouton').addEventListener('click', function() {
    const message = document.getElementById('message');
    message.textContent = 'Tu as cliqué sur le bouton !';
    message.style.backgroundColor = '#48bb78';
    message.style.color = 'white';
    
    console.log('Bouton cliqué !');
});`;
        
      default:
        return '';
    }
  }
  
  async cleanup() {
    this.closePreview();
  }
}