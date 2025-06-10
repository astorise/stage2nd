let etudiant = {
  nom: "Dupont",
  prenom: "Jean",
  age: 20,
  notes: [15, 18, 12, 16],
  
  ajouterNote: function(note) {
    this.notes.push(note);
  },
  
  calculerMoyenne: function() {
    if (this.notes.length === 0) return 0;
    let somme = this.notes.reduce((acc, note) => acc + note, 0);
    return somme / this.notes.length;
  },
  
  sePresenter: function() {
    return this.prenom + " " + this.nom + ", " + this.age + " ans";
  }
};

console.log(etudiant.sePresenter());
etudiant.ajouterNote(14);
console.log("Moyenne:", etudiant.calculerMoyenne());