function testCalculatrice() {
  return [
    { name: "Addition correcte", pass: addition === 16 },
    { name: "Soustraction correcte", pass: soustraction === 8 },
    { name: "Multiplication correcte", pass: multiplication === 48 },
    { name: "Division correcte", pass: division === 3 }
  ];
}