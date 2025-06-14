import { Livre } from './livre.js';

export class Bibliotheque {
  constructor(nom) {
    this.nom = nom;
    this.livres = [];
    this.historiqueEmprunts = [];
  }
  
  ajouterLivre(titre, auteur, isbn) {
    // Vérifier si le livre existe déjà
    if (this.obtenirLivreParIsbn(isbn)) {
      throw new Error(`Un livre avec l'ISBN ${isbn} existe déjà`);
    }
    
    let livre = new Livre(titre, auteur, isbn);
    this.livres.push(livre);
    console.log(`📚 Livre ajouté: ${livre.infos}`);
    return livre;
  }
  
  rechercherLivre(critere, valeur) {
    const critereNormalise = critere.toLowerCase();
    const valeurNormalisee = valeur.toLowerCase();
    
    return this.livres.filter(livre => {
      switch (critereNormalise) {
        case 'titre':
          return livre.titre.toLowerCase().includes(valeurNormalisee);
        case 'auteur':
          return livre.auteur.toLowerCase().includes(valeurNormalisee);
        case 'isbn':
          return livre.isbn.toLowerCase().includes(valeurNormalisee);
        default:
          // Recherche globale
          return livre.titre.toLowerCase().includes(valeurNormalisee) ||
                 livre.auteur.toLowerCase().includes(valeurNormalisee) ||
                 livre.isbn.toLowerCase().includes(valeurNormalisee);
      }
    });
  }
  
  listerLivres(disponiblesSeuls = false) {
    let livres = disponiblesSeuls ? 
      this.livres.filter(livre => livre.disponible) : 
      this.livres;
      
    return livres.map(livre => ({
      titre: livre.titre,
      auteur: livre.auteur,
      isbn: livre.isbn,
      statut: livre.statut,
      disponible: livre.disponible
    }));
  }
  
  obtenirLivreParIsbn(isbn) {
    return this.livres.find(livre => livre.isbn === isbn);
  }
  
  // Statistiques de la bibliothèque
  get statistiques() {
    const total = this.livres.length;
    const disponibles = this.livres.filter(l => l.disponible).length;
    const empruntes = total - disponibles;
    const enRetard = this.livres.filter(l => l.estEnRetard()).length;
    
    return {
      total,
      disponibles,
      empruntes,
      enRetard,
      tauxOccupation: total > 0 ? Math.round((empruntes / total) * 100) : 0
    };
  }
  
  // Gestion des emprunts
  enregistrerEmprunt(livre, utilisateur) {
    this.historiqueEmprunts.push({
      livre: livre.isbn,
      utilisateur: utilisateur.id,
      dateEmprunt: new Date(),
      type: 'emprunt'
    });
  }
  
  enregistrerRetour(livre, utilisateur) {
    this.historiqueEmprunts.push({
      livre: livre.isbn,
      utilisateur: utilisateur.id,
      dateRetour: new Date(),
      type: 'retour'
    });
  }
  
  // Méthode pour obtenir les livres en retard
  obtenirLivresEnRetard() {
    return this.livres.filter(livre => livre.estEnRetard());
  }
  
  // Rapport d'activité
  genererRapport() {
    const stats = this.statistiques;
    const livresEnRetard = this.obtenirLivresEnRetard();
    
    return {
      bibliotheque: this.nom,
      statistiques: stats,
      livresEnRetard: livresEnRetard.map(l => ({
        titre: l.titre,
        empruntePar: l.empruntePar?.nom || 'Inconnu',
        joursRetard: Math.floor((new Date() - l.dateEmprunt) / (1000 * 60 * 60 * 24)) - 30
      })),
      dateRapport: new Date()
    };
  }
}