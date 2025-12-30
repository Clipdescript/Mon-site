## Project Overview
Site web d'horloge en temps réel avec affichage de la météo pour Mont-de-Marsan. Le site utilise l'API Open-Meteo pour les données météorologiques.

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
- Coordonnées Mont-de-Marsan : latitude=43.8906, longitude=-0.4976
- Mise à jour automatique toutes les 30 minutes

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
