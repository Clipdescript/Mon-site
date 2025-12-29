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

// Fonction pour obtenir l'icône Meteocons appropriée
function getMeteoconIcon(weatherCode, isDay = true) {
  // Mappage des codes Open-Meteo vers les icônes Meteocons
  // Format : { codeOpenMeteo: 'caractèreMeteocons' }
  const iconMap = {
    // Ciel clair
    0: isDay ? 'B' : 'C',
    // Légèrement nuageux
    1: isDay ? 'H' : 'I',
    // Partiellement nuageux
    2: isDay ? 'H' : 'I',
    // Nuageux
    3: 'N',
    // Brouillard
    45: 'M',
    48: 'W', // Brouillard givrant
    // Bruine
    51: 'Q',
    53: 'R',
    55: 'R',
    // Bruine verglaçante
    56: 'X',
    57: 'X',
    // Pluie
    61: 'R',
    63: 'R',
    65: 'R',
    // Pluie verglaçante
    66: 'X',
    67: 'X',
    // Neige
    71: 'W',
    73: 'W',
    75: 'W',
    77: 'W', // Grésil
    // Averses
    80: 'Q',
    81: 'R',
    82: 'R',
    // Averses de neige
    85: 'W',
    86: 'W',
    // Orage
    95: 'O',
    96: 'O',
    99: 'O'
  };

  return iconMap[weatherCode] || (isDay ? 'H' : 'I'); // Par défaut 'partiellement nuageux'
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
      
      // Mettre à jour l'icône météo avec Meteocons
      const weatherIcon = document.getElementById('weather-icon');
      const iconChar = getMeteoconIcon(weatherCode, isDay);
      weatherIcon.textContent = iconChar;
      
      // Appliquer des styles en fonction des conditions météo
      if (weatherCode >= 95) {
        // Orage
        weatherIcon.style.color = '#e74c3c';
      } else if (weatherCode >= 51 && weatherCode <= 67) {
        // Pluie
        weatherIcon.style.color = '#3498db';
      } else if (weatherCode >= 71 && weatherCode <= 86) {
        // Neige
        weatherIcon.style.color = '#ecf0f1';
        weatherIcon.style.textShadow = '0 0 2px #7f8c8d';
      } else if (weatherCode === 0 && isDay) {
        // Soleil
        weatherIcon.style.color = '#f1c40f';
      } else if (weatherCode === 0 && !isDay) {
        // Nuit claire
        weatherIcon.style.color = '#2c3e50';
      } else {
        // Par défaut (nuageux, etc.)
        weatherIcon.style.color = isDay ? '#7f8c8d' : '#95a5a6';
      }
      
      // Mise à jour du texte
      document.getElementById('weather-text').textContent = 
        `Actuellement à Mont-de-Marsan, il fait ${temp}°C avec un temps ${description} et un vent de ${windSpeed} km/h.`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la météo:', error);
    document.getElementById('weather-desc').textContent = 'Données météo indisponibles';
  }
}

// Mettre à jour l'horloge immédiatement puis toutes les secondes
updateClock();
setInterval(updateClock, 1000);

// Charger la météo au démarrage
fetchWeather();

// Mettre à jour la météo toutes les 30 minutes
setInterval(fetchWeather, 30 * 60 * 1000);
