## Project Overview
Site web d'horloge en temps réel avec affichage de la météo basé sur la position actuelle de l'utilisateur. Le site utilise l'API Open-Meteo pour les données météorologiques et la géolocalisation HTML5 pour déterminer la position.

## Architecture
- **index.html** : Page principale avec l'horloge, la date, le jour de l'année et la météo
- **404.html** : Page d'erreur personnalisée
- **style.css** : Styles principaux (desktop et tablettes)
- **portable.css** : Styles responsive pour mobile (chargé conditionnellement via media query `max-width: 768px`)
- **script.js** : Logique JavaScript (horloge, calcul du jour, appels API météo)
- **Fichiers SVG** : Icônes météo (Soleil, Nuages, Averses, etc.)

## API Météo
L'application utilise l'API gratuite Open-Meteo :
- Endpoint : `https://api.open-meteo.com/v1/forecast`
- Coordonnées dynamiques : obtenues via géolocalisation HTML5
- Reverse geocoding : utilisation de Nominatim (OpenStreetMap) pour obtenir le nom de la ville
- Mise à jour automatique toutes les 30 minutes

## Géolocalisation
- Utilise l'API navigator.geolocation du navigateur
- Demande la permission à l'utilisateur pour accéder à la position
- Gestion des erreurs : permission refusée, position indisponible, timeout
- Cache la position pendant 5 minutes pour éviter les requêtes répétées

## Breakpoints CSS
- Mobile : `max-width: 768px` (portable.css)
- Très petit écran : `max-width: 400px`
- Tablette : `769px - 1024px`
- Desktop : `> 1024px`
- Grand écran : `> 1200px`

## Pour tester localement
Ouvrir `index.html` dans un navigateur ou utiliser un serveur local :
```bash
python -m http.server 8000
```
