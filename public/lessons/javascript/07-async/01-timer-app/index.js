// Créez une fonction minuteur qui :
// - Prend une durée en secondes
// - Un callback à exécuter chaque seconde
// - Un callback à exécuter à la fin

function minuteur(duree, chaqueSeconde, termine) {
  // Votre code ici
}

// Test du minuteur
minuteur(5, 
  function(tempsRestant) {
    console.log('Temps restant :', tempsRestant);
  },
  function() {
    console.log('Temps écoulé !');
  }
);