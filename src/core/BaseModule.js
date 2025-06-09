export class BaseModule {
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.capabilities = {};
  }
  
  /**
   * Initialise le module
   * @returns {Promise<void>}
   */
  async init() {
    // À implémenter par les sous-classes
  }
  
  /**
   * Exécute du code
   * @param {string} code - Le code à exécuter
   * @param {Object} context - Contexte d'exécution
   * @returns {Promise<ExecutionResult>}
   */
  async execute(code, context = {}) {
    throw new Error('execute() doit être implémenté');
  }
  
  /**
   * Retourne la configuration de l'éditeur
   * @returns {Promise<EditorConfig>}
   */
  async getEditorConfig() {
    return {
      language: 'plaintext',
      theme: 'vs-dark',
      options: {}
    };
  }
  
  /**
   * Retourne le code de démarrage
   * @returns {string}
   */
  getStarterCode() {
    return '';
  }
  
  /**
   * Retourne les capacités du module
   * @returns {Object}
   */
  getCapabilities() {
    return this.capabilities;
  }
  
  /**
   * Nettoie le module
   * @returns {Promise<void>}
   */
  async cleanup() {
    // À implémenter si nécessaire
  }
}