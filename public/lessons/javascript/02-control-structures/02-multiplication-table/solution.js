let nombre = 7;

console.log("Table de multiplication de " + nombre + ":");
for (let i = 1; i <= 10; i++) {
  let resultat = nombre * i;
  console.log(nombre + " x " + i + " = " + resultat);
}

// Version avec template literals
console.log(`\nTable de multiplication de ${nombre} (version moderne):`);
for (let i = 1; i <= 10; i++) {
  console.log(`${nombre} × ${i} = ${nombre * i}`);
}

// Version avec fonction réutilisable
function afficherTable(n, max = 10) {
  console.log(`\nTable de ${n}:`);
  for (let i = 1; i <= max; i++) {
    console.log(`${n} × ${i} = ${n * i}`);
  }
}

afficherTable(3);
afficherTable(12, 5);