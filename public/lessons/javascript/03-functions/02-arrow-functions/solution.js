// Versions fonctions fléchées
const calculerAire = (longueur, largeur) => longueur * largeur;
const estPair = nombre => nombre % 2 === 0;
const majuscules = texte => texte.toUpperCase();

// Tests
console.log(calculerAire(5, 3)); // 15
console.log(estPair(4));         // true
console.log(majuscules("hello")); // HELLO

// Versions avec corps de fonction si logique plus complexe
const calculerAireAvecValidation = (longueur, largeur) => {
  if (longueur <= 0 || largeur <= 0) {
    return "Erreur: dimensions invalides";
  }
  return longueur * largeur;
};

const estPairAvecMessage = nombre => {
  const pair = nombre % 2 === 0;
  return `${nombre} est ${pair ? 'pair' : 'impair'}`;
};

console.log(calculerAireAvecValidation(5, 3));
console.log(estPairAvecMessage(7));