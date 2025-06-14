// Tests automatisés
function testPremierProgramme() {
  // Capture la sortie console
  let output = '';
  const originalLog = console.log;
  console.log = (message) => output += message;
  
  // Exécute le code étudiant
  require('./index.js');
  
  // Restaure console.log
  console.log = originalLog;
  
  // Tests
  const tests = [
    {
      name: "Affiche un message",
      pass: output.length > 0
    },
    {
      name: "Contient un nom",
      pass: output.includes('nom') || output.includes('appelle') || output.includes('suis')
    }
  ];
  
  return tests;
}
return testPremierProgramme();
