/* ==========================================================================
   1. DATA LAYER (Information Fetching & Storage)
   ========================================================================== */

/**
 * Predefined fallback dataset for reliable testing when offline or rate-limited
 */
const MOCK_WEATHER_DATABASE = {
  "rochester": { name: "Rochester, NY", tempC: 12, conditionCode: 3, windKmh: 14, highC: 15, lowC: 7, sunriseISO: "2026-10-21T07:22", sunsetISO: "2026-10-21T18:15" },
  "new york": { name: "New York, NY", tempC: 18, conditionCode: 1, windKmh: 10, highC: 21, lowC: 13, sunriseISO: "2026-10-21T07:12", sunsetISO: "2026-10-21T18:08" },
  "london": { name: "London, UK", tempC: 14, conditionCode: 61, windKmh: 18, highC: 16, lowC: 10, sunriseISO: "2026-10-21T07:35", sunsetISO: "2026-10-21T17:52" },
  "tokyo": { name: "Tokyo, JP", tempC: 22, conditionCode: 0, windKmh: 8, highC: 25, lowC: 17, sunriseISO: "2026-10-21T05:51", sunsetISO: "2026-10-21T17:01" }
};

/**
 * Data Layer API Fetcher: Uses Open-Meteo free API
 */
async function fetchWeatherData(cityName) {
  const query = cityName.trim().toLowerCase();

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    
    if (!geoResponse.ok) throw new Error("Geocoding service unavailable.");
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      if (MOCK_WEATHER_DATABASE[query]) {
        return MOCK_WEATHER_DATABASE[query];
      }
      throw new Error(`Location "${cityName}" not found. Try Rochester, New York, London, or Tokyo.`);
    }

    const { latitude, longitude, name, admin1, country } = geoData.results[0];
    const locationLabel = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;

    // Requesting daily temperatures, weather code, AND sunrise/sunset times
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) throw new Error("Weather service unreachable.");
    const weatherData = await weatherResponse.json();

    return {
      name: locationLabel,
      tempC: weatherData.current_weather.temperature,
      conditionCode: weatherData.current_weather.weathercode,
      windKmh: weatherData.current_weather.windspeed,
      highC: weatherData.daily.temperature_2m_max[0],
      lowC: weatherData.daily.temperature_2m_min[0],
      sunriseISO: weatherData.daily.sunrise[0],
      sunsetISO: weatherData.daily.sunset[0],
      forecastDaily: weatherData.daily
    };
  } catch (err) {
    if (MOCK_WEATHER_DATABASE[query]) {
      return MOCK_WEATHER_DATABASE[query];
    }
    throw err;
  }
}

/* ==========================================================================
   2. PROCESSING LAYER (Business Logic & Transformations)
   ========================================================================== */

const AppState = {
  currentUnit: 'F',
  lastData: null
};

function celsiusToFahrenheit(c) {
  return Math.round((c * 9 / 5) + 32);
}

function kmhToMph(kmh) {
  return Math.round(kmh * 0.621371);
}

/**
 * Formats ISO date time strings into 12-hour formatted time (e.g., 7:15 AM)
 */
function formatTimeString(isoString) {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // Fallback if string is formatted already
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Determines page background moving theme class based on WMO weather code
 */
function getThemeClass(code) {
  if (code === 0) return "weather-clear";
  if (code >= 1 && code <= 3) return "weather-cloudy";
  if (code >= 45 && code <= 48) return "weather-cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "weather-rainy";
  if (code >= 71 && code <= 77) return "weather-snowy";
  if (code >= 95) return "weather-thunderstorm";
  return "weather-clear";
}

function interpretWeatherCode(code) {
  if (code === 0) return { icon: "☀️", description: "Clear Sky" };
  if (code >= 1 && code <= 3) return { icon: "⛅", description: "Partly Cloudy" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", description: "Foggy" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", description: "Rainy" };
  if (code >= 71 && code <= 77) return { icon: "❄️", description: "Snowy" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", description: "Showers" };
  if (code >= 95) return { icon: "⛈️", description: "Thunderstorm" };
  return { icon: "🌡️", description: "Mild Conditions" };
}

/**
 * Calculates specific attire and gear recommendations based on temperature and condition
 */
function generateClothingRecommendations(tempF, conditionCode, windMph) {
  const items = [];

  // Weather Condition Specific Items (Umbrella, Raincoat, Sunhat, etc.)
  if ((conditionCode >= 51 && conditionCode <= 67) || (conditionCode >= 80 && conditionCode <= 82) || conditionCode >= 95) {
    items.push("☔ Umbrella", "🌧️ Raincoat & Waterproof Boots");
  } else if (conditionCode >= 71 && conditionCode <= 77) {
    items.push("🎿 Winter Boots", "🧣 Warm Scarf");
  } else if (conditionCode === 0 && tempF >= 65) {
    items.push("🕶️ Sunglasses", "🧢 Sun Hat / Cap");
  }

  // Temperature Specific Outfits
  if (tempF <= 32) {
    items.push("🧥 Heavy Winter Coat", "🧤 Thermal Gloves", "🧢 Warm Beanie");
  } else if (tempF > 32 && tempF <= 50) {
    items.push("🧥 Warm Jacket", "🧢 Beanie or Hat");
  } else if (tempF > 50 && tempF <= 65) {
    items.push("🧥 Sweater / Light Jacket", "👖 Pants");
  } else if (tempF > 65 && tempF <= 80) {
    items.push("👕 T-Shirt", "👖 Jeans or Chinos");
  } else {
    items.push("👕 T-Shirt", "🩳 Shorts", "🧴 Sunscreen");
  }

  if (windMph > 15 && tempF <= 60) {
    items.push("💨 Windbreaker");
  }

  return items.join(" • ");
}

function processWeatherData(rawData, unit) {
  const isFahrenheit = unit === 'F';
  
  const temp = isFahrenheit ? celsiusToFahrenheit(rawData.tempC) : Math.round(rawData.tempC);
  const high = isFahrenheit ? celsiusToFahrenheit(rawData.highC) : Math.round(rawData.highC);
  const low = isFahrenheit ? celsiusToFahrenheit(rawData.lowC) : Math.round(rawData.lowC);
  const wind = isFahrenheit ? kmhToMph(rawData.windKmh) : Math.round(rawData.windKmh);

  const unitSymbol = isFahrenheit ? '°F' : '°C';
  const windUnit = isFahrenheit ? 'mph' : 'km/h';

  const conditionInfo = interpretWeatherCode(rawData.conditionCode);
  const clothing = generateClothingRecommendations(celsiusToFahrenheit(rawData.tempC), rawData.conditionCode, kmhToMph(rawData.windKmh));
  const themeClass = getThemeClass(rawData.conditionCode);

  const sunriseFormatted = formatTimeString(rawData.sunriseISO);
  const sunsetFormatted = formatTimeString(rawData.sunsetISO);

  const forecastList = [];
  if (rawData.forecastDaily) {
    const days = ["Today", "Tomorrow", "Day 3"];
    for (let i = 0; i < 3; i++) {
      const fHighC = rawData.forecastDaily.temperature_2m_max[i];
      const fLowC = rawData.forecastDaily.temperature_2m_min[i];
      const fCode = rawData.forecastDaily.weathercode[i];

      forecastList.push({
        dayLabel: days[i],
        icon: interpretWeatherCode(fCode).icon,
        high: isFahrenheit ? celsiusToFahrenheit(fHighC) : Math.round(fHighC),
        low: isFahrenheit ? celsiusToFahrenheit(fLowC) : Math.round(fLowC)
      });
    }
  }

  return {
    locationName: rawData.name,
    temperatureDisplay: `${temp}${unitSymbol}`,
    highLowDisplay: `${high}° / ${low}°`,
    windDisplay: `${wind} ${windUnit}`,
    conditionText: conditionInfo.description,
    icon: conditionInfo.icon,
    clothingText: clothing,
    sunriseText: sunriseFormatted,
    sunsetText: sunsetFormatted,
    themeClass: themeClass,
    forecast: forecastList
  };
}

/* ==========================================================================
   3. PRESENTATION / USER INTERFACE LAYER (DOM Updates & Events)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const errorBanner = document.getElementById('error-message');
  const toggleUnitBtn = document.getElementById('toggle-unit-btn');
  const presetButtons = document.querySelectorAll('.btn-preset');
  const loadingIndicator = document.getElementById('loading-indicator');
  const weatherBody = document.getElementById('weather-body');

  loadCityWeather("Rochester");

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cityInput.value.trim()) {
      loadCityWeather(cityInput.value.trim());
    }
  });

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.dataset.city;
      cityInput.value = city;
      loadCityWeather(city);
    });
  });

  toggleUnitBtn.addEventListener('click', () => {
    AppState.currentUnit = AppState.currentUnit === 'F' ? 'C' : 'F';
    toggleUnitBtn.textContent = AppState.currentUnit === 'F' ? 'Switch to °C' : 'Switch to °F';
    
    if (AppState.lastData) {
      renderWeatherUI(processWeatherData(AppState.lastData, AppState.currentUnit));
    }
  });

  async function loadCityWeather(city) {
    errorBanner.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    weatherBody.classList.add('hidden');

    try {
      const rawData = await fetchWeatherData(city);
      AppState.lastData = rawData;

      const viewModel = processWeatherData(rawData, AppState.currentUnit);
      renderWeatherUI(viewModel);
    } catch (err) {
      errorBanner.textContent = err.message || "Failed to load weather data.";
      errorBanner.classList.remove('hidden');
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }

  function renderWeatherUI(view) {
    // Dynamically apply weather background moving theme to document body
    document.body.className = view.themeClass;

    document.getElementById('location-name').textContent = view.locationName;
    document.getElementById('current-temp').textContent = view.temperatureDisplay;
    document.getElementById('weather-condition').textContent = view.conditionText;
    document.getElementById('weather-icon').textContent = view.icon;
    document.getElementById('temp-high-low').textContent = view.highLowDisplay;
    document.getElementById('wind-speed').textContent = view.windDisplay;
    document.getElementById('sunrise-time').textContent = view.sunriseText;
    document.getElementById('sunset-time').textContent = view.sunsetText;
    document.getElementById('clothing-recommendation').textContent = view.clothingText;

    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    if (view.forecast && view.forecast.length > 0) {
      view.forecast.forEach(item => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
          <div class="forecast-day">${item.dayLabel}</div>
          <div class="forecast-icon">${item.icon}</div>
          <div class="forecast-temps">${item.high}° / ${item.low}°</div>
        `;
        forecastGrid.appendChild(card);
      });
    }

    weatherBody.classList.remove('hidden');
  }
});
