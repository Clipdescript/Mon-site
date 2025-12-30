function pad2(n) {
  return String(n).padStart(2, "0");
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

function updateClock() {
  const now = new Date();

  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const doyEl = document.getElementById("dayOfYear");

  if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  if (dateEl) dateEl.textContent = dateFormatter.format(now);

  const doy = dayOfYear(now);
  if (doyEl) doyEl.textContent = `Nous sommes le ${doy}${doy === 1 ? 'er' : 'e'} jour de l'année`;
}

// Fonction pour obtenir l'icône météo appropriée
function getWeatherIcon(weatherCode, isDay = true) {
  // Mappage des codes Open-Meteo vers les fichiers SVG
  const iconMap = {
    // Ciel clair
    0: isDay ? 'Soleil sans nuage.svg' : 'Nuageux.svg',
    // Légèrement nuageux
    1: isDay ? 'Soleil partiellement couvert.svg' : 'Nuageux.svg',
    // Partiellement nuageux
    2: isDay ? 'Nuage passant devant le soleil.svg' : 'Nuageux.svg',
    // Nuageux
    3: 'Nuageux.svg',
    // Brouillard
    45: 'Nuageux.svg',
    48: 'Nuageux.svg',
    // Pluie
    51: 'Nuage avec averse.svg',
    53: 'Nuage avec averse.svg',
    55: 'Nuage avec averse.svg',
    // Bruine verglaçante
    56: 'Nuage avec averse.svg',
    57: 'Nuage avec averse.svg',
    // Pluie
    61: 'Nuage avec averse.svg',
    63: 'Nuage avec averse.svg',
    65: 'Nuage avec averse.svg',
    // Pluie verglaçante
    66: 'Nuage avec averse.svg',
    67: 'Nuage avec averse.svg',
    // Neige
    71: 'Nuage avec averse.svg',
    73: 'Nuage avec averse.svg',
    75: 'Nuage avec averse.svg',
    77: 'Nuage avec averse.svg',
    // Averses
    80: 'Nuage avec averse.svg',
    81: 'Nuage avec averse.svg',
    82: 'Nuage avec averse.svg',
    // Averses de neige
    85: 'Nuage avec averse.svg',
    86: 'Nuage avec averse.svg',
    // Orage
    95: 'Nuage avec averse.svg',
    96: 'Nuage avec averse.svg',
    99: 'Nuage avec averse.svg'
  };

  return iconMap[weatherCode] || 'Soleil sans nuage.svg';
}

// Fonction pour récupérer la météo
async function fetchWeather() {
  try {
    // Coordonnées de Mont-de-Marsan
    const latitude = 43.8906;
    const longitude = -0.4976;
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
    );
    
    const data = await response.json();
    
    if (data && data.current) {
      const current = data.current;
      const temp = Math.round(current.temperature_2m);
      const weatherCode = current.weather_code;
      const windSpeed = Math.round(current.wind_speed_10m);
      
      // Déterminer si c'est le jour ou la nuit
      const hours = new Date().getHours();
      const isDay = hours > 6 && hours < 20; // Jour entre 6h et 20h
      
      // Déterminer la description météo en français
      const descriptions = {
        0: 'ciel dégagé',
        1: 'légèrement nuageux',
        2: 'partiellement nuageux',
        3: 'nuageux',
        45: 'brouillard',
        48: 'brouillard givrant',
        51: 'légère bruine',
        53: 'bruine modérée',
        55: 'forte bruine',
        56: 'légère bruine verglaçante',
        57: 'forte bruine verglaçante',
        61: 'légère pluie',
        63: 'pluie modérée',
        65: 'forte pluie',
        66: 'légère pluie verglaçante',
        67: 'forte pluie verglaçante',
        71: 'légère neige',
        73: 'neige modérée',
        75: 'forte neige',
        77: 'grésil',
        80: 'légères averses',
        81: 'averses modérées',
        82: 'fortes averses',
        85: 'légères averses de neige',
        86: 'fortes averses de neige',
        95: 'orage',
        96: 'orage avec grêle légère',
        99: 'orage avec forte grêle'
      };
      
      const description = descriptions[weatherCode] || 'conditions variables';
      
      // Mettre à jour l'icône météo
      const weatherIcon = document.getElementById('weather-icon');
      const iconFile = getWeatherIcon(weatherCode, isDay);
      weatherIcon.innerHTML = `<img src="${iconFile}" alt="Météo" style="width: 80px; height: 80px; display: block;">`;
      
      // Mettre à jour la température
      const tempElement = document.getElementById('weather-temp');
      if (tempElement) {
        tempElement.textContent = `${Math.round(temp)}°C`;
      }
      
      // Mise à jour du texte descriptif
      document.getElementById('weather-text').textContent = 
        `Actuellement à Mont-de-Marsan, temps ${description} avec un vent de ${windSpeed} km/h.`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la météo:', error);
    document.getElementById('weather-text').textContent = 'Données météo indisponibles';
  }
}

// Gestion du thème
function initTheme() {
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('.material-icons');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Vérifier le thème sauvegardé ou utiliser les préférences système
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = 'light_mode';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.textContent = 'dark_mode';
  }
  
  // Gérer le changement de thème au clic
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      themeIcon.textContent = 'dark_mode';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.textContent = 'light_mode';
      localStorage.setItem('theme', 'dark');
    }
  });
  
  // Mettre à jour le thème si les préférences système changent (uniquement si aucun thème n'est sauvegardé)
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = 'light_mode';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = 'dark_mode';
      }
    }
  });
}

// Initialiser l'horloge et le thème au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  initTheme();
  fetchWeather();
  
  // Mettre à jour l'horloge toutes les secondes
  setInterval(updateClock, 1000);
  
  // Mettre à jour la météo toutes les 30 minutes
  setInterval(fetchWeather, 30 * 60 * 1000);
});
