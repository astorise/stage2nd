// Simulateurs d'API météo
function obtenirCoordonnees(ville) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const coordonnees = {
        'Paris': { lat: 48.8566, lon: 2.3522 },
        'Londres': { lat: 51.5074, lon: -0.1278 },
        'Tokyo': { lat: 35.6762, lon: 139.6503 },
        'New York': { lat: 40.7128, lon: -74.0060 },
        'Sydney': { lat: -33.8688, lon: 151.2093 }
      };
      
      if (coordonnees[ville]) {
        resolve(coordonnees[ville]);
      } else {
        reject('Ville non trouvée');
      }
    }, 500);
  });
}

function obtenirMeteo(lat, lon) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const temperature = Math.floor(Math.random() * 30) + 5;
      const conditions = ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Neigeux'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      resolve({
        temperature: temperature,
        condition: condition,
        humidite: Math.floor(Math.random() * 100),
        vent: Math.floor(Math.random() * 50),
        pression: Math.floor(Math.random() * 100) + 1000,
        visibilite: Math.floor(Math.random() * 20) + 5
      });
    }, 800);
  });
}

// Créez une fonction async obtenirMeteoComplete(ville)
// qui utilise les deux fonctions ci-dessus

async function obtenirMeteoComplete(ville) {
  // Votre code ici
}

// Testez votre fonction
obtenirMeteoComplete('Paris');