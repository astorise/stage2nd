function testShoppingList() {
  return [
    { name: "Liste créée", pass: Array.isArray(listeCourses) },
    { name: "Articles ajoutés", pass: listeCourses.length > 0 }
  ];
}
return testShoppingList();
