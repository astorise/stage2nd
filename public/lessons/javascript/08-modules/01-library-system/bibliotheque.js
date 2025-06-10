import { Livre } from './livre.js';

export class Bibliotheque {
  constructor(nom) {
    this.nom = nom;
    this.livres = [];
  }
  
  ajouterLivre(titre, auteur, isbn) {
    let livre = new Livre(titre, auteur, isbn);
    this.livres.push(livre);
    return livre;
  }
  
  rechercherLivre(critere, valeur) {
    return this.livres.filter(livre => 
      livre[critere] && livre[critere].toLowerCase().includes(valeur.toLowerCase())
    );
  }
  
  listerLivres(disponiblesSeuls = false) {
    return disponiblesSeuls ? 
      this.livres.filter(livre => livre.disponible) : 
      this.livres;
  }
}