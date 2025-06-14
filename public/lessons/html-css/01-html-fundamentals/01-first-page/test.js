function testPremierePage() {
  return [
    { name: "Document a un title", pass: document.title.length > 0 },
    { name: "Contient un h1", pass: document.querySelector('h1') !== null },
    { name: "Au moins 2 paragraphes", pass: document.querySelectorAll('p').length >= 2 },
    { name: "Utilise strong", pass: document.querySelector('strong') !== null }
  ];
}
return testPremierePage();
