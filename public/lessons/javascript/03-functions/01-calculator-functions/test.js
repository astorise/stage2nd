function testCalculatorFunctions() {
  return [
    { name: "Addition fonctionne", pass: additionner(2, 3) === 5 },
    { name: "Soustraction fonctionne", pass: soustraire(10, 4) === 6 },
    { name: "Multiplication existe", pass: typeof multiplier === 'function' },
    { name: "Division gère zéro", pass: diviser(10, 0).includes('Erreur') }
  ];
}