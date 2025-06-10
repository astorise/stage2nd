import { Bibliotheque } from './bibliotheque.js';
import { Utilisateur } from './utilisateur.js';

// Création de la bibliothèque
let biblio = new Bibliotheque('Bibliothèque Centrale');

// Ajout de livres
biblio.ajouterLivre('1984', 'George Orwell', '978-0-452-28423-4');
biblio.ajouterLivre('Le Petit Prince', 'Antoine de Saint-Exupéry', '978-2-07-040850-8');

// Création d'utilisateurs
let alice = new Utilisateur('Alice', 'U001');

// Test d'emprunt
let livre1984 = biblio.livres[0];
alice.emprunterLivre(livre1984);

console.log('Système de bibliothèque initialisé !');