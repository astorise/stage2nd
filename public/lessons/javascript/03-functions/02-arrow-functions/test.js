function testArrowFunctions() {
  return [
    { name: "calculerAire est une arrow function", pass: calculerAire.toString().includes('=>') },
    { name: "estPair fonctionne", pass: estPair(6) === true },
    { name: "majuscules fonctionne", pass: majuscules("test") === "TEST" }
  ];
}