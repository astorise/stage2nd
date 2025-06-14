// Base de données simulée
const utilisateurs = {
  1: { id: 1, nom: 'Alice', email: 'alice@email.com' },
  2: { id: 2, nom: 'Bob', email: 'bob@email.com' }
};

const commandes = {
  1: [
    { id: 101, userId: 1, produit: 'Laptop', prix: 999 },
    { id: 102, userId: 1, produit: 'Souris', prix: 25 }
  ],
  2: [
    { id: 103, userId: 2, produit: 'Clavier', prix: 75 }
  ]
};

const detailsCommandes = {
  101: { id: 101, statut: 'livré', date: '2025-01-15', adresse: '123 Rue de la Paix' },
  102: { id: 102, statut: 'en cours', date: '2025-01-20', adresse: '123 Rue de la Paix' },
  103: { id: 103, statut: 'expédié', date: '2025-01-18', adresse: '456 Avenue des Champs' }
};

function obtenirUtilisateur(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const utilisateur = utilisateurs[id];
      if (utilisateur) {
        console.log(`✅ Utilisateur ${id} trouvé`);
        resolve(utilisateur);
      } else {
        console.log(`❌ Utilisateur ${id} non trouvé`);
        reject('Utilisateur non trouvé');
      }
    }, 500);
  });
}

function obtenirCommandes(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const commandesUser = commandes[userId];
      if (commandesUser) {
        console.log(`✅ ${commandesUser.length} commande(s) trouvée(s) pour l'utilisateur ${userId}`);
        resolve(commandesUser);
      } else {
        console.log(`❌ Aucune commande pour l'utilisateur ${userId}`);
        reject('Aucune commande trouvée');
      }
    }, 700);
  });
}

function obtenirDetails(commandeId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const details = detailsCommandes[commandeId];
      if (details) {
        console.log(`✅ Détails de la commande ${commandeId} trouvés`);
        resolve(details);
      } else {
        console.log(`❌ Détails de la commande ${commandeId} non trouvés`);
        reject('Détails de commande non trouvés');
      }
    }, 300);
  });
}

// Test du chaînage avec Promises
console.log('🔄 Début du test avec Promises...');
obtenirUtilisateur(1)
  .then(utilisateur => {
    console.log('👤 Utilisateur:', utilisateur);
    return obtenirCommandes(utilisateur.id);
  })
  .then(commandesUser => {
    console.log('🛒 Commandes:', commandesUser);
    return obtenirDetails(commandesUser[0].id);
  })
  .then(details => {
    console.log('📦 Détails de la première commande:', details);
  })
  .catch(erreur => {
    console.log('💥 Erreur:', erreur);
  })
  .finally(() => {
    console.log('✨ Test terminé');
  });

/*
// Version avec async/await
async function testAvecAsyncAwait() {
  try {
    console.


*/