class CompteBancaire {
  constructor(numero, titulaire, soldeInitial = 0) {
    this.numero = numero;
    this.titulaire = titulaire;
    this.solde = soldeInitial;
    this.historique = [];
  }
  
  deposer(montant) {
    if (montant > 0) {
      this.solde += montant;
      this.historique.push({
        type: 'depot',
        montant: montant,
        date: new Date(),
        soldeApres: this.solde
      });
      console.log("Dépôt de " + montant + "€. Nouveau solde: " + this.solde + "€");
    } else {
      console.log("Le montant doit être positif");
    }
  }
  
  retirer(montant) {
    if (montant > 0) {
      if (this.solde >= montant) {
        this.solde -= montant;
        this.historique.push({
          type: 'retrait',
          montant: montant,
          date: new Date(),
          soldeApres: this.solde
        });
        console.log("Retrait de " + montant + "€. Nouveau solde: " + this.solde + "€");
      } else {
        console.log("Solde insuffisant");
      }
    } else {
      console.log("Le montant doit être positif");
    }
  }
  
  consulterSolde() {
    console.log("Solde actuel: " + this.solde + "€");
    return this.solde;
  }
  
  get infos() {
    return "Compte " + this.numero + " - " + this.titulaire;
  }
  
  obtenirHistorique() {
    return this.historique;
  }
  
  // Méthode pour virement
  virer(montant, compteDestinataire) {
    if (this.solde >= montant && montant > 0) {
      this.retirer(montant);
      compteDestinataire.deposer(montant);
      console.log(`Virement de ${montant}€ vers ${compteDestinataire.titulaire}`);
    } else {
      console.log("Virement impossible");
    }
  }
}

// Test
let compte = new CompteBancaire("12345", "Jean Dupont", 1000);
console.log(compte.infos);
compte.deposer(500);
compte.retirer(200);
compte.consulterSolde();

// Test avec deux comptes
let compte2 = new CompteBancaire("67890", "Marie Martin", 500);
compte.virer(100, compte2);
console.log("\nSoldes finaux:");
compte.consulterSolde();
compte2.consulterSolde();