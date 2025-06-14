function testTimerApp() {
  return [
    { name: "Fonction minuteur existe", pass: typeof minuteur === 'function' },
    { name: "Application Timer créée", pass: typeof app !== 'undefined' },
    { name: "Interface utilisateur", pass: document.getElementById('display') !== null }
  ];
}
return testTimerApp();
