// src/components/FileManager.js
export class FileManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoSave: true,
      showHiddenFiles: false,
      maxOpenFiles: 10,
      ...options
    };
    
    // État interne
    this.openFiles = new Map(); // Map<path, FileData>
    this.activeFile = null;
    this.fileTree = {};
    this.eventListeners = new Map();
    
    // Éléments DOM
    this.tabsContainer = null;
    this.contentContainer = null;
    this.treeContainer = null;
    
    this.init();
  }
  
  init() {
    this.createDOM();
    this.setupEventListeners();
  }
  
  createDOM() {
    this.container.innerHTML = `
      <div class="file-manager">
        <div class="file-tree-panel">
          <div class="file-tree-header">
            <h3>📁 Fichiers</h3>
            <div class="file-actions">
              <button class="btn-icon" id="refreshFiles" title="Actualiser">
                🔄
              </button>
              <button class="btn-icon" id="toggleHidden" title="Afficher/Masquer fichiers cachés">
                👁️
              </button>
            </div>
          </div>
          <div class="file-tree" id="fileTree"></div>
        </div>
        
        <div class="file-editor-panel">
          <div class="file-tabs" id="fileTabs">
            <div class="tab-actions">
              <button class="btn-icon" id="closeAllTabs" title="Fermer tous">
                ❌
              </button>
            </div>
          </div>
          
          <div class="file-content" id="fileContent">
            <div class="welcome-screen">
              <div class="welcome-content">
                <h2>👋 Bienvenue dans CodePlay</h2>
                <p>Sélectionnez un fichier pour commencer à coder</p>
                <div class="quick-actions">
                  <button class="btn" id="openExercise">📚 Ouvrir un exercice</button>
                  <button class="btn" id="createFile">📝 Nouveau fichier</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Références aux éléments
    this.tabsContainer = this.container.querySelector('#fileTabs');
    this.contentContainer = this.container.querySelector('#fileContent');
    this.treeContainer = this.container.querySelector('#fileTree');
    
    this.addStyles();
  }
  
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .file-manager {
        display: flex;
        height: 100%;
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Consolas', 'Monaco', monospace;
      }
      
      .file-tree-panel {
        width: 250px;
        background: #252526;
        border-right: 1px solid #3e3e42;
        display: flex;
        flex-direction: column;
      }
      
      .file-tree-header {
        padding: 12px;
        background: #2d2d30;
        border-bottom: 1px solid #3e3e42;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .file-tree-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .file-actions {
        display: flex;
        gap: 5px;
      }
      
      .btn-icon {
        background: none;
        border: none;
        color: #cccccc;
        cursor: pointer;
        padding: 4px;
        border-radius: 3px;
        font-size: 12px;
        transition: background-color 0.2s;
      }
      
      .btn-icon:hover {
        background: #094771;
      }
      
      .file-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      
      .tree-item {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        margin: 1px 0;
        cursor: pointer;
        border-radius: 3px;
        font-size: 13px;
        user-select: none;
      }
      
      .tree-item:hover {
        background: #2a2d2e;
      }
      
      .tree-item.active {
        background: #094771;
        color: white;
      }
      
      .tree-item.folder {
        font-weight: 500;
      }
      
      .tree-item .icon {
        margin-right: 6px;
        font-size: 14px;
      }
      
      .tree-item.nested {
        margin-left: 16px;
      }
      
      .file-editor-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .file-tabs {
        background: #2d2d30;
        border-bottom: 1px solid #3e3e42;
        display: flex;
        align-items: center;
        min-height: 35px;
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      .file-tab {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d30;
        border-right: 1px solid #3e3e42;
        cursor: pointer;
        font-size: 13px;
        min-width: 120px;
        max-width: 200px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .file-tab:hover {
        background: #1e1e1e;
      }
      
      .file-tab.active {
        background: #1e1e1e;
        border-bottom: 2px solid #007acc;
      }
      
      .file-tab .tab-icon {
        margin-right: 6px;
        font-size: 12px;
      }
      
      .file-tab .tab-close {
        margin-left: auto;
        margin-right: -4px;
        padding: 2px;
        border-radius: 3px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .file-tab:hover .tab-close {
        opacity: 1;
      }
      
      .file-tab .tab-close:hover {
        background: #e81123;
        color: white;
      }
      
      .file-tab.modified::after {
        content: '●';
        color: #f0f0f0;
        margin-left: 4px;
      }
      
      .tab-actions {
        margin-left: auto;
        padding: 0 8px;
      }
      
      .file-content {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      
      .file-editor {
        width: 100%;
        height: 100%;
        border: none;
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 16px;
        resize: none;
        outline: none;
      }
      
      .file-editor:focus {
        outline: none;
      }
      
      .welcome-screen {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #1e1e1e;
      }
      
      .welcome-content {
        text-align: center;
        color: #cccccc;
      }
      
      .welcome-content h2 {
        margin-bottom: 16px;
        color: #ffffff;
      }
      
      .welcome-content p {
        margin-bottom: 24px;
        opacity: 0.8;
      }
      
      .quick-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      
      .btn {
        padding: 10px 16px;
        background: #0e639c;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 13px;
        transition: background-color 0.2s;
      }
      
      .btn:hover {
        background: #1177bb;
      }
      
      .file-type-js { color: #f7df1e; }
      .file-type-html { color: #e34c26; }
      .file-type-css { color: #1572b6; }
      .file-type-md { color: #083fa1; }
      .file-type-json { color: #cbcb41; }
      
      .hidden { display: none; }
      
      /* Scrollbar pour la tree */
      .file-tree::-webkit-scrollbar {
        width: 6px;
      }
      
      .file-tree::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .file-tree::-webkit-scrollbar-thumb {
        background: #424242;
        border-radius: 3px;
      }
      
      .file-tree::-webkit-scrollbar-thumb:hover {
        background: #555555;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .file-tree-panel {
          width: 200px;
        }
        
        .file-tab {
          min-width: 100px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setupEventListeners() {
    // Actions des boutons
    this.container.querySelector('#refreshFiles').addEventListener('click', () => {
      this.refreshFileTree();
    });
    
    this.container.querySelector('#toggleHidden').addEventListener('click', () => {
      this.toggleHiddenFiles();
    });
    
    this.container.querySelector('#closeAllTabs').addEventListener('click', () => {
      this.closeAllTabs();
    });
    
    this.container.querySelector('#openExercise').addEventListener('click', () => {
      this.emit('openExercise');
    });
    
    this.container.querySelector('#createFile').addEventListener('click', () => {
      this.createNewFile();
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.saveActiveFile();
            break;
          case 'w':
            e.preventDefault();
            this.closeActiveFile();
            break;
          case 'n':
            e.preventDefault();
            this.createNewFile();
            break;
        }
      }
    });
  }
  
  // === API Publique ===
  
  async loadExerciseFiles(exerciseData, filesContent) {
    try {
      // Fermer tous les fichiers ouverts
      this.closeAllTabs();
      
      // Construire l'arbre de fichiers
      this.buildFileTree(exerciseData, filesContent);
      
      // Ouvrir le fichier principal
      if (exerciseData.mainFile) {
        await this.openFile(exerciseData.mainFile, filesContent[exerciseData.mainFile]);
      }
      
      // Ouvrir le README si disponible
      if (filesContent['README.md'] && exerciseData.mainFile !== 'README.md') {
        await this.openFile('README.md', filesContent['README.md'], false);
      }
      
      this.emit('exerciseLoaded', { exerciseData, filesContent });
      
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      this.emit('error', error);
    }
  }
  
  async openFile(path, content = '', makeActive = true) {
    try {
      // Vérifier si le fichier est déjà ouvert
      if (this.openFiles.has(path)) {
        if (makeActive) {
          this.setActiveFile(path);
        }
        return;
      }
      
      // Vérifier la limite de fichiers ouverts
      if (this.openFiles.size >= this.options.maxOpenFiles) {
        this.emit('warning', `Maximum ${this.options.maxOpenFiles} fichiers ouverts`);
        return;
      }
      
      // Créer les données du fichier
      const fileData = {
        path,
        content,
        originalContent: content,
        modified: false,
        type: this.getFileType(path),
        editor: null
      };
      
      // Ajouter à la collection
      this.openFiles.set(path, fileData);
      
      // Créer l'onglet
      this.createTab(path);
      
      // Activer si demandé
      if (makeActive) {
        this.setActiveFile(path);
      }
      
      this.emit('fileOpened', { path, fileData });
      
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier:', error);
      this.emit('error', error);
    }
  }
  
  closeFile(path) {
    const fileData = this.openFiles.get(path);
    if (!fileData) return;
    
    // Vérifier si le fichier est modifié
    if (fileData.modified && !confirm(`Le fichier ${path} a été modifié. Fermer sans sauvegarder ?`)) {
      return false;
    }
    
    // Retirer de la collection
    this.openFiles.delete(path);
    
    // Supprimer l'onglet
    this.removeTab(path);
    
    // Si c'était le fichier actif, activer un autre
    if (this.activeFile === path) {
      const remainingFiles = Array.from(this.openFiles.keys());
      if (remainingFiles.length > 0) {
        this.setActiveFile(remainingFiles[remainingFiles.length - 1]);
      } else {
        this.activeFile = null;
        this.showWelcomeScreen();
      }
    }
    
    this.emit('fileClosed', { path });
    return true;
  }
  
  saveFile(path = this.activeFile) {
    if (!path || !this.openFiles.has(path)) return;
    
    const fileData = this.openFiles.get(path);
    const content = this.getEditorContent();
    
    fileData.content = content;
    fileData.originalContent = content;
    fileData.modified = false;
    
    // Mettre à jour l'onglet
    this.updateTab(path);
    
    this.emit('fileSaved', { path, content });
  }
  
  saveActiveFile() {
    if (this.activeFile) {
      this.saveFile(this.activeFile);
    }
  }
  
  saveAllFiles() {
    for (const path of this.openFiles.keys()) {
      this.saveFile(path);
    }
  }
  
  getFileContent(path) {
    const fileData = this.openFiles.get(path);
    return fileData ? fileData.content : null;
  }
  
  getAllOpenFiles() {
    const files = {};
    for (const [path, fileData] of this.openFiles) {
      files[path] = fileData.content;
    }
    return files;
  }
  
  // === Méthodes privées ===
  
  buildFileTree(exerciseData, filesContent) {
    this.treeContainer.innerHTML = '';
    
    // Organiser les fichiers par type
    const filesByType = {
      main: [],
      solution: [],
      test: [],
      docs: [],
      other: []
    };
    
    Object.keys(filesContent).forEach(filename => {
      if (filename === exerciseData.mainFile) {
        filesByType.main.push(filename);
      } else if (filename.includes('solution')) {
        filesByType.solution.push(filename);
      } else if (filename.includes('test')) {
        filesByType.test.push(filename);
      } else if (filename.endsWith('.md')) {
        filesByType.docs.push(filename);
      } else {
        filesByType.other.push(filename);
      }
    });
    
    // Créer les sections
    this.createFileSection('📝 Fichiers principaux', filesByType.main, filesContent);
    this.createFileSection('📚 Documentation', filesByType.docs, filesContent);
    this.createFileSection('🧪 Tests', filesByType.test, filesContent);
    this.createFileSection('✅ Solutions', filesByType.solution, filesContent);
    this.createFileSection('📄 Autres', filesByType.other, filesContent);
  }
  
  createFileSection(title, files, filesContent) {
    if (files.length === 0) return;
    
    const section = document.createElement('div');
    section.className = 'file-section';
    
    const header = document.createElement('div');
    header.className = 'tree-item folder';
    header.innerHTML = `<span class="icon">📁</span><span>${title}</span>`;
    section.appendChild(header);
    
    files.forEach(filename => {
      const item = document.createElement('div');
      item.className = 'tree-item nested';
      item.dataset.path = filename;
      
      const icon = this.getFileIcon(filename);
      const typeClass = this.getFileTypeClass(filename);
      
      item.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="${typeClass}">${filename}</span>
      `;
      
      item.addEventListener('click', () => {
        this.openFile(filename, filesContent[filename]);
        this.updateTreeSelection(filename);
      });
      
      section.appendChild(item);
    });
    
    this.treeContainer.appendChild(section);
  }
  
  createTab(path) {
    const tab = document.createElement('div');
    tab.className = 'file-tab';
    tab.dataset.path = path;
    
    const icon = this.getFileIcon(path);
    const filename = path.split('/').pop();
    
    tab.innerHTML = `
      <span class="tab-icon">${icon}</span>
      <span class="tab-name">${filename}</span>
      <span class="tab-close" title="Fermer">✕</span>
    `;
    
    // Event listeners
    tab.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        this.setActiveFile(path);
      }
    });
    
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeFile(path);
    });
    
    // Insérer avant les actions
    const tabActions = this.tabsContainer.querySelector('.tab-actions');
    this.tabsContainer.insertBefore(tab, tabActions);
  }
  
  removeTab(path) {
    const tab = this.tabsContainer.querySelector(`[data-path="${path}"]`);
    if (tab) {
      tab.remove();
    }
  }
  
  updateTab(path) {
    const tab = this.tabsContainer.querySelector(`[data-path="${path}"]`);
    const fileData = this.openFiles.get(path);
    
    if (tab && fileData) {
      tab.classList.toggle('modified', fileData.modified);
    }
  }
  
  setActiveFile(path) {
    // Désactiver l'ancien onglet
    const oldTab = this.tabsContainer.querySelector('.file-tab.active');
    if (oldTab) {
      oldTab.classList.remove('active');
    }
    
    // Activer le nouveau
    const newTab = this.tabsContainer.querySelector(`[data-path="${path}"]`);
    if (newTab) {
      newTab.classList.add('active');
    }
    
    this.activeFile = path;
    this.showFileContent(path);
    this.updateTreeSelection(path);
    
    this.emit('fileActivated', { path });
  }
  
  showFileContent(path) {
    const fileData = this.openFiles.get(path);
    if (!fileData) return;
    
    this.contentContainer.innerHTML = '';
    
    if (path.endsWith('.md')) {
      // Affichage markdown
      this.showMarkdownContent(fileData.content);
    } else {
      // Éditeur de code
      this.showCodeEditor(fileData);
    }
  }
  
  showCodeEditor(fileData) {
    const editor = document.createElement('textarea');
    editor.className = 'file-editor';
    editor.value = fileData.content;
    editor.placeholder = `Éditez ${fileData.path}...`;
    
    // Auto-resize
    editor.addEventListener('input', () => {
      this.onEditorChange(fileData, editor.value);
    });
    
    // Indentation avec Tab
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
        this.onEditorChange(fileData, editor.value);
      }
    });
    
    fileData.editor = editor;
    this.contentContainer.appendChild(editor);
    
    // Focus sur l'éditeur
    setTimeout(() => editor.focus(), 100);
  }
  
  showMarkdownContent(content) {
    const viewer = document.createElement('div');
    viewer.className = 'markdown-viewer';
    viewer.style.cssText = `
      padding: 20px;
      background: #1e1e1e;
      color: #d4d4d4;
      height: 100%;
      overflow-y: auto;
      line-height: 1.6;
    `;
    
    // Simple markdown rendering
    viewer.innerHTML = this.parseMarkdown(content);
    this.contentContainer.appendChild(viewer);
  }
  
  parseMarkdown(content) {
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#2d2d30;padding:2px 4px;border-radius:3px;">$1</code>')
      .replace(/```([\\s\\S]*?)```/g, '<pre style="background:#2d2d30;padding:10px;border-radius:5px;overflow-x:auto;"><code>$1</code></pre>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\\n/g, '<br>');
  }
  
  showWelcomeScreen() {
    const welcomeScreen = this.container.querySelector('.welcome-screen');
    this.contentContainer.innerHTML = '';
    this.contentContainer.appendChild(welcomeScreen.cloneNode(true));
  }
  
  onEditorChange(fileData, newContent) {
    const wasModified = fileData.modified;
    fileData.modified = newContent !== fileData.originalContent;
    
    if (fileData.modified !== wasModified) {
      this.updateTab(fileData.path);
    }
    
    fileData.content = newContent;
    
    // Auto-save si activé
    if (this.options.autoSave) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        this.saveFile(fileData.path);
      }, 2000);
    }
    
    this.emit('fileChanged', { path: fileData.path, content: newContent });
  }
  
  getEditorContent() {
    if (!this.activeFile) return '';
    
    const fileData = this.openFiles.get(this.activeFile);
    if (fileData && fileData.editor) {
      return fileData.editor.value;
    }
    
    return fileData ? fileData.content : '';
  }
  
  updateTreeSelection(path) {
    // Désélectionner tous
    this.treeContainer.querySelectorAll('.tree-item.active').forEach(item => {
      item.classList.remove('active');
    });
    
    // Sélectionner le nouveau
    const treeItem = this.treeContainer.querySelector(`[data-path="${path}"]`);
    if (treeItem) {
      treeItem.classList.add('active');
    }
  }
  
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'js': 'javascript',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'json': 'json',
      'txt': 'text'
    };
    return typeMap[ext] || 'text';
  }
  
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'js': '📜',
      'html': '🌐',
      'css': '🎨',
      'md': '📖',
      'json': '⚙️',
      'txt': '📄'
    };
    return iconMap[ext] || '📄';
  }
  
  getFileTypeClass(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return `file-type-${ext}`;
  }
  
  closeAllTabs() {
    const paths = Array.from(this.openFiles.keys());
    paths.forEach(path => this.closeFile(path));
  }
  
  closeActiveFile() {
    if (this.activeFile) {
      this.closeFile(this.activeFile);
    }
  }
  
  createNewFile() {
    const filename = prompt('Nom du nouveau fichier:');
    if (filename) {
      this.openFile(filename, '// Nouveau fichier\\n');
    }
  }
  
  refreshFileTree() {
    this.emit('refreshRequested');
  }
  
  toggleHiddenFiles() {
    this.options.showHiddenFiles = !this.options.showHiddenFiles;
    this.emit('toggleHiddenFiles', this.options.showHiddenFiles);
  }
  
  // === Système d'événements ===
  
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur dans le listener ${event}:`, error);
        }
      });
    }
  }
  
  // === API d'état ===
  
  getState() {
    return {
      openFiles: Array.from(this.openFiles.keys()),
      activeFile: this.activeFile,
      modifiedFiles: Array.from(this.openFiles.entries())
        .filter(([, fileData]) => fileData.modified)
        .map(([path]) => path)
    };
  }
  
  destroy() {
    // Nettoyer les event listeners
    this.eventListeners.clear();
    
    // Nettoyer le DOM
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Nettoyer les timeouts
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
  }
}