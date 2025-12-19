# Cahier de Recette - Party Planner Frontend

## Informations generales

| Information | Valeur |
|-------------|--------|
| Application | Party Planner |
| Version | 1.0.0 |
| Date | 2025-12-16 |
| Testeur | |
| Environnement | |

## Legende des statuts

| Statut | Description |
|--------|-------------|
| ✅ OK | Test reussi |
| ❌ KO | Test echoue |
| ⚠️ Partiel | Partiellement fonctionnel |
| ⏳ Non teste | En attente de test |
| N/A | Non applicable |

---

## 1. AUTHENTIFICATION

### 1.1 Inscription

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 1.1.1 | Acces page inscription | Acceder a `/register` | La page d'inscription s'affiche | ⏳ | |
| 1.1.2 | Inscription valide | Remplir tous les champs (nom, email, password, confirmation) et soumettre | Compte cree, redirection vers dashboard | ⏳ | |
| 1.1.3 | Email deja utilise | Utiliser un email existant | Message d'erreur "Email deja utilise" | ⏳ | |
| 1.1.4 | Mot de passe trop court | Saisir un mot de passe < 8 caracteres | Message d'erreur de validation | ⏳ | |
| 1.1.5 | Mots de passe non concordants | Saisir des mots de passe differents | Message d'erreur "Les mots de passe ne correspondent pas" | ⏳ | |
| 1.1.6 | Email invalide | Saisir un email mal formate | Message d'erreur "Email invalide" | ⏳ | |
| 1.1.7 | Champs obligatoires vides | Soumettre le formulaire vide | Messages d'erreur sur champs requis | ⏳ | |

### 1.2 Connexion

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 1.2.1 | Acces page connexion | Acceder a `/login` | La page de connexion s'affiche | ⏳ | |
| 1.2.2 | Connexion valide | Saisir email/password corrects | Connexion reussie, redirection vers dashboard | ⏳ | |
| 1.2.3 | Email incorrect | Saisir un email inexistant | Message d'erreur "Identifiants invalides" | ⏳ | |
| 1.2.4 | Mot de passe incorrect | Saisir un mauvais mot de passe | Message d'erreur "Identifiants invalides" | ⏳ | |
| 1.2.5 | Option "Se souvenir de moi" | Cocher l'option et se connecter | Session persistante apres fermeture navigateur | ⏳ | |
| 1.2.6 | Lien vers inscription | Cliquer sur "Pas encore de compte ?" | Redirection vers page inscription | ⏳ | |
| 1.2.7 | Lien mot de passe oublie | Cliquer sur "Mot de passe oublie" | Redirection vers page de recuperation | ⏳ | |

### 1.3 Deconnexion

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 1.3.1 | Deconnexion | Cliquer sur "Deconnexion" dans le sidebar | Session terminee, redirection vers login | ⏳ | |
| 1.3.2 | Acces protege apres deconnexion | Tenter d'acceder a `/dashboard` apres deconnexion | Redirection vers login | ⏳ | |

### 1.4 Mot de passe oublie

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 1.4.1 | Demande reinitialisation | Saisir email valide et soumettre | Message de confirmation, email envoye | ⏳ | |
| 1.4.2 | Email inexistant | Saisir email inexistant | Message d'erreur ou message generique | ⏳ | |
| 1.4.3 | Reinitialisation mot de passe | Cliquer lien email, saisir nouveau mot de passe | Mot de passe modifie, redirection login | ⏳ | |

---

## 2. NAVIGATION ET LAYOUT

### 2.1 Sidebar

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 2.1.1 | Affichage sidebar | Se connecter | Sidebar visible avec tous les menus | ⏳ | |
| 2.1.2 | Logo cliquable | Cliquer sur le logo | Redirection vers dashboard | ⏳ | |
| 2.1.3 | Menu actif | Naviguer entre les pages | Menu actif surligné | ⏳ | |
| 2.1.4 | Section Administration (admin) | Se connecter en tant qu'admin | Section "Administration" visible | ⏳ | |
| 2.1.5 | Section Administration (user) | Se connecter en tant qu'utilisateur normal | Section "Administration" non visible | ⏳ | |
| 2.1.6 | Traductions menus | Verifier tous les libelles | Tous les menus traduits correctement | ⏳ | |

### 2.2 Navigation generale

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 2.2.1 | Navigation Tableau de bord | Cliquer sur "Tableau de bord" | Page dashboard affichee | ⏳ | |
| 2.2.2 | Navigation Evenements | Cliquer sur "Mes evenements" | Liste des evenements affichee | ⏳ | |
| 2.2.3 | Navigation Collaborations | Cliquer sur "Collaborations" | Page collaborations affichee | ⏳ | |
| 2.2.4 | Navigation Invitations | Cliquer sur "Invitations" | Page invitations affichee | ⏳ | |
| 2.2.5 | Navigation Abonnements | Cliquer sur "Abonnements" | Page abonnements affichee | ⏳ | |
| 2.2.6 | Navigation Notifications | Cliquer sur "Notifications" | Page notifications affichee | ⏳ | |
| 2.2.7 | Navigation Profil | Cliquer sur "Mon profil" | Page profil affichee | ⏳ | |
| 2.2.8 | Navigation Parametres | Cliquer sur "Parametres" | Page parametres affichee | ⏳ | |

---

## 3. TABLEAU DE BORD (Dashboard)

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 3.1 | Affichage dashboard | Acceder a `/dashboard` | Page dashboard avec statistiques | ⏳ | |
| 3.2 | Statistiques evenements | Verifier le compteur evenements | Nombre correct d'evenements | ⏳ | |
| 3.3 | Statistiques invites | Verifier le compteur invites | Nombre correct d'invites confirmes | ⏳ | |
| 3.4 | Statistiques taches | Verifier le compteur taches | Nombre correct de taches en attente | ⏳ | |
| 3.5 | Statistiques budget | Verifier le total budget | Montant correct | ⏳ | |
| 3.6 | Evenements a venir | Verifier la liste | Evenements futurs affiches | ⏳ | |
| 3.7 | Taches urgentes | Verifier la liste | Taches prioritaires affichees | ⏳ | |
| 3.8 | Activite recente | Verifier la liste | Dernieres activites affichees | ⏳ | |

---

## 4. GESTION DES EVENEMENTS

### 4.1 Liste des evenements

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 4.1.1 | Affichage liste | Acceder a `/events` | Liste des evenements affichee | ⏳ | |
| 4.1.2 | Liste vide | Utilisateur sans evenement | Message "Aucun evenement" + bouton creer | ⏳ | |
| 4.1.3 | Bouton creer evenement | Cliquer sur "Creer un evenement" | Formulaire de creation affiche | ⏳ | |
| 4.1.4 | Affichage cartes evenements | Avoir des evenements | Cartes avec titre, date, type, statut | ⏳ | |
| 4.1.5 | Clic sur evenement | Cliquer sur une carte evenement | Redirection vers details evenement | ⏳ | |

### 4.2 Creation d'evenement

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 4.2.1 | Acces formulaire | Cliquer "Creer un evenement" | Formulaire avec tous les champs | ⏳ | |
| 4.2.2 | Champs obligatoires | Verifier les champs marques * | Titre, Type, Date sont obligatoires | ⏳ | |
| 4.2.3 | Selection type | Ouvrir le select "Type d'evenement" | 6 types disponibles (Mariage, Anniversaire, etc.) | ⏳ | |
| 4.2.4 | Selection date | Cliquer sur le champ date | Calendrier s'ouvre | ⏳ | |
| 4.2.5 | Champ heure | Saisir une heure | Format HH:MM accepte | ⏳ | |
| 4.2.6 | Champ lieu | Saisir un lieu | Texte libre accepte | ⏳ | |
| 4.2.7 | Champ description | Saisir une description | Texte multiligne accepte | ⏳ | |
| 4.2.8 | Champ nombre invites | Saisir un nombre | Nombre positif accepte | ⏳ | |
| 4.2.9 | Champ budget | Saisir un montant | Montant en FCFA accepte | ⏳ | |
| 4.2.10 | Champ theme | Saisir un theme | Texte libre accepte | ⏳ | |
| 4.2.11 | Creation valide | Remplir champs obligatoires et soumettre | Evenement cree, redirection vers details | ⏳ | |
| 4.2.12 | Validation titre vide | Soumettre sans titre | Message erreur "Le titre est requis" | ⏳ | |
| 4.2.13 | Validation date vide | Soumettre sans date | Message erreur "La date est requise" | ⏳ | |

### 4.3 Details d'un evenement

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 4.3.1 | Affichage details | Acceder a `/events/:id` | Page details avec toutes les infos | ⏳ | |
| 4.3.2 | Onglets navigation | Verifier les onglets | Onglets Invites, Taches, Budget visibles | ⏳ | |
| 4.3.3 | Bouton modifier | Cliquer sur "Modifier" | Formulaire edition affiche | ⏳ | |
| 4.3.4 | Bouton supprimer | Cliquer sur "Supprimer" | Confirmation demandee | ⏳ | |

### 4.4 Modification d'evenement

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 4.4.1 | Pre-remplissage | Ouvrir formulaire modification | Champs pre-remplis avec valeurs existantes | ⏳ | |
| 4.4.2 | Modification titre | Modifier le titre et sauvegarder | Titre mis a jour | ⏳ | |
| 4.4.3 | Modification date | Modifier la date et sauvegarder | Date mise a jour | ⏳ | |
| 4.4.4 | Annulation | Cliquer "Annuler" | Retour sans modification | ⏳ | |

### 4.5 Suppression d'evenement

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 4.5.1 | Confirmation suppression | Cliquer "Supprimer" | Modal de confirmation affiche | ⏳ | |
| 4.5.2 | Annulation suppression | Cliquer "Annuler" dans modal | Modal ferme, evenement conserve | ⏳ | |
| 4.5.3 | Suppression confirmee | Cliquer "Supprimer" dans modal | Evenement supprime, retour liste | ⏳ | |

---

## 5. GESTION DES INVITES

### 5.1 Liste des invites

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 5.1.1 | Affichage liste | Aller sur onglet "Invites" d'un evenement | Liste des invites affichee | ⏳ | |
| 5.1.2 | Liste vide | Evenement sans invites | Message "Aucun invite" | ⏳ | |
| 5.1.3 | Statistiques invites | Verifier les compteurs | Total, Confirmes, En attente, Declines | ⏳ | |
| 5.1.4 | Bouton ajouter invite | Cliquer "Ajouter un invite" | Formulaire ajout affiche | ⏳ | |
| 5.1.5 | Bouton importer | Cliquer "Importer" | Modal import CSV/Excel affiche | ⏳ | |

### 5.2 Ajout d'invite

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 5.2.1 | Formulaire ajout | Ouvrir formulaire | Champs nom, email, telephone, etc. | ⏳ | |
| 5.2.2 | Ajout valide | Remplir nom/email et soumettre | Invite ajoute a la liste | ⏳ | |
| 5.2.3 | Email invalide | Saisir email mal formate | Message erreur validation | ⏳ | |
| 5.2.4 | Champ accompagnant | Cocher "Avec accompagnant" | Option accompagnant activee | ⏳ | |
| 5.2.5 | Restrictions alimentaires | Saisir restrictions | Texte libre accepte | ⏳ | |

### 5.3 Import CSV/Excel

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 5.3.1 | Modal import | Cliquer "Importer" | Modal avec zone upload affichee | ⏳ | |
| 5.3.2 | Telechargement modele | Cliquer lien modele | Fichier modele telecharge | ⏳ | |
| 5.3.3 | Upload fichier CSV | Uploader un fichier CSV valide | Fichier accepte, apercu affiche | ⏳ | |
| 5.3.4 | Upload fichier Excel | Uploader un fichier XLSX valide | Fichier accepte, apercu affiche | ⏳ | |
| 5.3.5 | Apercu donnees | Apres upload | Tableau apercu avec donnees du fichier | ⏳ | |
| 5.3.6 | Import valide | Cliquer "Importer" | Invites ajoutes, message succes | ⏳ | |
| 5.3.7 | Fichier invalide | Uploader fichier non CSV/Excel | Message erreur format | ⏳ | |
| 5.3.8 | Fichier vide | Uploader fichier sans donnees | Message erreur fichier vide | ⏳ | |

### 5.4 Modification/Suppression invite

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 5.4.1 | Modifier invite | Cliquer modifier sur un invite | Formulaire pre-rempli | ⏳ | |
| 5.4.2 | Sauvegarder modification | Modifier et sauvegarder | Invite mis a jour | ⏳ | |
| 5.4.3 | Supprimer invite | Cliquer supprimer | Confirmation puis suppression | ⏳ | |

### 5.5 Gestion RSVP

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 5.5.1 | Envoyer invitation | Cliquer "Envoyer invitation" | Email envoye, statut mis a jour | ⏳ | |
| 5.5.2 | Renvoyer invitation | Cliquer "Renvoyer" | Nouvel email envoye | ⏳ | |
| 5.5.3 | Changer statut RSVP | Modifier le statut manuellement | Statut mis a jour | ⏳ | |
| 5.5.4 | Check-in invite | Cliquer "Enregistrer arrivee" | Invite marque comme present | ⏳ | |

---

## 6. GESTION DES TACHES

### 6.1 Liste des taches

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 6.1.1 | Affichage liste | Aller sur onglet "Taches" d'un evenement | Liste des taches affichee | ⏳ | |
| 6.1.2 | Liste vide | Evenement sans taches | Message "Aucune tache" | ⏳ | |
| 6.1.3 | Filtrage par statut | Filtrer par statut | Seules taches du statut affichees | ⏳ | |
| 6.1.4 | Filtrage par priorite | Filtrer par priorite | Seules taches de la priorite affichees | ⏳ | |

### 6.2 Ajout de tache

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 6.2.1 | Formulaire ajout | Cliquer "Ajouter une tache" | Formulaire avec champs | ⏳ | |
| 6.2.2 | Ajout valide | Remplir titre et soumettre | Tache ajoutee | ⏳ | |
| 6.2.3 | Selection priorite | Choisir priorite | Basse/Moyenne/Haute disponibles | ⏳ | |
| 6.2.4 | Date limite | Selectionner une date | Date enregistree | ⏳ | |
| 6.2.5 | Assigner a | Selectionner un collaborateur | Tache assignee | ⏳ | |

### 6.3 Gestion statut tache

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 6.3.1 | Marquer en cours | Changer statut a "En cours" | Statut mis a jour | ⏳ | |
| 6.3.2 | Marquer terminee | Changer statut a "Terminee" | Tache marquee complete | ⏳ | |
| 6.3.3 | Annuler tache | Changer statut a "Annulee" | Tache annulee | ⏳ | |

---

## 7. GESTION DU BUDGET

### 7.1 Liste des depenses

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 7.1.1 | Affichage budget | Aller sur onglet "Budget" d'un evenement | Resume budget affiche | ⏳ | |
| 7.1.2 | Totaux | Verifier les totaux | Estime, Reel, Paye, Restant corrects | ⏳ | |
| 7.1.3 | Liste depenses | Verifier la liste | Depenses listees par categorie | ⏳ | |

### 7.2 Ajout de depense

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 7.2.1 | Formulaire ajout | Cliquer "Ajouter une depense" | Formulaire affiche | ⏳ | |
| 7.2.2 | Selection categorie | Ouvrir select categorie | Categories disponibles (Lieu, Traiteur, etc.) | ⏳ | |
| 7.2.3 | Montant estime | Saisir montant estime | Montant accepte | ⏳ | |
| 7.2.4 | Montant reel | Saisir montant reel | Montant accepte | ⏳ | |
| 7.2.5 | Fournisseur | Saisir nom fournisseur | Texte accepte | ⏳ | |
| 7.2.6 | Ajout valide | Soumettre formulaire | Depense ajoutee, totaux mis a jour | ⏳ | |

### 7.3 Gestion paiements

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 7.3.1 | Marquer comme paye | Cliquer "Marquer comme paye" | Depense marquee payee | ⏳ | |
| 7.3.2 | Total paye | Apres paiement | Total paye mis a jour | ⏳ | |

---

## 8. COLLABORATIONS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 8.1 | Affichage page | Acceder a `/collaborations` | Liste des collaborations | ⏳ | |
| 8.2 | Inviter collaborateur | Cliquer "Inviter" | Modal invitation affiche | ⏳ | |
| 8.3 | Envoi invitation | Saisir email et role | Invitation envoyee | ⏳ | |
| 8.4 | Roles disponibles | Verifier les roles | Proprietaire, Editeur, Lecteur | ⏳ | |
| 8.5 | Accepter invitation | Cliquer accepter sur invitation recue | Collaboration activee | ⏳ | |
| 8.6 | Refuser invitation | Cliquer refuser | Invitation supprimee | ⏳ | |

---

## 9. NOTIFICATIONS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 9.1 | Affichage page | Acceder a `/notifications` | Liste des notifications | ⏳ | |
| 9.2 | Liste vide | Sans notifications | Message "Aucune notification" | ⏳ | |
| 9.3 | Marquer comme lue | Cliquer sur notification | Notification marquee lue | ⏳ | |
| 9.4 | Tout marquer comme lu | Cliquer "Tout marquer comme lu" | Toutes notifications lues | ⏳ | |
| 9.5 | Indicateur non lues | Avoir des notifications non lues | Badge compteur visible | ⏳ | |

---

## 10. PROFIL UTILISATEUR

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 10.1 | Affichage profil | Acceder a `/profile` | Page profil avec infos | ⏳ | |
| 10.2 | Modifier nom | Changer le nom et sauvegarder | Nom mis a jour | ⏳ | |
| 10.3 | Changer photo | Uploader nouvelle photo | Avatar mis a jour | ⏳ | |
| 10.4 | Supprimer photo | Cliquer supprimer photo | Avatar par defaut | ⏳ | |
| 10.5 | Email non modifiable | Verifier champ email | Champ desactive | ⏳ | |

---

## 11. PARAMETRES

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 11.1 | Affichage page | Acceder a `/settings` | Page parametres | ⏳ | |
| 11.2 | Changer mot de passe | Saisir ancien + nouveau mot de passe | Mot de passe modifie | ⏳ | |
| 11.3 | Ancien mot de passe incorrect | Saisir mauvais ancien mot de passe | Message erreur | ⏳ | |
| 11.4 | Parametres notifications | Modifier preferences | Preferences sauvegardees | ⏳ | |
| 11.5 | Sessions actives | Verifier liste sessions | Sessions affichees | ⏳ | |
| 11.6 | Supprimer compte | Cliquer "Supprimer mon compte" | Confirmation demandee | ⏳ | |

---

## 12. ABONNEMENTS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 12.1 | Affichage page | Acceder a `/subscriptions` | Page abonnements | ⏳ | |
| 12.2 | Plan actuel | Verifier plan affiche | Plan correct avec details | ⏳ | |
| 12.3 | Plans disponibles | Voir les plans | Liste des plans avec prix | ⏳ | |
| 12.4 | Changer de plan | Cliquer "Choisir ce plan" | Processus paiement demarre | ⏳ | |
| 12.5 | Historique paiements | Verifier historique | Paiements precedents listes | ⏳ | |

---

## 13. ADMINISTRATION - TABLEAU DE BORD

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 13.1 | Acces admin (admin) | Acceder a `/admin` en tant qu'admin | Dashboard admin affiche | ⏳ | |
| 13.2 | Acces admin (user) | Acceder a `/admin` en tant qu'user | Acces refuse/redirection | ⏳ | |
| 13.3 | Statistiques globales | Verifier les stats | Utilisateurs, Evenements, Revenus | ⏳ | |

---

## 14. ADMINISTRATION - UTILISATEURS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 14.1 | Liste utilisateurs | Acceder a `/admin/users` | Liste paginee des utilisateurs | ⏳ | |
| 14.2 | Recherche | Rechercher par nom/email | Resultats filtres | ⏳ | |
| 14.3 | Filtrage par role | Filtrer par role | Seuls users du role affiches | ⏳ | |
| 14.4 | Modifier role | Changer le role d'un user | Role mis a jour | ⏳ | |
| 14.5 | Activer/Desactiver | Toggle statut utilisateur | Statut change | ⏳ | |
| 14.6 | Supprimer utilisateur | Supprimer un user | Confirmation puis suppression | ⏳ | |
| 14.7 | Pagination | Naviguer entre pages | Pages chargees correctement | ⏳ | |

---

## 15. ADMINISTRATION - EVENEMENTS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 15.1 | Liste evenements | Acceder a `/admin/events` | Liste de tous les evenements | ⏳ | |
| 15.2 | Recherche | Rechercher par titre | Resultats filtres | ⏳ | |
| 15.3 | Filtrage par type | Filtrer par type evenement | Resultats filtres | ⏳ | |
| 15.4 | Filtrage par statut | Filtrer par statut | Resultats filtres | ⏳ | |
| 15.5 | Voir details | Cliquer sur un evenement | Details affiches | ⏳ | |

---

## 16. ADMINISTRATION - PAIEMENTS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 16.1 | Liste paiements | Acceder a `/admin/payments` | Liste des paiements | ⏳ | |
| 16.2 | Filtrage par statut | Filtrer par statut paiement | Resultats filtres | ⏳ | |
| 16.3 | Filtrage par periode | Filtrer par date | Resultats filtres | ⏳ | |
| 16.4 | Details paiement | Cliquer sur un paiement | Details affiches | ⏳ | |

---

## 17. ADMINISTRATION - ABONNEMENTS

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 17.1 | Liste abonnements | Acceder a `/admin/subscriptions` | Liste des abonnements | ⏳ | |
| 17.2 | Filtrage par plan | Filtrer par type de plan | Resultats filtres | ⏳ | |
| 17.3 | Filtrage par statut | Filtrer par statut | Resultats filtres | ⏳ | |
| 17.4 | Prolonger abonnement | Prolonger un abonnement | Date expiration mise a jour | ⏳ | |
| 17.5 | Changer plan | Modifier le plan d'un user | Plan mis a jour | ⏳ | |

---

## 18. ADMINISTRATION - TEMPLATES

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 18.1 | Liste templates | Acceder a `/admin/templates` | Liste des templates | ⏳ | |
| 18.2 | Creer template | Cliquer "Nouveau template" | Formulaire creation | ⏳ | |
| 18.3 | Remplir formulaire | Saisir nom, type, description | Champs acceptes | ⏳ | |
| 18.4 | Ajouter taches defaut | Ajouter des taches | Taches ajoutees a la liste | ⏳ | |
| 18.5 | Ajouter categories budget | Ajouter des categories | Categories ajoutees | ⏳ | |
| 18.6 | Ajouter themes suggeres | Ajouter des themes | Themes ajoutes | ⏳ | |
| 18.7 | Sauvegarder template | Soumettre formulaire | Template cree | ⏳ | |
| 18.8 | Modifier template | Modifier un template existant | Template mis a jour | ⏳ | |
| 18.9 | Activer/Desactiver | Toggle statut template | Statut change | ⏳ | |
| 18.10 | Supprimer template | Supprimer un template | Confirmation puis suppression | ⏳ | |

---

## 19. ADMINISTRATION - JOURNAL D'ACTIVITE

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 19.1 | Affichage page | Acceder a `/admin/activity-logs` | Page journal affichee | ⏳ | |
| 19.2 | Statistiques | Verifier les stats | Total, Aujourd'hui, Semaine, Mois corrects | ⏳ | |
| 19.3 | Liste historique | Verifier le tableau | Logs affiches avec details | ⏳ | |
| 19.4 | Nom ressource | Verifier colonne ressource | Nom de la ressource affiche (pas juste #ID) | ⏳ | |
| 19.5 | Filtrage par action | Filtrer par type action | Resultats filtres | ⏳ | |
| 19.6 | Filtrage par ressource | Filtrer par type ressource | Resultats filtres | ⏳ | |
| 19.7 | Filtrage par date | Filtrer par periode | Resultats filtres | ⏳ | |
| 19.8 | Recherche | Rechercher dans description | Resultats filtres | ⏳ | |
| 19.9 | Expansion details | Cliquer sur une ligne | Anciennes/Nouvelles valeurs affichees | ⏳ | |
| 19.10 | Pagination | Naviguer entre pages | Pages chargees correctement | ⏳ | |
| 19.11 | Actualiser | Cliquer "Actualiser" | Donnees rechargees | ⏳ | |
| 19.12 | Reinitialiser filtres | Cliquer "Reinitialiser" | Tous filtres effaces | ⏳ | |

---

## 20. TESTS RESPONSIVES

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 20.1 | Desktop (1920x1080) | Tester toutes les pages | Affichage correct | ⏳ | |
| 20.2 | Laptop (1366x768) | Tester toutes les pages | Affichage correct | ⏳ | |
| 20.3 | Tablette (768x1024) | Tester toutes les pages | Affichage adapte | ⏳ | |
| 20.4 | Mobile (375x667) | Tester toutes les pages | Affichage mobile | ⏳ | |
| 20.5 | Sidebar mobile | Ouvrir sidebar sur mobile | Menu hamburger fonctionnel | ⏳ | |

---

## 21. TESTS DE PERFORMANCE

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 21.1 | Chargement initial | Mesurer temps chargement | < 3 secondes | ⏳ | |
| 21.2 | Navigation entre pages | Naviguer rapidement | Transitions fluides | ⏳ | |
| 21.3 | Liste longue | Afficher 100+ elements | Pas de lag | ⏳ | |
| 21.4 | Upload fichier | Uploader fichier 5MB | Upload sans timeout | ⏳ | |

---

## 22. TESTS D'ERREUR

| # | Cas de test | Actions | Resultat attendu | Statut | Commentaires |
|---|-------------|---------|------------------|--------|--------------|
| 22.1 | Page 404 | Acceder a URL inexistante | Page 404 affichee | ⏳ | |
| 22.2 | Erreur reseau | Couper connexion | Message erreur reseau | ⏳ | |
| 22.3 | Session expiree | Attendre expiration | Redirection vers login | ⏳ | |
| 22.4 | Erreur serveur | Simuler erreur 500 | Message erreur generique | ⏳ | |

---

## RESUME DE LA RECETTE

| Section | Total tests | OK | KO | Partiel | Non teste |
|---------|-------------|----|----|---------|-----------|
| 1. Authentification | 17 | | | | 17 |
| 2. Navigation | 14 | | | | 14 |
| 3. Dashboard | 8 | | | | 8 |
| 4. Evenements | 21 | | | | 21 |
| 5. Invites | 21 | | | | 21 |
| 6. Taches | 10 | | | | 10 |
| 7. Budget | 9 | | | | 9 |
| 8. Collaborations | 6 | | | | 6 |
| 9. Notifications | 5 | | | | 5 |
| 10. Profil | 5 | | | | 5 |
| 11. Parametres | 6 | | | | 6 |
| 12. Abonnements | 5 | | | | 5 |
| 13. Admin Dashboard | 3 | | | | 3 |
| 14. Admin Utilisateurs | 7 | | | | 7 |
| 15. Admin Evenements | 5 | | | | 5 |
| 16. Admin Paiements | 4 | | | | 4 |
| 17. Admin Abonnements | 5 | | | | 5 |
| 18. Admin Templates | 10 | | | | 10 |
| 19. Admin Activity Logs | 12 | | | | 12 |
| 20. Responsives | 5 | | | | 5 |
| 21. Performance | 4 | | | | 4 |
| 22. Erreurs | 4 | | | | 4 |
| **TOTAL** | **186** | | | | **186** |

---

## NOTES ET OBSERVATIONS

### Bugs identifies


### Ameliorations suggerees


### Environnement de test

- Navigateur:
- Version navigateur:
- Systeme d'exploitation:
- Resolution ecran:

---

**Signature testeur:** _________________________

**Date:** _________________________
