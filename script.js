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

// Fonction pour obtenir la salutation appropriée selon l'heure et la saison
function getGreeting(now) {
  // Vérifier si nous sommes sur la page des mentions légales
  if (window.location.pathname.includes('mentions-legales.html')) {
    return ''; // Pas de salutation sur la page des mentions légales
  }
  
  // Ne pas afficher le message sur la page 'Comment ça marche ?'
  if (window.location.pathname.includes('comment-ca-marche.html')) {
    return '';
  }
  
  const hour = now.getHours();
  const month = now.getMonth();
  const day = now.getDate();

  // Périodes de fête (décembre à janvier)
  const isHolidaySeason = (month === 11 && day >= 20) || (month === 0 && day <= 5);

  let timeGreeting;
  if (hour >= 6 && hour < 12) {
    timeGreeting = "Bonjour";
  } else if (hour >= 12 && hour < 18) {
    timeGreeting = "Bonne après-midi";
  } else {
    timeGreeting = "Bonne soirée";
  }

  // Si on est en période de fête, remplacer par "Bonne fête"
  if (isHolidaySeason) {
    return "Bonne fête";
  }

  return timeGreeting;
}

// Variables globales pour le sélecteur de date
let selectedDate = new Date();
let isDatePickerActive = false;

function updateClock() {
  // Toujours utiliser l'heure actuelle, sauf si on est en mode date sélectionnée
  const now = isDatePickerActive ? new Date(selectedDate) : new Date();
  
  // Si on est en mode date sélectionnée, on garde la date sélectionnée mais avec l'heure actuelle
  if (isDatePickerActive) {
    const currentTime = new Date();
    now.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
  }

  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const doyEl = document.getElementById("dayOfYear");
  const titleEl = document.querySelector("h1");
  const holidayImage = document.querySelector(".holiday-image");

  if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  if (dateEl) dateEl.textContent = dateFormatter.format(now);

  // Mettre à jour le titre avec la salutation appropriée
  if (titleEl) {
    if (window.location.pathname.includes('comment-ca-marche.html')) {
      titleEl.style.display = 'none';
    } else {
      titleEl.textContent = getGreeting(now);
    }
  }

  // Afficher l'image de fête seulement les 30 et 31 décembre
  if (holidayImage) {
    const isHolidayPeriod = now.getMonth() === 11 && (now.getDate() === 30 || now.getDate() === 31);
    holidayImage.style.display = isHolidayPeriod ? 'block' : 'none';
  }

  const doy = dayOfYear(now);
  if (doyEl) {
    // Vérifier si c'est le 31 décembre (dernier jour de l'année)
    const isLastDayOfYear = now.getMonth() === 11 && now.getDate() === 31;
    // Vérifier si c'est le 30 décembre (avant-dernier jour de l'année)
    const isDayBeforeLast = now.getMonth() === 11 && now.getDate() === 30;
    
    if (isLastDayOfYear) {
      // Calculer le temps restant jusqu'à minuit
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const timeLeft = midnight - now;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      // Décompte en temps réel
      doyEl.textContent = `Dernier jour de l'année ! Plus que ${hours}h ${pad2(minutes)}m ${pad2(seconds)}s avant ${now.getFullYear() + 1}`;
    } else if (isDayBeforeLast) {
      // Message pour le 30 décembre
      const nextYear = now.getFullYear() + 1;
      doyEl.textContent = `Demain c'est le réveillon du Nouvel An ${nextYear} !`;
    } else {
      // Message normal pour les autres jours
      doyEl.textContent = `Nous sommes au ${doy}${doy === 1 ? 'er' : 'e'} jour de l'année`;
      // Réinitialiser le style si nécessaire
      doyEl.style.color = '';
      doyEl.style.fontWeight = '';
    }
  }
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

// Coordonnées de Paris (par défaut)
const DEFAULT_CITY = {
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522
};

// Fonction pour obtenir la position actuelle
async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log('La géolocalisation n\'est pas supportée par ce navigateur');
      resolve(DEFAULT_CITY);
      return;
    }

    // Vérifier si l'utilisateur a déjà refusé la géolocalisation
    if (navigator.permissions) {
      navigator.permissions.query({name:'geolocation'}).then(function(permissionStatus) {
        if (permissionStatus.state === 'denied') {
          console.log('L\'utilisateur a refusé la géolocalisation');
          resolve(DEFAULT_CITY);
          return;
        }
        // Si la permission n'est pas refusée, continuer avec getCurrentPosition
        requestPosition(resolve, reject);
      });
    } else {
      // Pour les navigateurs qui ne supportent pas l'API Permissions
      requestPosition(resolve, reject);
    }
  });
}

// Fonction pour demander la position
function requestPosition(resolve, reject) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('Position obtenue avec succès');
      resolve({
        name: null, // Le nom sera déterminé plus tard
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    (error) => {
      console.log('Erreur de géolocalisation, utilisation de Paris par défaut:', error.message);
      resolve(DEFAULT_CITY);
    },
    { 
      enableHighAccuracy: true,
      timeout: 5000, // Augmentation du timeout pour laisser plus de temps
      maximumAge: 0
    }
  );
}

// Fonction pour obtenir le nom de la ville via reverse geocoding
async function getCityName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );

    const data = await response.json();

    if (data && data.address) {
      // Essayer différents champs pour obtenir le nom de la ville
      const city = data.address.city ||
                   data.address.town ||
                   data.address.village ||
                   data.address.municipality ||
                   data.address.hamlet ||
                   data.display_name.split(',')[0];

      return city || 'votre position';
    }

    return 'votre position';
  } catch (error) {
    console.error('Erreur lors de la récupération du nom de ville, utilisation de Paris par défaut:', error);
    return 'Paris';
  }
}

// Fonction pour récupérer la météo
async function fetchWeather() {
  try {
    // Obtenir la position actuelle
    const position = await getCurrentPosition();
    const { latitude, longitude } = position;

    // Obtenir le nom de la ville en parallèle avec la météo
    const cityNamePromise = getCityName(latitude, longitude);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
    );

    const data = await response.json();
    const cityName = await cityNamePromise;

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

      // Mise à jour du texte descriptif avec le nom de la ville
      document.getElementById('weather-text').textContent =
        `Il fait ${temp}°C à ${cityName} avec un ciel ${description}`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la météo:', error);

    // Gestion spécifique des erreurs de géolocalisation
    if (error.message.includes('géolocalisation') || error.message.includes('localisation')) {
      document.getElementById('weather-text').textContent = `Erreur de localisation: ${error.message}`;
    } else {
      document.getElementById('weather-text').textContent = 'Données météo indisponibles';
    }
  }
}

// Gestion du volume (haut-parleur)
function initVolumeToggle() {
  const volumeToggle = document.querySelector('.settings-icon');
  const volumeIcon = volumeToggle.querySelector('.material-icons');

  // Vérifier l'état sauvegardé du volume ou utiliser désactivé par défaut
  const savedVolumeState = localStorage.getItem('volume-enabled');
  const isVolumeEnabled = savedVolumeState !== null ? savedVolumeState === 'true' : false;

  // Appliquer l'état initial (désactivé par défaut)
  updateVolumeIcon(volumeIcon, isVolumeEnabled);
  
  // Si le son est activé, l'arrêter au démarrage
  if (isVolumeEnabled && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }

  // Mettre à jour le titre du bouton en fonction de l'état initial
  volumeToggle.title = isVolumeEnabled ? 'Désactiver le haut-parleur' : 'Activer le haut-parleur';

  // Gérer le toggle au clic
  volumeToggle.addEventListener('click', () => {
    const currentState = localStorage.getItem('volume-enabled') === 'true';
    const newState = !currentState;
    
    // Mettre à jour le titre du bouton
    volumeToggle.title = newState ? 'Désactiver le haut-parleur' : 'Activer le haut-parleur';

    // Animation de clic
    volumeIcon.style.transform = 'scale(0.8)';
    setTimeout(() => {
      volumeIcon.style.transform = '';
      updateVolumeIcon(volumeIcon, newState);
    }, 100);

    localStorage.setItem('volume-enabled', newState.toString());

    // Si on active le volume, lire le contenu de la page
    if (newState) {
      speakPageContent();
    } else {
      // Si on désactive, arrêter la synthèse vocale
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }

    console.log('Volume:', newState ? 'activé' : 'désactivé');
  });
}

function updateVolumeIcon(iconElement, isEnabled) {
  iconElement.textContent = isEnabled ? 'volume_up' : 'volume_off';
}

// Fonction pour lire le contenu de la page avec synthèse vocale
function speakPageContent() {
  // Vérifier si la synthèse vocale est supportée
  if ('speechSynthesis' in window) {
    // Arrêter toute synthèse en cours
    speechSynthesis.cancel();

    // Récupérer tout le texte de la page
    const pageText = getPageText();

    // Créer l'objet de synthèse vocale
    const utterance = new SpeechSynthesisUtterance(pageText);

    // Configurer la voix (en français si disponible)
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    // Configurer les paramètres
    utterance.rate = 0.9; // Vitesse légèrement réduite
    utterance.pitch = 1; // Tonalité normale
    utterance.volume = 0.8; // Volume à 80%

    // Lire le texte
    speechSynthesis.speak(utterance);
  } else {
    console.log('Synthèse vocale non supportée par ce navigateur');
  }
}

// Fonction pour extraire le texte de la page de manière naturelle
function getPageText() {
  let textContent = '';

  // Vérifier si on est sur la page 404
  const errorCodeElement = document.querySelector('.error-code');
  if (errorCodeElement) {
    textContent += 'Page non trouvée. ';
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
      textContent += errorMessage.textContent + '. ';
    }
    textContent += 'Vous pouvez utiliser le bouton retour à l\'accueil pour revenir à la page principale.';
    return textContent.trim();
  }

  // Détecter la date actuelle affichée
  const now = isDatePickerActive ? selectedDate : new Date();
  const month = now.getMonth();
  const day = now.getDate();
  const nextYear = now.getFullYear() + 1;
  const hour = new Date().getHours();

  // Messages spéciaux pour le 30 décembre
  if (month === 11 && day === 30) {
    // Salutation selon l'heure
    if (hour >= 6 && hour < 12) {
      textContent += 'Bonjour et bonnes fêtes de fin d\'année ! ';
    } else if (hour >= 12 && hour < 18) {
      textContent += 'Bonne après-midi et joyeuses fêtes ! ';
    } else {
      textContent += 'Bonne soirée et bonnes fêtes ! ';
    }

    // Heure
    const timeElement = document.getElementById('time');
    if (timeElement) {
      textContent += 'Il est ' + formatTimeForSpeech(timeElement.textContent) + '. ';
    }

    // Message festif pour le 30 décembre
    textContent += 'Nous sommes le trente décembre, ';
    textContent += 'c\'est l\'avant-dernier jour de l\'année ! ';
    textContent += 'Demain, ce sera le réveillon du Nouvel An ' + nextYear + '. ';
    textContent += 'Profitez bien de cette journée pour préparer la fête ! ';

    // Météo
    const weatherElement = document.getElementById('weather-text');
    if (weatherElement && weatherElement.textContent && !weatherElement.textContent.includes('Chargement')) {
      textContent += 'Côté météo, ' + formatWeatherForSpeech(weatherElement.textContent.toLowerCase()) + '. ';
    }

    return textContent.trim();
  }

  // Messages spéciaux pour le 31 décembre
  if (month === 11 && day === 31) {
    // Salutation festive
    textContent += 'Bonne fête et joyeux réveillon ! ';

    // Heure
    const timeElement = document.getElementById('time');
    if (timeElement) {
      textContent += 'Il est ' + formatTimeForSpeech(timeElement.textContent) + '. ';
    }

    // Message pour le 31 décembre
    textContent += 'C\'est le trente et un décembre, le dernier jour de l\'année ! ';
    
    // Calculer le temps restant
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const currentTime = new Date();
    const timeLeft = midnight - currentTime;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
      textContent += 'Il reste environ ' + hoursLeft + ' heure' + (hoursLeft > 1 ? 's' : '');
      if (minutesLeft > 0) {
        textContent += ' et ' + minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : '');
      }
      textContent += ' avant le passage à ' + nextYear + ' ! ';
    } else if (minutesLeft > 0) {
      textContent += 'Plus que ' + minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : '') + ' avant la nouvelle année ! ';
    } else {
      textContent += 'Le décompte final a commencé ! ';
    }

    textContent += 'Passez une excellente soirée et une merveilleuse année ' + nextYear + ' ! ';

    // Météo
    const weatherElement = document.getElementById('weather-text');
    if (weatherElement && weatherElement.textContent && !weatherElement.textContent.includes('Chargement')) {
      textContent += 'Pour la météo de ce soir, ' + formatWeatherForSpeech(weatherElement.textContent.toLowerCase()) + '. ';
    }

    return textContent.trim();
  }

  // --- Messages normaux pour les autres jours ---
  const greeting = getGreeting(now);
  textContent += greeting + ', ';

  // Titre principal (sauter si c'est une salutation simple)
  const titleElement = document.querySelector('h1');
  const titleText = titleElement ? titleElement.textContent : '';
  const isSimpleGreeting = ['Bonjour', 'Bonne après-midi', 'Bonne soirée', 'Bonne fête'].includes(titleText);

  if (titleElement && !isSimpleGreeting) {
    textContent += titleText + '. ';
  }

  // Heure - format humain
  const timeElement = document.getElementById('time');
  if (timeElement) {
    const timeText = formatTimeForSpeech(timeElement.textContent);
    textContent += 'il est ' + timeText + '. ';
  }

  // Date - format humain
  const dateElement = document.getElementById('date');
  if (dateElement) {
    textContent += 'nous sommes ' + formatDateForSpeech(dateElement.textContent) + '. ';
  }

  // Jour dans l'année
  const dayOfYearElement = document.getElementById('dayOfYear');
  if (dayOfYearElement) {
    const text = dayOfYearElement.textContent;
    const dayMatch = text.match(/(\d+)/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1]);
      const ordinalSuffix = dayNum === 1 ? 'er' : 'ème';
      textContent += 'nous sommes le ' + dayNum + ordinalSuffix + ' jour de l\'année. ';
    }
  }

  // Météo
  const weatherElement = document.getElementById('weather-text');
  if (weatherElement && weatherElement.textContent && !weatherElement.textContent.includes('Chargement')) {
    textContent += 'Et ' + formatWeatherForSpeech(weatherElement.textContent.toLowerCase()) + '. ';
  }

  // Événements du jour
  const eventsContainer = document.getElementById('events-container');
  if (eventsContainer && eventsContainer.children.length > 0) {
    const eventTexts = [];
    Array.from(eventsContainer.children).forEach(child => {
      if (child.textContent && child.textContent.trim() && !child.textContent.includes('Aucun')) {
        eventTexts.push(child.textContent.trim());
      }
    });

    if (eventTexts.length > 0) {
      textContent += 'Voici les événements du jour : ';
      eventTexts.forEach((event, index) => {
        textContent += event.toLowerCase();
        if (index < eventTexts.length - 1) {
          textContent += ', ';
        } else {
          textContent += '. ';
        }
      });
    }
  }

  return textContent.trim();
}

// Fonction pour formater l'heure pour la synthèse vocale
function formatTimeForSpeech(timeString) {
  const parts = timeString.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);

    let timeText = '';

    // Heures
    if (hours === 0) {
      timeText += 'minuit';
    } else if (hours === 12) {
      timeText += 'midi';
    } else if (hours === 1) {
      timeText += 'une heure';
    } else {
      timeText += numberToWords(hours) + ' heure' + (hours > 1 ? 's' : '');
    }

    // Minutes
    if (minutes > 0) {
      if (minutes === 1) {
        timeText += ' une';
      } else {
        timeText += ' ' + numberToWords(minutes);
      }
    }

    // Secondes (optionnel, seulement si demandé)
    // timeText += ' et ' + numberToWords(seconds) + ' seconde' + (seconds > 1 ? 's' : '');

    return timeText;
  }
  return timeString;
}

// Fonction pour formater la date pour la synthèse vocale
function formatDateForSpeech(dateString) {
  // Exemple: "mardi 31 décembre 2024"
  const parts = dateString.split(' ');
  if (parts.length >= 4) {
    const dayOfWeek = parts[0];
    const day = parseInt(parts[1]);
    const month = parts[2];
    const year = parts[3];

    const dayWord = numberToWords(day);

    // Mapping des mois
    const monthNames = {
      'janvier': 'janvier',
      'février': 'février',
      'mars': 'mars',
      'avril': 'avril',
      'mai': 'mai',
      'juin': 'juin',
      'juillet': 'juillet',
      'août': 'août',
      'septembre': 'septembre',
      'octobre': 'octobre',
      'novembre': 'novembre',
      'décembre': 'décembre'
    };

    const monthWord = monthNames[month.toLowerCase()] || month;

    return dayOfWeek + ' ' + dayWord + ' ' + monthWord + ' ' + year;
  }
  return dateString;
}

// Fonction pour formater la météo pour la synthèse vocale
function formatWeatherForSpeech(weatherText) {
  let formatted = weatherText;

  // Extraire la température
  const tempMatch = formatted.match(/(\d+)°C/);
  const temp = tempMatch ? tempMatch[1] : null;

  // Extraire la vitesse du vent
  const windMatch = formatted.match(/(\d+)\s*km\/h/);
  const windSpeed = windMatch ? parseInt(windMatch[1]) : null;

  // Décrire la sensation thermique
  let tempDescription = '';
  if (temp) {
    const tempNum = parseInt(temp);
    if (tempNum <= 0) tempDescription = 'très froid';
    else if (tempNum <= 5) tempDescription = 'froid';
    else if (tempNum <= 15) tempDescription = 'frais';
    else if (tempNum <= 25) tempDescription = 'agréable';
    else if (tempNum <= 30) tempDescription = 'chaud';
    else tempDescription = 'très chaud';
  }

  // Décrire la vitesse du vent
  let windDescription = '';
  if (windSpeed !== null) {
    if (windSpeed < 10) windDescription = 'très léger';
    else if (windSpeed < 20) windDescription = 'léger';
    else if (windSpeed < 30) windDescription = 'modéré';
    else if (windSpeed < 50) windDescription = 'fort';
    else windDescription = 'très fort';
  }

  // Reconstruire le texte de manière plus naturelle
  formatted = formatted.replace(/°C/g, ' degrés Celsius');
  formatted = formatted.replace(/(\d+)\s*km\/h/g, '$1 kilomètres par heure');

  // Ajouter les descriptions si on a les infos
  if (temp && windSpeed !== null) {
    formatted = formatted.replace(
      /Actuellement à ([^,]+), temps ([^,]+) avec un vent de (\d+) kilomètres par heure/,
      `Il fait actuellement ${temp} degrés Celsius à $1, ce qui est ${tempDescription}, avec un temps $2 et un vent ${windDescription} de $3 kilomètres par heure`
    );
  } else if (temp) {
    formatted = formatted.replace(
      /Actuellement à ([^,]+), temps ([^,]+)/,
      `Il fait actuellement ${temp} degrés Celsius à $1, ce qui est ${tempDescription}, avec un temps $2`
    );
  }

  // Rendre plus agréable à écouter
  formatted = formatted.replace(/temps /g, 'ciel ');

  return formatted;
}

// Fonction pour convertir les nombres en mots (pour les nombres simples)
function numberToWords(num) {
  const numberWords = {
    1: 'premier', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq',
    6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix',
    11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze',
    16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt',
    21: 'vingt-et-un', 22: 'vingt-deux', 23: 'vingt-trois', 24: 'vingt-quatre',
    25: 'vingt-cinq', 26: 'vingt-six', 27: 'vingt-sept', 28: 'vingt-huit',
    29: 'vingt-neuf', 30: 'trente', 31: 'trente-et-un'
  };

  return numberWords[num] || num.toString();
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

// Enregistrer le Service Worker pour le mode hors ligne
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((registration) => {
          console.log('[Service Worker] Enregistré avec succès:', registration.scope);
          
          // Vérifier les mises à jour du service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouveau service worker disponible
                console.log('[Service Worker] Nouvelle version disponible');
              }
            });
          });
        })
        .catch((error) => {
          console.error('[Service Worker] Erreur lors de l\'enregistrement:', error);
        });
    });
  }
}

// Fonction pour fermer le sélecteur de date
function closeDatePicker() {
  const datePickerModal = document.getElementById('date-picker-modal');
  if (datePickerModal) {
    datePickerModal.style.display = 'none';
  }
}

// Fonction pour revenir à aujourd'hui
function resetToToday() {
  selectedDate = new Date();
  isDatePickerActive = false;
  updateClock();
}

// Vérifier si la date sélectionnée est aujourd'hui
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Gestion du sélecteur de date
function initDatePicker() {
  const datePickerToggle = document.querySelector('.date-picker-toggle');
  const datePickerModal = document.getElementById('date-picker-modal');
  const datePickerClose = document.getElementById('date-picker-close');
  const datePickerNext = document.getElementById('date-picker-next');
  const datePickerBack = document.getElementById('date-picker-back');

  // Ouvrir la modal
  datePickerToggle.addEventListener('click', () => {
    // Commencer à aujourd'hui quand on ouvre
    selectedDate = new Date();
    isDatePickerActive = false;
    updateDatePickerDisplay();
    datePickerModal.style.display = 'flex';
  });

  // Fermer la modal (garder la date sélectionnée)
  datePickerClose.addEventListener('click', () => {
    closeDatePicker();
  });

  // Fermer en cliquant sur l'overlay (garder la date sélectionnée)
  datePickerModal.addEventListener('click', (e) => {
    if (e.target === datePickerModal) {
      closeDatePicker();
    }
  });

  // Jour suivant
  datePickerNext.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    isDatePickerActive = !isToday(selectedDate);
    updateDatePickerDisplay();
    updateMainDisplay();
  });

  // Jour précédent
  datePickerBack.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    isDatePickerActive = !isToday(selectedDate);
    updateDatePickerDisplay();
    updateMainDisplay();
  });
}

// Mettre à jour l'affichage du modal
function updateDatePickerDisplay() {
  const dayEl = document.getElementById('selected-day');
  const monthEl = document.getElementById('selected-month');
  const yearEl = document.getElementById('selected-year');
  const labelEl = document.querySelector('.date-label');
  
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  if (dayEl) dayEl.textContent = selectedDate.getDate();
  if (monthEl) monthEl.textContent = monthNames[selectedDate.getMonth()];
  if (yearEl) yearEl.textContent = selectedDate.getFullYear();
  if (labelEl) labelEl.textContent = isToday(selectedDate) ? "Aujourd'hui" : 'Jour sélectionné';
}

// Mettre à jour l'affichage principal
function updateMainDisplay() {
  const dateEl = document.getElementById('date');
  const doyEl = document.getElementById('dayOfYear');
  const titleEl = document.querySelector('h1');
  const holidayImage = document.querySelector('.holiday-image');
  
  // Formater la date
  const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
  
  if (dateEl) dateEl.textContent = dateFormatter.format(selectedDate);
  
  // Mettre à jour le titre
  if (titleEl) titleEl.textContent = getGreeting(selectedDate);
  
  // Afficher l'image de fête pour les 30 et 31 décembre
  if (holidayImage) {
    const isHolidayPeriod = selectedDate.getMonth() === 11 && 
      (selectedDate.getDate() === 30 || selectedDate.getDate() === 31);
    holidayImage.style.display = isHolidayPeriod ? 'block' : 'none';
  }
  
  // Mettre à jour le message du jour
  if (doyEl) {
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const nextYear = selectedDate.getFullYear() + 1;
    const doy = dayOfYear(selectedDate);
    
    if (month === 11 && day === 31) {
      // 31 décembre - décompte en temps réel
      const midnight = new Date(selectedDate);
      midnight.setHours(24, 0, 0, 0);
      const currentTime = new Date();
      const timeLeft = midnight - currentTime;
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        doyEl.textContent = `Dernier jour de l'année ! Plus que ${hours}h ${pad2(minutes)}m ${pad2(seconds)}s avant ${nextYear}`;
      } else {
        doyEl.textContent = `Bonne année ${nextYear} !`;
      }
    } else if (month === 11 && day === 30) {
      // 30 décembre
      doyEl.textContent = `Demain c'est le réveillon du Nouvel An ${nextYear} !`;
    } else {
      doyEl.textContent = `Nous sommes au ${doy}${doy === 1 ? 'er' : 'e'} jour de l'année`;
    }
  }
}

// Mettre à jour le décompte si on est sur le 31 décembre (pour le sélecteur de date)
function updateCountdownIfNeeded() {
  if (isDatePickerActive && selectedDate.getMonth() === 11 && selectedDate.getDate() === 31) {
    const doyEl = document.getElementById('dayOfYear');
    if (doyEl) {
      const nextYear = selectedDate.getFullYear() + 1;
      const midnight = new Date(selectedDate);
      midnight.setHours(24, 0, 0, 0);
      const currentTime = new Date();
      const timeLeft = midnight - currentTime;
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        doyEl.textContent = `Dernier jour de l'année ! Plus que ${hours}h ${pad2(minutes)}m ${pad2(seconds)}s avant ${nextYear}`;
      } else {
        doyEl.textContent = `Bonne année ${nextYear} !`;
      }
    }
  }
}

// Initialiser l'horloge et le thème au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  initTheme();
  initVolumeToggle();
  initDatePicker();
  registerServiceWorker();
  fetchWeather();

  // Mettre à jour l'horloge et le décompte toutes les secondes
  setInterval(() => {
    updateClock();
    updateCountdownIfNeeded();
  }, 1000);

  // Mettre à jour la météo toutes les 30 minutes
  setInterval(fetchWeather, 30 * 60 * 1000);
});
