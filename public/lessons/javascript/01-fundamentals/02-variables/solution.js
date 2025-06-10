let prenom = "Jean";
let age = 28;
let aimeProgrammer = true;
let ville = "Paris";

console.log("Prénom:", prenom);
console.log("Âge:", age);
console.log("Aime programmer:", aimeProgrammer);
console.log("Ville:", ville);

// Version avec template literals
console.log(`Je m'appelle ${prenom}, j'ai ${age} ans, j'habite à ${ville} et j'${aimeProgrammer ? 'aime' : 'aime pas'} programmer.`);