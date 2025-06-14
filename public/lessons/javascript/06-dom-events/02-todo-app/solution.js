class TodoApp {
  constructor() {
    this.todos = this.chargerTodos();
    this.formulaire = document.getElementById('todoForm');
    this.champSaisie = document.getElementById('todoInput');
    this.listeTodos = document.getElementById('todoList');
    this.statsTotal = document.getElementById('totalTasks');
    this.statsCompletes = document.getElementById('completedTasks');
    this.statsEnCours = document.getElementById('pendingTasks');
    
    this.initialiser();
  }
  
  initialiser() {
    this.formulaire.addEventListener('submit', (e) => this.ajouterTodo(e));
    this.afficherTodos();
    this.mettreAJourStats();
  }
  
  ajouterTodo(event) {
    event.preventDefault();
    
    const texte = this.champSaisie.value.trim();
    if (texte === '') return;
    
    const nouvelleTodo = {
      id: Date.now(),
      text: texte,
      completed: false,
      createdAt: new Date()
    };
    
    this.todos.push(nouvelleTodo);
    this.champSaisie.value = '';
    this.sauvegarderTodos();
    this.afficherTodos();
    this.mettreAJourStats();
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.sauvegarderTodos();
      this.afficherTodos();
      this.mettreAJourStats();
    }
  }
  
  supprimerTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.sauvegarderTodos();
    this.afficherTodos();
    this.mettreAJourStats();
  }
  
  creerElementTodo(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    div.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''} 
             onchange="app.toggleTodo(${todo.id})">
      <span class="todo-text">${todo.text}</span>
      <div class="todo-actions">
        <button class="btn btn-danger" onclick="app.supprimerTodo(${todo.id})">
          Supprimer
        </button>
      </div>
    `;
    
    return div;
  }
  
  afficherTodos() {
    this.listeTodos.innerHTML = '';
    this.todos.forEach(todo => {
      this.listeTodos.appendChild(this.creerElementTodo(todo));
    });
  }
  
  mettreAJourStats() {
    const total = this.todos.length;
    const completes = this.todos.filter(t => t.completed).length;
    const enCours = total - completes;
    
    this.statsTotal.textContent = total;
    this.statsCompletes.textContent = completes;
    this.statsEnCours.textContent = enCours;
  }
  
  sauvegarderTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
  
  chargerTodos() {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos) : [];
  }
  
  // Méthodes utilitaires
  supprimerToutesCompletees() {
    this.todos = this.todos.filter(t => !t.completed);
    this.sauvegarderTodos();
    this.afficherTodos();
    this.mettreAJourStats();
  }
  
  marquerToutesCompletes() {
    this.todos.forEach(t => t.completed = true);
    this.sauvegarderTodos();
    this.afficherTodos();
    this.mettreAJourStats();
  }
}

// Initialisation de l'application
const app = new TodoApp();

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault();
    app.marquerToutesCompletes();
  }
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    app.supprimerToutesCompletees();
  }
});