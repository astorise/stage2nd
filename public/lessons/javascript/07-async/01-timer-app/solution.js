class TimerApp {
  constructor() {
    this.dureeOriginale = 0;
    this.tempsRestant = 0;
    this.interval = null;
    this.enCours = false;
    this.enPause = false;
    
    this.display = document.getElementById('display');
    this.minutesInput = document.getElementById('minutes');
    this.secondsInput = document.getElementById('seconds');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.status = document.getElementById('status');
    
    this.initialiser();
  }
  
  initialiser() {
    this.startBtn.addEventListener('click', () => this.demarrer());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.stopBtn.addEventListener('click', () => this.arreter());
    
    this.minutesInput.addEventListener('change', () => this.mettreAJourAffichage());
    this.secondsInput.addEventListener('change', () => this.mettreAJourAffichage());
    
    this.mettreAJourAffichage();
  }
  
  demarrer() {
    if (!this.enCours) {
      const minutes = parseInt(this.minutesInput.value) || 0;
      const seconds = parseInt(this.secondsInput.value) || 0;
      this.dureeOriginale = minutes * 60 + seconds;
      this.tempsRestant = this.dureeOriginale;
    }
    
    if (this.tempsRestant <= 0) {
      this.status.textContent = "Définissez un temps valide";
      return;
    }
    
    this.enCours = true;
    this.enPause = false;
    this.status.textContent = "En cours...";
    
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
    
    this.mettreAJourBoutons();
  }
  
  tick() {
    this.tempsRestant--;
    this.mettreAJourAffichage();
    
    if (this.tempsRestant <= 0) {
      this.terminer();
    }
  }
  
  togglePause() {
    if (this.enPause) {
      this.demarrer();
    } else {
      this.pause();
    }
  }
  
  pause() {
    clearInterval(this.interval);
    this.enPause = true;
    this.status.textContent = "En pause";
    this.mettreAJourBoutons();
  }
  
  arreter() {
    clearInterval(this.interval);
    this.enCours = false;
    this.enPause = false;
    this.tempsRestant = 0;
    this.status.textContent = "Arrêté";
    this.mettreAJourAffichage();
    this.mettreAJourBoutons();
  }
  
  terminer() {
    clearInterval(this.interval);
    this.enCours = false;
    this.enPause = false;
    this.status.textContent = "Terminé !";
    this.jouerSon();
    this.mettreAJourBoutons();
    
    // Animation de fin
    this.display.style.animation = "pulse 1s infinite";
    setTimeout(() => {
      this.display.style.animation = "";
    }, 5000);
  }
  
  setTimer(minutes, seconds) {
    this.minutesInput.value = minutes;
    this.secondsInput.value = seconds;
    this.mettreAJourAffichage();
  }
  
  mettreAJourAffichage() {
    let temps;
    if (this.enCours || this.enPause) {
      temps = this.tempsRestant;
    } else {
      const minutes = parseInt(this.minutesInput.value) || 0;
      const seconds = parseInt(this.secondsInput.value) || 0;
      temps = minutes * 60 + seconds;
    }
    
    const minutesAff = Math.floor(temps / 60);
    const secondesAff = temps % 60;
    this.display.textContent = 
      `${minutesAff.toString().padStart(2, '0')}:${secondesAff.toString().padStart(2, '0')}`;
  }
  
  mettreAJourBoutons() {
    this.startBtn.textContent = this.enPause ? "Reprendre" : "Démarrer";
    this.startBtn.disabled = this.enCours && !this.enPause;
    this.pauseBtn.textContent = this.enPause ? "Reprendre" : "Pause";
    this.pauseBtn.disabled = !this.enCours;
  }
  
  jouerSon() {
    // Création d'un son simple avec Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  }
}

// Fonction minuteur simple (version callback)
function minuteur(duree, chaqueSeconde, termine) {
  let tempsRestant = duree;
  
  const interval = setInterval(function() {
    chaqueSeconde(tempsRestant);
    tempsRestant--;
    
    if (tempsRestant < 0) {
      clearInterval(interval);
      termine();
    }
  }, 1000);
  
  return {
    arreter: () => clearInterval(interval)
  };
}

// Initialisation
const app = new TimerApp();

// Style pour l'animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);