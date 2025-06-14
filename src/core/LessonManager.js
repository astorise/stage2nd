export class LessonManager {
  constructor(app) {
    this.app = app;
    this.manifest = null;
    this.chapters = [];
    this.exercises = new Map(); // exerciseId -> exercise data
    this.completedExercises = new Set();
    this.currentExercise = null;
  }
  
  async loadManifest() {
    try {
      // Charger le manifest principal
      const manifestUrl = '/lessons/javascript/manifest.json';
      const response = await fetch(manifestUrl);
      
      if (!response.ok) {
        throw new Error('Impossible de charger le manifest');
      }
      
      this.manifest = await response.json();
      this.chapters = this.manifest.chapters || [];
      
      // Indexer tous les exercices pour un accès rapide
      this.indexExercises();
      
      // Charger la progression
      await this.loadProgress();
      
      // Afficher les chapitres et exercices
      this.renderChapters();
      
    } catch (error) {
      console.error('Erreur lors du chargement du manifest:', error);
      this.app.ui.showError('Impossible de charger les leçons');
    }
  }
  
  indexExercises() {
    this.chapters.forEach(chapter => {
      chapter.exercises.forEach(exercise => {
        // Créer un ID unique pour chaque exercice
        const exerciseId = `${chapter.id}/${exercise.id}`;
        this.exercises.set(exerciseId, {
          ...exercise,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          fullId: exerciseId,
          basePath: `/lessons/javascript/${chapter.id}/${exercise.id}/`
        });
      });
    });
  }

  indexExercisesWithBasePath(baseUrl) {
  this.chapters.forEach(chapter => {
    chapter.exercises.forEach(exercise => {
      const exerciseId = `${chapter.id}/${exercise.id}`;
      this.exercises.set(exerciseId, {
        ...exercise,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        fullId: exerciseId,
        basePath: `${baseUrl}/${chapter.id}/${exercise.id}/`
      });
    });
  });
}
  
  renderChapters() {
    const container = this.app.ui.elements.lessonsList;
    container.innerHTML = '';
    
    this.chapters.forEach(chapter => {
      // Créer la section du chapitre
      const chapterSection = document.createElement('div');
      chapterSection.className = 'chapter-section';
      
      // En-tête du chapitre
      const chapterHeader = document.createElement('div');
      chapterHeader.className = 'chapter-header';
      chapterHeader.innerHTML = `
        <h3>${chapter.title}</h3>
        <span class="chapter-info">${chapter.exercises.length} exercices • ${chapter.estimatedTime}</span>
      `;
      
      // Liste des exercices
      const exercisesList = document.createElement('div');
      exercisesList.className = 'exercises-list';
      
      chapter.exercises.forEach(exercise => {
        const exerciseId = `${chapter.id}/${exercise.id}`;
        const isCompleted = this.completedExercises.has(exerciseId);
        const isActive = this.currentExercise?.fullId === exerciseId;
        
        const exerciseCard = document.createElement('div');
        exerciseCard.className = `exercise-card ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
        
        exerciseCard.innerHTML = `
          <div class="exercise-status">
            ${isCompleted ? '✅' : this.getDifficultyIcon(exercise.difficulty)}
          </div>
          <div class="exercise-info">
            <h4>${exercise.title}</h4>
            <p>${exercise.description}</p>
            <span class="exercise-meta">${exercise.difficulty} • ${exercise.language}</span>
          </div>
        `;
        
        exerciseCard.addEventListener('click', () => this.loadExercise(exerciseId));
        exercisesList.appendChild(exerciseCard);
      });
      
      chapterSection.appendChild(chapterHeader);
      chapterSection.appendChild(exercisesList);
      container.appendChild(chapterSection);
    });
    
    this.updateProgress();
  }
  
  getDifficultyIcon(difficulty) {
    const icons = {
      'facile': '🟢',
      'moyen': '🟡',
      'difficile': '🔴'
    };
    return icons[difficulty] || '📝';
  }
  
async loadCourse(course) {
  this.currentCourse = course;
  this.manifest = course.manifest;
  this.chapters = this.manifest.chapters || [];
  
  // Réinitialiser les exercices
  this.exercises.clear();
  
  // Réindexer avec le bon chemin de base
  this.indexExercisesWithBasePath(course.baseUrl);
  
  // Charger la progression spécifique à ce cours
  await this.loadCourseProgress(course.id);
  
  // Afficher les chapitres
  this.renderChapters();
}
  
  async loadExercise(exerciseId) {
    const exercise = this.exercises.get(exerciseId);
    if (!exercise) {
      throw new Error(`Exercice introuvable: ${exerciseId}`);
    }
    
    try {
      // Charger les fichiers de l'exercice
      const files = {};
      
      // Charger les fichiers principaux en parallèle
      const fetchPromises = exercise.files.map(async (filename) => {
        const filePath = `${exercise.basePath}${filename}`;
        try {
          const response = await fetch(filePath);
          if (response.ok) {
            files[filename] = await response.text();
          }
        } catch (error) {
          console.warn(`Impossible de charger ${filename}:`, error);
        }
      });

      await Promise.all(fetchPromises);
      
      // Préparer les données de l'exercice
      this.currentExercise = {
        ...exercise,
        files,
        readme: files['README.md'] || this.generateDefaultReadme(exercise),
        starterCode: files[exercise.mainFile] || '// Code de démarrage\n',
        testCode: files[exercise.testFile] || 'return true;',
        solutionCode: files['solution.js'] || ''
      };
      
      // Mettre à jour la référence dans l'application
      this.app.currentLesson = this.currentExercise;
      
      // Afficher l'exercice
      this.displayExercise();
      
      // Activer le bon module
      const moduleType = exercise.language === 'web' ? 'web' : 'javascript';
      await this.app.modules.activateModule(moduleType);
      
      // Si c'est un exercice web, charger aussi le HTML
      if (exercise.language === 'web' && exercise.htmlFile) {
        const webModule = this.app.modules.getActiveModule();
        if (webModule && webModule.id === 'web') {
          webModule.files.set('index.html', { 
            language: 'html', 
            content: files[exercise.htmlFile] || '' 
          });
          webModule.files.set('script.js', { 
            language: 'javascript', 
            content: this.currentExercise.starterCode 
          });
        }
      }
      
      // Sauvegarder la session
      await this.app.saveSession();
      
    } catch (error) {
      console.error('Erreur lors du chargement de l\'exercice:', error);
      this.app.ui.showError(`Impossible de charger l'exercice: ${error.message}`);
    }
  }
  
  displayExercise() {
    if (!this.currentExercise) return;
    
    // Convertir le README markdown en HTML (version simplifiée)
    const readmeHtml = this.markdownToHtml(this.currentExercise.readme);
    
    // Afficher dans l'interface
    this.app.ui.showLesson({
      title: this.currentExercise.title,
      content: `
        <div class="exercise-breadcrumb">
          ${this.currentExercise.chapterTitle} › ${this.currentExercise.title}
        </div>
        ${readmeHtml}
        <div class="exercise-actions">
          ${this.currentExercise.solutionCode ? 
            '<button class="btn-secondary" onclick="window.codePlayApp.lessons.showSolution()">👁️ Voir la solution</button>' : 
            ''}
          <button class="btn-secondary" onclick="window.codePlayApp.lessons.resetExercise()">🔄 Réinitialiser</button>
        </div>
      `
    });
    
    // Charger le code de démarrage
    this.app.ui.editor.setValue(this.currentExercise.starterCode);
    
    // Mettre à jour l'interface
    this.renderChapters();
  }
  
  markdownToHtml(markdown) {
    // Conversion markdown basique
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\* (.+)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```javascript\n([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
      .replace(/```\n([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
  
  generateDefaultReadme(exercise) {
    return `# ${exercise.title}

## Description
${exercise.description}

## Objectif
Complétez le code pour faire passer tous les tests.

## Difficulté
${exercise.difficulty}

## Conseils
- Lisez attentivement les tests pour comprendre ce qui est attendu
- N'hésitez pas à utiliser console.log() pour débugger
- Si vous êtes bloqué, utilisez le bouton "Voir la solution"
`;
  }
  
  async checkExercise(code, executionResult) {
    if (!this.currentExercise || !this.currentExercise.testCode) {
      return { success: false, tests: [] };
    }

    try {
      let testCode = this.currentExercise.testCode;

      // Détecter la première fonction test...()
      const fnMatch = testCode.match(/function\s+(test\w+)\s*\(/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        testCode += `\nreturn ${fnName}(code, output, results);`;
      }

      // Créer une fonction de test
      const testFunction = new Function('code', 'output', 'results', testCode);

      // Formatter la sortie
      const output = (executionResult.logs || [])
        .filter(log => log.type === 'log')
        .map(log => log.args.join(' '))
        .join('\n');

      // Exécuter les tests
      const result = testFunction(code, output, executionResult);

      let tests, success;
      if (Array.isArray(result)) {
        tests = result;
        success = tests.every(t => t.pass);
      } else if (typeof result === 'boolean') {
        success = result;
        tests = [{ name: 'Résultat', pass: result }];
      } else {
        success = !!result;
        tests = [{ name: 'Résultat', pass: success }];
      }

      if (success) {
        this.completeExercise(this.currentExercise.fullId);
      }

      return { success, tests };

    } catch (error) {
      console.error('Erreur lors de l\'exécution des tests:', error);
      return { success: false, tests: [{ name: 'Erreur', pass: false }] };
    }
  }
  
  completeExercise(exerciseId) {
    if (!this.completedExercises.has(exerciseId)) {
      this.completedExercises.add(exerciseId);
      this.saveProgress();
      this.renderChapters();
      
      const exercise = this.exercises.get(exerciseId);
      this.app.ui.showSuccess(`Bravo ! Tu as complété "${exercise.title}" 🎉`);
      
      // Vérifier les achievements
      this.checkAchievements();
    }
  }
  
  showSolution() {
    if (this.currentExercise && this.currentExercise.solutionCode) {
      if (confirm('Es-tu sûr de vouloir voir la solution ?')) {
        this.app.ui.editor.setValue(this.currentExercise.solutionCode);
        this.app.ui.console.info('Solution chargée. Essaie de la comprendre !');
      }
    }
  }
  
  resetExercise() {
    if (this.currentExercise) {
      this.app.ui.editor.setValue(this.currentExercise.starterCode);
      this.app.ui.console.info('Code réinitialisé');
    }
  }
  
  async saveProgress() {
    await this.app.storage.set('completedExercises', Array.from(this.completedExercises));
    await this.app.storage.set('lastCompletedDate', new Date().toISOString());
    await this.app.storage.set('currentPath', this.manifest.name);
  }
  
  async loadProgress() {
    const saved = await this.app.storage.get('completedExercises');
    if (saved) {
      this.completedExercises = new Set(saved);
    }
  }
  
  updateProgress() {
    const totalExercises = this.exercises.size;
    const completedCount = this.completedExercises.size;
    const percentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
    
    this.app.ui.updateProgress(percentage);
    
    // Mettre à jour les statistiques
    const stats = this.calculateStats();
    this.updateStatsDisplay(stats);
  }
  
  calculateStats() {
    let completedByChapter = {};
    let completedByDifficulty = { facile: 0, moyen: 0, difficile: 0 };
    
    this.completedExercises.forEach(exerciseId => {
      const exercise = this.exercises.get(exerciseId);
      if (exercise) {
        // Par chapitre
        if (!completedByChapter[exercise.chapterId]) {
          completedByChapter[exercise.chapterId] = 0;
        }
        completedByChapter[exercise.chapterId]++;
        
        // Par difficulté
        completedByDifficulty[exercise.difficulty]++;
      }
    });
    
    return {
      total: this.exercises.size,
      completed: this.completedExercises.size,
      byChapter: completedByChapter,
      byDifficulty: completedByDifficulty
    };
  }
  
  updateStatsDisplay(stats) {
    // Vous pouvez ajouter un affichage des statistiques dans l'UI
    console.log('Statistiques:', stats);
  }
  
  checkAchievements() {
    const completed = this.completedExercises.size;
    const total = this.exercises.size;
    
    // Achievements par nombre
    if (completed === 1) {
      this.app.ui.showSuccess('🎉 Premier exercice complété !');
    } else if (completed === 5) {
      this.app.ui.showSuccess('⭐ 5 exercices complétés !');
    } else if (completed === 10) {
      this.app.ui.showSuccess('🔥 10 exercices complétés ! Tu progresses bien !');
    }
    
    // Achievement par chapitre
    this.chapters.forEach(chapter => {
      const chapterExercises = chapter.exercises.map(e => `${chapter.id}/${e.id}`);
      const completedInChapter = chapterExercises.filter(id => this.completedExercises.has(id));
      
      if (completedInChapter.length === chapterExercises.length) {
        this.app.ui.showSuccess(`🏆 Chapitre "${chapter.title}" complété !`);
      }
    });
    
    // Achievement final
    if (completed === total) {
      this.app.ui.showSuccess('🎓 Félicitations ! Tu as terminé tout le parcours JavaScript !');
    }
  }

  async loadCourseProgress(courseId) {
  const key = `progress_${courseId}`;
  const saved = await this.app.storage.get(key);
  if (saved) {
    this.completedExercises = new Set(saved.completedExercises || []);
  } else {
    this.completedExercises = new Set();
  }
}
async saveProgress() {
  if (!this.currentCourse) return;
  
  const key = `progress_${this.currentCourse.id}`;
  await this.app.storage.set(key, {
    completedExercises: Array.from(this.completedExercises),
    lastUpdated: new Date().toISOString(),
    courseVersion: this.manifest.version
  });
}

}