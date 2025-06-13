function testTodoApp() {
  return [
    { name: "Application initialisée", pass: typeof app !== 'undefined' },
    { name: "Méthode ajouterTodo existe", pass: typeof app.ajouterTodo === 'function' },
    { name: "Interface créée", pass: document.getElementById('todoList') !== null }
  ];
}