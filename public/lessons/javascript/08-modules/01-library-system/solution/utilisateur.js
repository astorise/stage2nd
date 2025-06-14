export class Utilisateur {
  constructor(nom, id) {
    this.nom = nom;
    this.id = id;
    this.livresEmpruntes = [];
    this.dateInscription = new Date();
    this.historiqueEmprunts = [];
  }
  
  emprunterLivre(livre, bibliotheque) {
    // Vérifications
    if (!livre.disponible) {
      console.log(`❌ Le livre "${livre.titre}" n'est pas disponible`);
      return false;
    }
    
    if (this.livresEmpruntes.length >= 5) {
      console.log(`❌ ${this.nom} a atteint la limite de 5 livres empruntés`);
      return false;
    }
    
    if (this.aDejaEmprunte(livre.isbn)) {
      console.log(`❌ ${this.nom} a déjà emprunté ce livre`);
      return false;
    }
    
    // Effectuer l'emprunt
    if (livre.emprunter(this)) {
      this.livresEmpruntes.push(livre);
      this.historiqueEmprunts.push({
        isbn: livre.isbn,
        titre: livre.titre,
        dateEmprunt: new Date(),
        statut: 'emprunte'
      });
      
      // Enregistrer dans la bibliothèque
      if (bibliotheque) {
        bibliotheque.enregistrerEmprunt(livre, this);
      }
      
      console.log(`✅ ${this.nom} a emprunté "${livre.titre}"`);

    }
}
}