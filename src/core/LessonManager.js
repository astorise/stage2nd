export class LessonManager {
  constructor(app) {
    this.app = app;
    this.lessons = [];
    this.completedLessons = new Set();
    this.currentLesson = null;
  }
  
  async loadManifest() {
    try {
      const manifestUrl = this.app.config.lessonsUrl || '/lessons/manifest.json';
      const response = await fetch(manifestUrl);
      
      if (!response.ok) {
        throw new Error('Impossible de charger les leçons');
      }
      
      const data = await response.json();
      this.lessons = data.lessons || [];
      
      // Charger la progression
      await this.loadProgress();
      
      // Afficher les leçons
      this.renderLessons();
      
    } catch (error) {
      console.error('Erreur lors du chargement des leçons:', error);
      this.app.ui.showError('Impossible de charger les leçons');
    }
  }
  
  async loadLesson(lessonId) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      throw new Error(`Leçon introuvable: ${lessonId}`);
    }
    
    try {
      // Charger le contenu de la leçon
      if (lesson.contentUrl) {
        const response = await fetch(lesson.contentUrl);
        lesson.content = await response.text();
      }
      
      // Charger le code de démarrage
      if (lesson.starterUrl) {
        const response = await fetch(lesson.starterUrl);
        lesson.starterCode = await response.text();
      }
      
      // Charger les tests
      if (lesson.testUrl) {
        const response = await fetch(lesson.testUrl);
        const testCode = await response.text();
        lesson.testFunction = new Function('code', 'output', testCode);
      }
      
      this.currentLesson = lesson;
      this.app.currentLesson = lesson;
      
      // Afficher la leçon
      this.app.ui.showLesson(lesson);
      
      // Charger le code de démarrage dans l'éditeur
      if (lesson.starterCode) {
        this.app.ui.editor.setValue(lesson.starterCode);
      }
      
      // Activer le bon module
      if (lesson.module) {
        await this.app.modules.activateModule(lesson.module);
      }
      
      // Sauvegarder la session
      await this.app.saveSession();
      
    } catch (error) {
      console.error('Erreur lors du chargement de la leçon:', error);
      throw error;
    }
  }
  
  renderLessons() {
    const container = this.app.ui.elements.lessonsList;
    container.innerHTML = '';
    
    this.lessons.forEach(lesson => {
      const card = document.createElement('div');
      card.className = 'lesson-card';
      
      if (this.completedLessons.has(lesson.id)) {
        card.classList.add('completed');
      }
      
      if (this.currentLesson?.id === lesson.id) {
        card.classList.add('active');
      }
      
      card.innerHTML = `
        <div class="lesson-icon">${lesson.icon || '📖'}</div>
        <div class="lesson-details">
          <h3>${lesson.title}</h3>
          <p>${lesson.description || ''}</p>
        </div>
        ${this.completedLessons.has(lesson.id) ? '<span class="checkmark">✓</span>' : ''}
      `;
      
      card.addEventListener('click', () => this.loadLesson(lesson.id));
      container.appendChild(card);
    });
    
    this.updateProgress();
  }
  
  async checkExercise(lessonId, code, executionResult) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.testFunction) {
      return false;
    }
    
    try {
      // Formatter la sortie pour les tests
      const output = executionResult.logs
        .filter(log => log.type === 'log')
        .map(log => log.args.join(' '))
        .join('\n');
      
      return lesson.testFunction(code, output);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }
  
  completeLesson(lessonId) {
    if (!this.completedLessons.has(lessonId)) {
      this.completedLessons.add(lessonId);
      this.saveProgress();
      this.renderLessons();
      
      // Animation de succès
      const lesson = this.lessons.find(l => l.id === lessonId);
      this.app.ui.showSuccess(`Bravo ! Tu as complété "${lesson.title}"`);
      
      // Vérifier les achievements
      this.checkAchievements();
    }
  }
  
  async saveProgress() {
    await this.app.storage.set('completedLessons', Array.from(this.completedLessons));
    await this.app.storage.set('lastCompletedDate', new Date().toISOString());
  }
  
  async loadProgress() {
    const saved = await this.app.storage.get('completedLessons');
    if (saved) {
      this.completedLessons = new Set(saved);
    }
  }
  
  updateProgress() {
    const total = this.lessons.length;
    const completed = this.completedLessons.size;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    this.app.ui.updateProgress(percentage);
  }
  
  checkAchievements() {
    const completed = this.completedLessons.size;
    const total = this.lessons.length;
    
    if (completed === 1) {
      this.app.ui.showSuccess('🎉 Première leçon complétée !');
    } else if (completed === 5) {
      this.app.ui.showSuccess('🌟 5 leçons complétées ! Continue comme ça !');
    } else if (completed === total) {
      this.app.ui.showSuccess('🏆 Félicitations ! Tu as terminé toutes les leçons !');
    }
  }
}