import * as monaco from 'monaco-editor';

// Définir le thème CodePlay Dark
monaco.editor.defineTheme('codeplay-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'class', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'variable.predefined', foreground: '9CDCFE' },
    { token: 'constant', foreground: '4FC1FF' },
    { token: 'parameter', foreground: '9CDCFE' },
    { token: 'property', foreground: '9CDCFE' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'operator.sql', foreground: 'D4D4D4' },
    { token: 'operator.sql', foreground: 'D4D4D4' },
    { token: 'punctuation', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1a202c',
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#2d3748',
    'editor.selectionBackground': '#4a5568',
    'editor.inactiveSelectionBackground': '#4a556855',
    'editorCursor.foreground': '#667eea',
    'editorWhitespace.foreground': '#4a5568',
    'editorIndentGuide.background': '#4a5568',
    'editorIndentGuide.activeBackground': '#667eea',
    'editorLineNumber.foreground': '#718096',
    'editorLineNumber.activeForeground': '#e2e8f0',
    'editor.selectionHighlightBackground': '#667eea33',
  }
});

// Définir le thème CodePlay Light
monaco.editor.defineTheme('codeplay-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    { token: 'keyword', foreground: '0000FF' },
    { token: 'string', foreground: 'A31515' },
    { token: 'number', foreground: '098658' },
    { token: 'function', foreground: '795E26' },
    { token: 'variable', foreground: '001080' },
    { token: 'type', foreground: '267F99' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#f7fafc',
    'editor.selectionBackground': '#bee3f8',
    'editorCursor.foreground': '#667eea',
    'editorLineNumber.foreground': '#a0aec0',
  }
});