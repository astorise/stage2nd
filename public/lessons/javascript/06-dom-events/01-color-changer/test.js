function testColorChanger() {
  return [
    { name: "Boutons existent", pass: document.getElementById('rouge') !== null },
    { name: "Fonction changerCouleur existe", pass: typeof changerCouleur === 'function' }
  ];
}
return testColorChanger();
