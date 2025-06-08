// src/core/BaseModule.js
export class BaseModule {
  constructor(id) {
    this.id = id;
    this.editor = null;
    this.console = null;
    this.initialized = false;
  }
  
  async initialize() {
    throw new Error('initialize() must be implemented');
  }
  
  async execute(code) {
    throw new Error('execute() must be implemented');
  }
  
  async cleanup() {
    if (this.editor) {
      this.editor.destroy();
    }
    this.initialized = false;
  }
  
  setupEditor(config) {
    // Configuration commune de l'éditeur
  }
  
  getDefaultCode() {
    return '';
  }
  
  getCapabilities() {
    return {};
  }
}