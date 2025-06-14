function testStudentGrades() {
  return [
    { name: "Moyenne calculée", pass: typeof moyenne === 'number' },
    { name: "Notes excellentes trouvées", pass: Array.isArray(excellentes) },
    { name: "Conversion en lettres", pass: Array.isArray(lettres) }
  ];
}
return testStudentGrades();
