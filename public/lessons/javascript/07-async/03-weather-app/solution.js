class WeatherApp {
  constructor() {
    this.form = document.getElementById('searchForm');
    this.input = document.getElementById('cityInput');
    this.searchBtn = document.getElementById('searchBtn');
    this.searchText = document.getElementById('searchText');
    this.searchSpinner = document.getElementById('searchSpinner');
    this.result = document.getElementById('weatherResult');
    
    this.initialiser();
  }
  
  initialiser() {
    this.form.addEventListener('submit', (e) => this.gererRecherche(e));
    this.rechercherVille('Paris'); // Ville par défaut
  }
  
  async gererRecherche(event) {
    event.preventDefault();
    const ville = this.input.value.trim();
    if (ville) {
      await this.rechercherVille(ville);
    }
  }
  
  async rechercherVille(ville) {
    this.afficherChargement();
    
    try {
      const meteoComplete = await this.obtenirMeteoComplete(ville);
      this.afficherMeteo(ville, meteoComplete);
    } catch (erreur) {
      this.afficherErreur(erreur);
    } finally {
      this.masquerChargement();
    }
  }
  
  async obtenirMeteoComplete(ville) {
    try {
      console.log(`🔍 Recherche de la météo pour ${ville}...`);
      
      // Étape 1: Obtenir les coordonnées
      let coordonnees = await obtenirCoordonnees(ville);
      console.log(`📍 Coordonnées trouvées: ${coordonnees.lat}, ${coordonnees.lon}`);
      
      // Étape 2: Obtenir la météo
      let meteo = await obtenirMeteo(coordonnees.lat, coordonnees.lon);
      
      // Étape 3: Formater le résultat
      let resultat = {
        ville: ville,
        coordonnees: coordonnees,
        meteo: meteo,
        resume: `À ${ville}, il fait ${meteo.temperature}°C avec un temps ${meteo.condition}`
      };
      
      console.log(resultat.resume);
      return resultat;
      
    } catch (erreur) {
      console.log(`❌ Erreur lors de l'obtention de la météo pour ${ville}:`, erreur);
      throw erreur;
    }
  }
  
  afficherMeteo(ville, data) {
    const { meteo } = data;
    const iconesConditions = {
      'Ensoleillé': '☀️',
      'Nuageux': '☁️',
      'Pluvieux': '🌧️',
      'Neigeux': '❄️'
    };
    
    this.result.innerHTML = `
      <div class="weather-card">
        <h2>📍 ${ville}</h2>
        
        <div class="weather-main">
          <div>
            <div class="weather-temp">${meteo.temperature}°C</div>
            <div class="weather-condition">
              ${iconesConditions[meteo.condition] || '🌤️'} ${meteo.condition}
            </div>
          </div>
        </div>
        
        <div class="weather-details">
          <div class="weather-detail">
            <div class="weather-detail-label">💧 Humidité</div>
            <div class="weather-detail-value">${meteo.humidite}%</div>
          </div>
          
          <div class="weather-detail">
            <div class="weather-detail-label">💨 Vent</div>
            <div class="weather-detail-value">${meteo.vent} km/h</div>
          </div>
          
          <div class="weather-detail">
            <div class="weather-detail-label">🌡️ Pression</div>
            <div class="weather-detail-value">${meteo.pression} hPa</div>
          </div>
          
          <div class="weather-detail">
            <div class="weather-detail-label">👁️ Visibilité</div>
            <div class="weather-detail-value">${meteo.visibilite} km</div>
          </div>
        </div>
        
        <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
          Dernière mise à jour: ${new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
    `;
  }
  
  afficherErreur(erreur) {
    this.result.innerHTML = `
      <div class="error">
        <h3>❌ Erreur</h3>
        <p>\${erreur}</p>
        <p>Vérifiez l'orthographe de la ville ou essayez une autre ville.</p>
      </div>
    `;
  }
  
  afficherChargement() {
    this.searchBtn.disabled = true;
    this.searchText.classList.add('hidden');
    this.searchSpinner.classList.remove('hidden');
    
    this.result.innerHTML = `
      <div class="loading">
        <div class="spinner" style="width: 40px; height: 40px; margin-bottom: 20px;"></div>
        <p>Récupération des données météo...</p>
      </div>
    `;
  }
  
  masquerChargement() {
    this.searchBtn.disabled = false;
    this.searchText.classList.remove('hidden');
    this.searchSpinner.classList.add('hidden');
  }
}

// Fonction standalone pour l'exercice
async function obtenirMeteoComplete(ville) {
  try {
    console.log(`🔍 Recherche de la météo pour ${ville}...`);
    
    // Étape 1: Obtenir les coordonnées
    let coordonnees = await obtenirCoordonnees(ville);
    console.log(`📍 Coordonnées trouvées: ${coordonnees.lat}, ${coordonnees.lon}`);
    
    // Étape 2: Obtenir la météo
    let meteo = await obtenirMeteo(coordonnees.lat, coordonnees.lon);
    
    // Étape 3: Formater le résultat
    let resultat = {
      ville: ville,
      coordonnees: coordonnees,
      meteo: meteo,
      resume: `À ${ville}, il fait ${meteo.temperature}°C avec un temps ${meteo.condition}`
    };
    
    console.log(resultat.resume);
    return resultat;
    
  } catch (erreur) {
    console.log(`❌ Erreur lors de l'obtention de la météo pour ${ville}:`, erreur);
    throw erreur;
  }
}

// Fonction pour obtenir la météo de plusieurs villes
async function obtenirMeteoMultiple(villes) {
  try {
    let promessesMeteo = villes.map(ville => obtenirMeteoComplete(ville));
    let resultats = await Promise.all(promessesMeteo);
    
    console.log('🌍 Météo de toutes les villes:');
    resultats.forEach(resultat => {
      console.log(resultat.resume);
    });
    
    return resultats;
  } catch (erreur) {
    console.log('❌ Erreur lors de l\'obtention de la météo multiple:', erreur);
  }
}

// Initialisation
const app = new WeatherApp();

// Tests en console
setTimeout(() => {
  console.log('\n🧪 Test des fonctions météo...');
  obtenirMeteoComplete('Londres');
}, 2000);

setTimeout(() => {
  obtenirMeteoMultiple(['Paris', 'Tokyo', 'Sydney']);
}, 5000);