// src/core/PluginSystem.js
export class PluginSystem {
  constructor(app) {
    this.app = app;
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  async loadPlugin(pluginUrl) {
    try {
      const module = await import(pluginUrl);
      const Plugin = module.default;
      const plugin = new Plugin();
      
      await this.registerPlugin(plugin);
      return plugin;
    } catch (error) {
      console.error('Erreur chargement plugin:', error);
      throw error;
    }
  }
  
  async registerPlugin(plugin) {
    if (!plugin.id) {
      throw new Error('Plugin must have an id');
    }
    
    this.plugins.set(plugin.id, plugin);
    
    // Initialiser le plugin
    if (plugin.initialize) {
      await plugin.initialize(this.app);
    }
    
    // Enregistrer les hooks
    if (plugin.hooks) {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        this.registerHook(hookName, plugin.id, handler);
      }
    }
    
    console.log(`Plugin ${plugin.id} loaded successfully`);
  }
  
  registerHook(hookName, pluginId, handler) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Map());
    }
    
    this.hooks.get(hookName).set(pluginId, handler);
  }
  
  async executeHook(hookName, ...args) {
    const handlers = this.hooks.get(hookName);
    if (!handlers) return;
    
    const results = [];
    for (const [pluginId, handler] of handlers) {
      try {
        const result = await handler(...args);
        results.push({ pluginId, result });
      } catch (error) {
        console.error(`Hook error in ${pluginId}:`, error);
      }
    }
    
    return results;
  }
}