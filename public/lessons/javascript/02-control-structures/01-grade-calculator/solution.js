let note = 85;
let lettre;

if (note >= 90) {
  lettre = "A";
} else if (note >= 80) {
  lettre = "B";
} else if (note >= 70) {
  lettre = "C";
} else if (note >= 60) {
  lettre = "D";
} else {
  lettre = "F";
}

console.log("Note:", note, "-> Lettre:", lettre);

// Version avec fonction
function convertirNote(note) {
  if (note >= 90) return "A";
  if (note >= 80) return "B";
  if (note >= 70) return "C";
  if (note >= 60) return "D";
  return "F";
}

// Test avec plusieurs notes
[95, 87, 73, 65, 42].forEach(n => {
  console.log(`Note ${n} = ${convertirNote(n)}`);
});