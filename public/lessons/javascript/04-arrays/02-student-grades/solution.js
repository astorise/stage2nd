let notes = [85, 92, 78, 96, 87, 73, 89, 94, 76, 88];

// 1. Moyenne
let moyenne = notes.reduce((acc, note) => acc + note, 0) / notes.length;
console.log("Moyenne:", moyenne.toFixed(2));

// 2. Notes excellentes (>= 90)
let excellentes = notes.filter(note => note >= 90);
console.log("Notes excellentes:", excellentes);

// 3. Tous >= 70 ?
let tousPassent = notes.every(note => note >= 70);
console.log("Tous passent (>= 70):", tousPassent);

// 4. Conversion en lettres
let lettres = notes.map(note => {
  if (note >= 90) return 'A';
  if (note >= 80) return 'B';
  if (note >= 70) return 'C';
  if (note >= 60) return 'D';
  return 'F';
});
console.log("Notes en lettres:", lettres);

// Analyse complète
const analyseNotes = {
  notes: notes,
  
  get statistiques() {
    return {
      moyenne: this.notes.reduce((a, b) => a + b) / this.notes.length,
      min: Math.min(...this.notes),
      max: Math.max(...this.notes),
      excellentes: this.notes.filter(n => n >= 90).length,
      echecs: this.notes.filter(n => n < 70).length
    };
  },
  
  distribuerLettres() {
    return this.notes.map((note, index) => ({
      etudiant: `Étudiant ${index + 1}`,
      note: note,
      lettre: this.convertirEnLettre(note)
    }));
  },
  
  convertirEnLettre(note) {
    if (note >= 90) return 'A';
    if (note >= 80) return 'B';
    if (note >= 70) return 'C';
    if (note >= 60) return 'D';
    return 'F';
  }
};

console.log("\\nStatistiques:", analyseNotes.statistiques);
console.log("Distribution:", analyseNotes.distribuerLettres());