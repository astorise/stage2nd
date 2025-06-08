// src/components/Editor/MonacoEditor.js
import * as monaco from 'monaco-editor';

export class MonacoEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'vs-dark',
      language: 'javascript',
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      ...options
    };
    
    this.init();
  }
  
  init() {
    // Configuration des thèmes personnalisés
    monaco.editor.defineTheme('codeplay-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' }
      ],
      colors: {
        'editor.background': '#1a202c',
        'editor.foreground': '#e2e8f0'
      }
    });
    
    this.editor = monaco.editor.create(this.container, {
      value: this.options.value || '',
      language: this.options.language,
      theme: 'codeplay-dark',
      ...this.options
    });
    
    this.setupAutoComplete();
  }
  
  setupAutoComplete() {
    // Ajouter des snippets personnalisés
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Afficher un message dans la console'
          },
          {
            label: 'func',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${3:// corps}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Créer une fonction'
          }
        ];
        
        return { suggestions };
      }
    });
  }
  
  getValue() {
    return this.editor.getValue();
  }
  
  setValue(value) {
    this.editor.setValue(value);
  }
  
  setLanguage(language) {
    const model = this.editor.getModel();
    monaco.editor.setModelLanguage(model, language);
  }
  
  onDidChangeContent(callback) {
    return this.editor.onDidChangeModelContent(callback);
  }
  
  destroy() {
    this.editor.dispose();
  }
}