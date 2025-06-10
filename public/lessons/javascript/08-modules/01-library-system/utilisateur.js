export class Utilisateur {
  constructor(nom, id) {
    this.nom = nom;
    this.id = id;
    this.livresEmpruntes = [];
  }
  
  emprunterLivre(livre) {
    if (livre.emprunter()) {
      this.livresEmpruntes.push(livre);
      return true;
    }
    return false;
  }
  
  retournerLivre(isbn) {
    let index = this.livresEmpruntes.findIndex(livre => livre.isbn === isbn);
    if (index !== -1) {
      let livre = this.livresEmpruntes[index];
      livre.retourner();
      this.livresEmpruntes.splice(index, 1);
      return true;
    }
    return false;
  }
}