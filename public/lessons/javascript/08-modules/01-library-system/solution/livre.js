export class Livre {
  constructor(titre, auteur, isbn) {
    this.titre = titre;
    this.auteur = auteur;
    this.isbn = isbn;
    this.disponible = true;
    this.dateEmprunt = null;
    this.empruntePar = null;
  }
  
  emprunter(utilisateur = null) {
    if (this.disponible) {
      this.disponible = false;
      this.dateEmprunt = new Date();
      this.empruntePar = utilisateur;
      return true;
    }
    return false;
  }
  
  retourner() {
    this.disponible = true;
    this.dateEmprunt = null;
    this.empruntePar = null;
  }
  
  get infos() {
    return `"${this.titre}" par ${this.auteur} (${this.isbn})`;
  }
  
  get statut() {
    if (this.disponible) {
      return 'Disponible';
    } else {
      const joursEmprunt = Math.floor((new Date() - this.dateEmprunt) / (1000 * 60 * 60 * 24));
      return `Emprunté depuis ${joursEmprunt} jour(s)`;
    }
  }
  
  // Méthode pour vérifier si le livre est en retard
  estEnRetard(joursLimite = 30) {
    if (this.disponible) return false;
    const joursEmprunt = Math.floor((new Date() - this.dateEmprunt) / (1000 * 60 * 60 * 24));
    return joursEmprunt > joursLimite;
  }
}

// Export par défaut d'une fonction utilitaire
export default function creerLivre(titre, auteur, isbn) {
  return new Livre(titre, auteur, isbn);
}