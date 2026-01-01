# Horloge Interactive - Projet Open Source

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

Une horloge interactive moderne qui affiche l'heure, la date, le jour de l'année et la météo en temps réel. Développé avec des technologies web modernes et entièrement open source.

## Fonctionnalités

- 🕒 Affichage de l'heure en temps réel
- ⛅ Météo locale avec prévisions (via Open-Meteo)
- 📍 Géolocalisation automatique
- 🌙 Mode sombre/clair automatique
- 📱 Design responsive (mobile, tablette, desktop)
- ⚡ Fonctionne hors ligne (PWA)

## Démo en direct

Découvrez l'horloge en action : [Voir la démo](https://clipdescript.github.io/Mon-site/)

## Architecture technique

### Fichiers principaux
- **index.html** - Structure de la page principale
- **style.css** - Styles principaux (desktop/tablette)
- **portable.css** - Styles mobiles (`max-width: 768px`)
- **script.js** - Logique de l'application
- **service-worker.js** - Gestion du mode hors ligne
- **mentions-legales.html** - Mentions légales

### API Utilisées
- **Open-Meteo** - Données météorologiques
- **Nominatim (OpenStreetMap)** - Géocodage inversé
- **Geolocation API** - Positionnement de l'utilisateur

## Compatibilité

| Appareil | Résolution | Fichier CSS |
|----------|------------|-------------|
| Mobile | < 400px | portable.css |
| Tablette | 401px - 768px | portable.css |
| Desktop | 769px - 1024px | style.css |
| Grand écran | > 1024px | style.css |

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/Clipdescript/Mon-site.git
cd Mon-site
```

2. Pour tester en local :
```bash
# Avec Python
python -m http.server 8000

# Ou avec Node.js
npx http-server
```

3. Ouvrez `http://localhost:8000` dans votre navigateur

## Fonctionnalités techniques

### Géolocalisation
- Demande de permission utilisateur
- Cache de 5 minutes pour éviter les requêtes excessives
- Gestion des erreurs complète
- Mise à jour automatique toutes les 30 minutes

### Performance
- Chargement conditionnel des CSS
- Optimisation pour mobile
- Mise en cache intelligente

## Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Remerciements

- [Open-Meteo](https://open-meteo.com/) pour l'API météo gratuite
- [OpenStreetMap](https://www.openstreetmap.org/) pour le géocodage
- [Material Icons](https://fonts.google.com/icons) pour les icônes

---

<div align="center">
  <p>Fait avec ❤️ et JavaScript</p>
  <p>✨ N'oubliez pas de mettre une étoile si vous aimez ce projet !</p>
</div>
