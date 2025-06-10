let listeCourses = [];

// Ajout d'articles
listeCourses.push("pain");
listeCourses.push("lait");
listeCourses.push("œufs");

console.log("Liste initiale:", listeCourses);
console.log("Nombre d'articles:", listeCourses.length);

// Retirer le dernier
let dernierArticle = listeCourses.pop();
console.log("Article retiré:", dernierArticle);

// Ajouter au début
listeCourses.unshift("fromage");

console.log("Liste finale:", listeCourses);