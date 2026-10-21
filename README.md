# MGIS130 Deliverable 2: Personal Weather Dashboard

## Application Overview
A responsive, single-page web application that displays real-time weather conditions, clothing advisories, dynamic background weather themes, and 3-day forecasts for searched locations or quick preset cities[cite: 1].

## Three-Layer Architecture

### 1. Data Layer (Information Storage & Retrieval)
* **External REST API**: Fetches real-time weather metrics asynchronously from Open-Meteo's geocoding and weather forecast API endpoints using latitude and longitude coordinates[cite: 1].
* **Local Fallback Dataset**: Stores an in-memory JavaScript object (`MOCK_WEATHER_DATABASE`) containing preset data for cities like Rochester, NY, New York, NY, London, UK, and Tokyo, JP to guarantee app functionality if network calls fail[cite: 1].
* **Application State**: Retains raw retrieved meteorological data in memory (`AppState.lastData`) so unit conversions can be performed without re-fetching data from the API[cite: 1].

### 2. Processing Layer (Business Logic & Rules)
* **Unit Conversions**: Converts baseline Celsius temperatures into Fahrenheit using $T_F = \left(T_C \times \frac{9}{5}\right) + 32$ and converts wind speeds from km/h into mph[cite: 1].
* **Condition Code Interpretation**: Maps WMO weather status codes (e.g., `0` for Clear Sky, `61` for Rain, `71` for Snow) to human-readable descriptions and corresponding weather emojis[cite: 1].
* **Automated Advisory Rules**: Evaluates temperature and wind thresholds to calculate clothing recommendations (e.g., recommending "Coat & Gloves" when temperatures are 32°F or below)[cite: 1].
* **Dynamic Theme Calculation**: Evaluates weather condition codes to assign page background theme classes (`weather-clear`, `weather-cloudy`, `weather-rainy`, `weather-snowy`, `weather-thunderstorm`)[cite: 1].

### 3. Presentation Layer (User Interface)
* **Input Controls**: Renders a location search form, quick-city preset buttons, and an interactive °F / °C unit toggle button[cite: 1].
* **Weather Displays**: Displays current temperatures, location headers, condition badges, high/low range metrics, and a responsive 3-day forecast grid[cite: 1].
* **Visual Styling**: Applies dynamic full-screen background gradients matching the current weather condition and enforces sharp rectangular edges (0px border-radius) across all UI cards and buttons[cite: 1].

## Cross-Layer Ripple Effect Analysis
If a new data variable—such as Air Quality Index (AQI)—is added to the application[cite: 1]:
1. **Data Layer**: Must update `fetchWeatherData()` to request air quality metrics from the API endpoints and store the numeric score in `AppState`[cite: 1].
2. **Processing Layer**: Must implement an evaluation function `evaluateAQI(score)` that categorizes raw numerical scores into health safety levels (e.g., "Good", "Moderate", or "Unhealthy")[cite: 1].
3. **Presentation Layer**: Must update `index.html` and `script.js` to render a new metric card in the UI grid and adjust CSS styles to display the AQI status badge[cite: 1].

## "Done Looks Like" Checklist
- [x] Live weather data retrieval with location search[cite: 1]
- [x] Temperature conversion (°F / °C toggle)[cite: 1]
- [x] Weather status mapping with visual condition badges[cite: 1]
- [x] Dynamic background matching current weather condition[cite: 1]
- [x] Sharp rectangular box styling (0px border-radius)
