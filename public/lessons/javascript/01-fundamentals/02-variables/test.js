function testVariables() {
  return [
    { name: "Variable prenom définie", pass: typeof prenom !== 'undefined' },
    { name: "Variable age est un number", pass: typeof age === 'number' },
    { name: "Variable aimeProgrammer est un boolean", pass: typeof aimeProgrammer === 'boolean' },
    { name: "Variable ville est un string", pass: typeof ville === 'string' }
  ];
}
return testVariables();
