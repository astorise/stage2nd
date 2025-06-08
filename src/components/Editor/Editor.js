import * as monaco from 'monaco-editor';
import './editor-themes';

export class Editor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'codeplay-dark',
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      ...options
    };
    
    this.editor = null;
    this.currentLanguage = 'javascript';
  }
  
  async init() {
    // Configurer Monaco
    this.setupMonaco();
    
    // Créer l'éditeur
    this.editor = monaco.editor.create(this.container, {
      value: this.options.value || '// Bienvenue dans CodePlay!',
      language: this.currentLanguage,
      ...this.options
    });
    
    // Configurer les raccourcis
    this.setupKeyBindings();
    
    return this.editor;
  }
  
  setupMonaco() {
    // Configuration globale de Monaco
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
    
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true
    });
  }
  
  setupKeyBindings() {
    // Ctrl/Cmd + Enter pour exécuter
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        document.dispatchEvent(new CustomEvent('editor:run'));
      }
    );
    
    // Ctrl/Cmd + S pour sauvegarder
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        document.dispatchEvent(new CustomEvent('editor:save'));
      }
    );
  }
  
  getValue() {
    return this.editor.getValue();
  }
  
  setValue(value) {
    this.editor.setValue(value);
  }
  
  setLanguage(language) {
    monaco.editor.setModelLanguage(
      this.editor.getModel(),
      language
    );
    this.currentLanguage = language;
  }
  
  onDidChangeContent(callback) {
    return this.editor.onDidChangeModelContent(callback);
  }
  
  destroy() {
    this.editor?.dispose();
  }
}