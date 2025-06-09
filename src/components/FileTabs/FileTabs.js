export class FileTabs {
  constructor(container, onFileChange) {
    this.container = container;
    this.onFileChange = onFileChange;
    this.files = [];
    this.activeFile = null;
  }
  
  init(files, activeFile) {
    this.files = files;
    this.activeFile = activeFile;
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="file-tabs">
        ${this.files.map(file => `
          <button class="file-tab ${file === this.activeFile ? 'active' : ''}" 
                  data-file="${file}">
            ${this.getFileIcon(file)} ${file}
          </button>
        `).join('')}
      </div>
    `;
    
    // Ajouter les événements
    this.container.querySelectorAll('.file-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const filename = e.currentTarget.dataset.file;
        this.setActiveFile(filename);
      });
    });
  }
  
  setActiveFile(filename) {
    this.activeFile = filename;
    this.render();
    
    if (this.onFileChange) {
      this.onFileChange(filename);
    }
  }
  
  getFileIcon(filename) {
    const ext = filename.split('.').pop();
    const icons = {
      'html': '📄',
      'css': '🎨',
      'js': '📜',
      'py': '🐍'
    };
    return icons[ext] || '📄';
  }
}