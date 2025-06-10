function minuteur(duree, chaqueSeconde, termine) {
  let tempsRestant = duree;
  
  let interval = setInterval(function() {
    chaqueSeconde(tempsRestant);
    tempsRestant--;
    
    if (tempsRestant < 0) {
      clearInterval(interval);
      termine();
    }
  }, 1000);
}

// Version améliorée avec contrôles
function minuteurAvance(duree) {
  let tempsRestant = duree;
  let interval;
  let callbacks = {
    tick: null,
    finish: null
  };
  
  return {
    demarrer: function() {
      interval = setInterval(() => {
        if (callbacks.tick) callbacks.tick(tempsRestant);
        tempsRestant--;
        
        if (tempsRestant < 0) {
          clearInterval(interval);
          if (callbacks.finish) callbacks.finish();
        }
      }, 1000);
    },
    
    arreter: function() {
      clearInterval(interval);
    },
    
    onTick: function(callback) {
      callbacks.tick = callback;
    },
    
    onFinish: function(callback) {
      callbacks.finish = callback;
    }
  };
}