function additionner(a, b) {
  return a + b;
}

function soustraire(a, b) {
  return a - b;
}

function multiplier(a, b) {
  return a * b;
}

function diviser(a, b) {
  if (b !== 0) {
    return a / b;
  } else {
    return "Erreur: Division par zéro";
  }
}

// Tests
console.log("Addition:", additionner(10, 5));
console.log("Soustraction:", soustraire(10, 5));
console.log("Multiplication:", multiplier(10, 5));
console.log("Division:", diviser(10, 5));
console.log("Division par zéro:", diviser(10, 0));

// Version calculatrice complète
function calculatrice(operation, a, b) {
  switch(operation) {
    case '+': return additionner(a, b);
    case '-': return soustraire(a, b);
    case '*': return multiplier(a, b);
    case '/': return diviser(a, b);
    default: return "Opération non reconnue";
  }
}

console.log("Calculatrice:", calculatrice('+', 15, 25));