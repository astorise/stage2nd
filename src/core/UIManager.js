import { Editor } from '@components/Editor/Editor';
import { Console } from '@components/Console/Console';
import { NetworkMonitor } from '@components/NetworkMonitor/NetworkMonitor';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.editor = null;
    this.console = null;
    this.elements = {};
  }
  
  async init() {
    // Créer l'interface si elle n'existe pas
    this.createUI();
    
    // Récupérer les éléments DOM
    this.elements = {
      editor: document.getElementById('editor'),
      console: document.getElementById('console'),
      lessonsList: document.getElementById('lessons-list'),
      lessonInfo: document.getElementById('lesson-info'),
      moduleSelector: document.getElementById('module-selector'),
      runButton: document.getElementById('btn-run'),
      resetButton: document.getElementById('btn-reset'),
      progressFill: document.getElementById('progress-fill')
    };
    
    // Vérifier que les éléments critiques existent
    if (!this.elements.editor) {
      throw new Error('Editor element not found in DOM');
    }
    
    try {
      // Initialiser l'éditeur
      this.editor = new Editor(this.elements.editor);
      await this.editor.init();
      
      // Initialiser la console
    // Après l'initialisation de la console
this.console = new Console(document.getElementById('console'));

// Initialiser le Network Monitor
this.networkMonitor = new NetworkMonitor(document.getElementById('network-monitor'));

// Gérer les onglets
this.setupOutputTabs();
      
      // Configurer les événements
      this.setupEventListeners();
      
      // Initialiser le sélecteur de modules
      this.initModuleSelector();
      
    } catch (error) {
      console.error('Failed to initialize UI components:', error);
      throw error;
    }
  }
  
  createUI() {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }
    
    // Remplacer le contenu de chargement par l'interface
    app.innerHTML = `
      <header class="app-header">
        <div class="header-brand">
          <h1>🚀 CodePlay</h1>
          <span class="header-tagline">Apprends à programmer</span>
        </div>
        <nav class="header-nav">
          <div class="module-selector" id="module-selector"></div>
          <button class="btn-icon" id="btn-settings" title="Paramètres">⚙️</button>
        </nav>
      </header>
      
      <main class="app-main">
        <aside class="sidebar" id="sidebar">
          <div class="lessons-container">
            <h2>📚 Leçons</h2>
            <div id="lessons-list" class="lessons-list">
              <div class="loading">Chargement des leçons...</div>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span class="progress-text">0% complété</span>
          </div>
        </aside>
        
        <section class="workspace">
          <div class="lesson-info" id="lesson-info">
            <div class="welcome-screen">
              <h2>Bienvenue dans CodePlay ! 👋</h2>
              <p>Sélectionne une leçon pour commencer</p>
            </div>
          </div>
          
          <div class="editor-container">
            <div class="editor-toolbar">
              <button class="btn-primary" id="btn-run">
                ▶️ Exécuter
              </button>
              <button class="btn-secondary" id="btn-reset">
                🔄 Réinitialiser
              </button>
            </div>
            <div id="editor" class="editor"></div>
          </div>
          
          <div class="output-container" id="output-container">
  <div class="output-tabs">
    <button class="output-tab active" data-panel="console">Console</button>
    <button class="output-tab" data-panel="network">Réseau</button>
  </div>
  <div class="output-panels">
    <div class="output-panel active" id="console-panel">
      <div id="console"></div>
    </div>
    <div class="output-panel" id="network-panel">
      <div id="network-monitor"></div>
    </div>
  </div>
</div>
        </section>
      </main>
    `;
  }
  setupEventListeners() {
    // Bouton Exécuter
    this.elements.runButton.addEventListener('click', () => {
      this.executeCode();
    });
    
    // Bouton Réinitialiser
    this.elements.resetButton.addEventListener('click', () => {
      this.resetCode();
    });
    
    // Raccourcis clavier globaux
    document.addEventListener('editor:run', () => {
      this.executeCode();
    });
    
    document.addEventListener('editor:save', () => {
      this.app.saveSession();
      this.showNotification('Session sauvegardée');
    });
    
    // Changements dans l'éditeur
    this.editor.onDidChangeContent(() => {
      this.app.emit('editor:change', {
        code: this.editor.getValue()
      });
    });
  }
  
  async executeCode() {
    const code = this.editor.getValue();
    
    // Désactiver le bouton pendant l'exécution
    this.elements.runButton.disabled = true;
    this.elements.runButton.textContent = '⏳ Exécution...';
    
    try {
      // Effacer la console
      this.console.clear();
      
      // Exécuter le code
      const result = await this.app.modules.executeCode(code);
      
      // Afficher les résultats
      if (result.logs) {
        result.logs.forEach(log => {
          this.console[log.type](...log.args);
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          this.console.error(error.message);
        });
      }
      
      // Vérifier si l'exercice est réussi
      if (this.app.currentLesson) {
        const success = await this.app.lessons.checkExercise(
          this.app.currentLesson.id,
          code,
          result
        );
        
        if (success) {
          this.showSuccess('Exercice réussi ! 🎉');
          this.app.lessons.completeLesson(this.app.currentLesson.id);
        }
      }
      
    } catch (error) {
      this.console.error('Erreur:', error.message);
    } finally {
      // Réactiver le bouton
      this.elements.runButton.disabled = false;
      this.elements.runButton.textContent = '▶️ Exécuter';
    }
  }
  
  resetCode() {
    if (this.app.currentLesson) {
      const starterCode = this.app.currentLesson.starterCode || 
                         this.app.modules.getActiveModule()?.getStarterCode() || 
                         '';
      this.editor.setValue(starterCode);
      this.console.info('Code réinitialisé');
    }
  }
  
  initModuleSelector() {
    // Créer le sélecteur de modules
    const selector = document.createElement('select');
    selector.className = 'module-select';
    
    // Écouter les modules chargés
    this.app.modules.on('modules:loaded', (modules) => {
      selector.innerHTML = modules.map(module => `
        <option value="${module.id}">
          ${module.icon} ${module.name}
        </option>
      `).join('');
      
      // Sélectionner le module actif
      if (this.app.currentModule) {
        selector.value = this.app.currentModule.id;
      }
    });
    
    // Gérer le changement de module
    selector.addEventListener('change', (e) => {
      this.app.modules.activateModule(e.target.value);
    });
    
    this.elements.moduleSelector.appendChild(selector);
  }
  
  setActiveModule(moduleId) {
    const selector = this.elements.moduleSelector.querySelector('select');
    if (selector) {
      selector.value = moduleId;
    }
  }
  
  showLesson(lesson) {
    if (!lesson) {
      this.elements.lessonInfo.innerHTML = `
        <div class="welcome-screen">
          <h2>Bienvenue dans CodePlay ! 👋</h2>
          <p>Sélectionne une leçon pour commencer</p>
        </div>
      `;
      return;
    }
    
    this.elements.lessonInfo.innerHTML = `
      <div class="lesson-header">
        <h2>${lesson.title}</h2>
        <span class="lesson-meta">${lesson.duration || '15 min'}</span>
      </div>
      <div class="lesson-content">
        ${lesson.content || '<p>Contenu de la leçon...</p>'}
      </div>
    `;
  }
  
  updateProgress(percentage) {
    this.elements.progressFill.style.width = `${percentage}%`;
    document.querySelector('.progress-text').textContent = `${Math.round(percentage)}% complété`;
  }
  
  showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Suppression après 3 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  showSuccess(message) {
    this.showNotification(message, 'success');
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }

  setupFileTabs() {
  const module = this.app.modules.getActiveModule();
  
  if (module && module.capabilities.multiFile) {
    // Créer le conteneur d'onglets s'il n'existe pas
    let tabsContainer = document.getElementById('file-tabs-container');
    if (!tabsContainer) {
      tabsContainer = document.createElement('div');
      tabsContainer.id = 'file-tabs-container';
      
      // L'insérer avant l'éditeur
      const editorContainer = document.querySelector('.editor-container');
      editorContainer.insertBefore(tabsContainer, editorContainer.firstChild);
    }
    
    // Initialiser les onglets
    const fileTabs = new FileTabs(tabsContainer, (filename) => {
      module.switchFile(filename);
    });
    
    fileTabs.init(
      Array.from(module.files.keys()),
      module.activeFile
    );
  }
}
setupOutputTabs() {
  const tabs = document.querySelectorAll('.output-tab');
  const panels = document.querySelectorAll('.output-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.panel;
      
      // Mettre à jour les onglets
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mettre à jour les panneaux
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${targetPanel}-panel`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

}