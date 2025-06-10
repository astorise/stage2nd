// Sélection des éléments
let boutonRouge = document.getElementById('rouge');
let boutonVert = document.getElementById('vert');
let boutonBleu = document.getElementById('bleu');
let boutonAleatoire = document.getElementById('aleatoire');

// Fonction pour changer la couleur de fond
function changerCouleur(couleur) {
  document.body.style.backgroundColor = couleur;
}

// Fonction pour générer une couleur aléatoire
function couleurAleatoire() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// Ajout des événements
boutonRouge.addEventListener('click', () => changerCouleur('red'));
boutonVert.addEventListener('click', () => changerCouleur('green'));
boutonBleu.addEventListener('click', () => changerCouleur('blue'));
boutonAleatoire.addEventListener('click', () => {
  changerCouleur(couleurAleatoire());
});