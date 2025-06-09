import { EventEmitter } from 'eventemitter3';

export class ModuleManager extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.modules = new Map();
    this.activeModule = null;
    this.availableModules = {
      javascript: () => import('@modules/javascript/JavaScriptModule'),
  //    python: () => import('@modules/python/PythonModule'),
      web: () => import('@modules/web/WebModule')
    };
  }
  
  async loadAvailableModules() {
    // Charger uniquement les métadonnées des modules disponibles
    const moduleList = [];
    
    for (const [id, loader] of Object.entries(this.availableModules)) {
      try {
        // Pour l'instant, on charge juste les infos de base
        moduleList.push({
          id,
          name: this.getModuleName(id),
          icon: this.getModuleIcon(id),
          available: true
        });
      } catch (error) {
        console.warn(`Module ${id} non disponible:`, error);
      }
    }
    
    this.emit('modules:loaded', moduleList);
    return moduleList;
  }
  
  async loadModule(moduleId) {
    // Vérifier si déjà chargé
    if (this.modules.has(moduleId)) {
      return this.modules.get(moduleId);
    }
    
    // Charger le module
    const loader = this.availableModules[moduleId];
    if (!loader) {
      throw new Error(`Module inconnu: ${moduleId}`);
    }
    
    try {
      const ModuleClass = (await loader()).default;
      const module = new ModuleClass();
      
      // Initialiser le module
      await module.init();
      
      this.modules.set(moduleId, module);
      this.emit('module:loaded', { moduleId, module });
      
      return module;
    } catch (error) {
      console.error(`Erreur lors du chargement du module ${moduleId}:`, error);
      throw error;
    }
  }
  
  async activateModule(moduleId) {
    // Désactiver le module actuel
    if (this.activeModule) {
      await this.deactivateModule();
    }
    
    // Charger et activer le nouveau module
    const module = await this.loadModule(moduleId);
    this.activeModule = module;
    
    // Configurer l'éditeur pour ce module
    const config = await module.getEditorConfig();
    this.app.ui.editor.setLanguage(config.language);
    
    // Mettre à jour l'interface
    this.app.ui.setActiveModule(moduleId);
    
    // Sauvegarder le choix
    await this.app.saveSession();
    
    this.emit('module:activated', { moduleId, module });
  }
  
  async deactivateModule() {
    if (!this.activeModule) return;
    
    // Nettoyer si nécessaire
    if (this.activeModule.cleanup) {
      await this.activeModule.cleanup();
    }
    
    this.activeModule = null;
  }
  
  getActiveModule() {
    return this.activeModule;
  }
  
  async executeCode(code, context = {}) {
    if (!this.activeModule) {
      throw new Error('Aucun module actif');
    }
    
    return await this.activeModule.execute(code, context);
  }
  
  getModuleName(moduleId) {
    const names = {
      javascript: 'JavaScript',
      python: 'Python',
      web: 'HTML/CSS/JS'
    };
    return names[moduleId] || moduleId;
  }
  
  getModuleIcon(moduleId) {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      web: '🌐'
    };
    return icons[moduleId] || '📦';
  }
}