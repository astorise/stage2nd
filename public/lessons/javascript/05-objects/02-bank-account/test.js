function testBankAccount() {
  return [
    { name: "Classe CompteBancaire existe", pass: typeof CompteBancaire === 'function' },
    { name: "Instance créée", pass: compte instanceof CompteBancaire },
    { name: "Méthode deposer existe", pass: typeof compte.deposer === 'function' }
  ];
}