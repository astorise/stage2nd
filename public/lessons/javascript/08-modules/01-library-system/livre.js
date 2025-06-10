// Classe Livre avec propriétés : titre, auteur, isbn, disponible
// Méthodes : emprunter(), retourner()

export class Livre {
  constructor(titre, auteur, isbn) {
    this.titre = titre;
    this.auteur = auteur;
    this.isbn = isbn;
    this.disponible = true;
  }
  
  emprunter() {
    if (this.disponible) {
      this.disponible = false;
      return true;
    }
    return false;
  }
  
  retourner() {
    this.disponible = true;
  }
  
  get infos() {
    return `"${this.titre}" par ${this.auteur}`;
  }
}