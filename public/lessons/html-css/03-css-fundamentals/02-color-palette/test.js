function testColorPalette() {
  return [
    { name: "Classe rouge existe", pass: document.querySelector('.rouge') !== null },
    { name: "Classe bleu existe", pass: document.querySelector('.bleu') !== null },
    { name: "Au moins 5 couleurs", pass: document.querySelectorAll('.color-box').length >= 5 },
    { name: "Border-radius appliqué", pass: getComputedStyle(document.querySelector('.color-box')).borderRadius !== '0px' }
  ];
}