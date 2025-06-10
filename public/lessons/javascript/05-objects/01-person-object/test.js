function testPersonObject() {
  return [
    { name: "Objet etudiant existe", pass: typeof etudiant === 'object' },
    { name: "Méthode ajouterNote existe", pass: typeof etudiant.ajouterNote === 'function' },
    { name: "Méthode calculerMoyenne existe", pass: typeof etudiant.calculerMoyenne === 'function' }
  ];
}