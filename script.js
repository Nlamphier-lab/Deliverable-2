/* ==========================================================================
   1. DATA LAYER (Information Fetching & Storage)
   ========================================================================== */

/**
 * Predefined fallback dataset for reliable testing when offline or rate-limited
 */
const MOCK_WEATHER_DATABASE = {
  "rochester": { name: "Rochester, NY", tempC: 12, conditionCode: 3, humidity: 65, windKmh: 14, highC: 15, lowC: 7 },
  "new york": { name: "New York, NY", tempC: 18, conditionCode: 1, humidity: 55, windKmh: 10, highC: 21, lowC: 13 },
  "london": { name: "London, UK", tempC: 14, conditionCode: 61, humidity: 80, windKmh: 18, highC: 16, lowC: 10 },
  "tokyo": { name: "Tokyo, JP", tempC: 22, conditionCode: 0, humidity: 45, windKmh: 8, highC: 25, lowC: 17 }
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

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) throw new Error("Weather service unreachable.");
    const weatherData = await weatherResponse.json();

    return {
      name: locationLabel,
      tempC: weatherData.current_weather.temperature,
      conditionCode: weatherData.current_weather.weathercode,
      windKmh: weatherData.current_weather.windspeed,
      humidity: 60,
      highC: weatherData.daily.temperature_2m_max[0],
      lowC: weatherData.daily.temperature_2m_min[0],
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
   2. PROCESSING LAYER (Business Logic & Conversions)
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
 * Determines page background theme class based on WMO code
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

function generateWeatherAdvisory(tempF, windMph) {
  if (tempF <= 32) return "Coat & Gloves";
  if (tempF > 32 && tempF <= 55) return "Light Jacket";
  if (windMph > 20) return "Windy / Secure Items";
  if (tempF >= 85) return "Stay Hydrated";
  return "Pleasant / Mild";
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
  const advisory = generateWeatherAdvisory(celsiusToFahrenheit(rawData.tempC), kmhToMph(rawData.windKmh));
  const themeClass = getThemeClass(rawData.conditionCode);

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
    humidityDisplay: `${rawData.humidity}%`,
    conditionText: conditionInfo.description,
    icon: conditionInfo.icon,
    advisoryText: advisory,
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
    // Dynamically apply weather background theme to document body
    document.body.className = view.themeClass;

    document.getElementById('location-name').textContent = view.locationName;
    document.getElementById('current-temp').textContent = view.temperatureDisplay;
    document.getElementById('weather-condition').textContent = view.conditionText;
    document.getElementById('weather-icon').textContent = view.icon;
    document.getElementById('temp-high-low').textContent = view.highLowDisplay;
    document.getElementById('wind-speed').textContent = view.windDisplay;
    document.getElementById('humidity').textContent = view.humidityDisplay;
    document.getElementById('weather-advisory').textContent = view.advisoryText;

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
