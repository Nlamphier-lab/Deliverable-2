/* Custom Properties / Design Tokens */
:root {
  --primary: #1E3A8A;
  --primary-hover: #1E40AF;
  --bg-color: #F1F5F9;
  --card-bg: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border-color: #CBD5E1;
  --accent-blue: #0284C7;
  --error-bg: #FEE2E2;
  --error-text: #991B1B;
  --radius: 0px; /* Sharp edges for all components */
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Keyframes for Smooth Animated Moving Backgrounds */
@keyframes movingGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.5;
  padding: 20px 12px;
  min-height: 100vh;
  transition: background-color 0.5s ease, color 0.3s ease;
  background-size: 300% 300%;
}

/* Moving Dynamic Background Themes */
body.weather-clear {
  background: linear-gradient(-45deg, #7DD3FC, #BAE6FD, #E0F2FE, #38BDF8);
  background-size: 300% 300%;
  animation: movingGradient 14s ease infinite;
}

body.weather-cloudy {
  background: linear-gradient(-45deg, #94A3B8, #CBD5E1, #E2E8F0, #64748B);
  background-size: 300% 300%;
  animation: movingGradient 16s ease infinite;
}

body.weather-rainy {
  background: linear-gradient(-45deg, #475569, #64748B, #94A3B8, #334155);
  background-size: 300% 300%;
  animation: movingGradient 12s ease infinite;
}

body.weather-snowy {
  background: linear-gradient(-45deg, #CBD5E1, #E2E8F0, #F8FAFC, #94A3B8);
  background-size: 300% 300%;
  animation: movingGradient 18s ease infinite;
}

body.weather-thunderstorm {
  background: linear-gradient(-45deg, #1E293B, #334155, #475569, #0F172A);
  background-size: 300% 300%;
  animation: movingGradient 10s ease infinite;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
}

.app-header {
  text-align: center;
  margin-bottom: 20px;
}

.app-header h1 {
  font-size: 1.8rem;
  color: var(--primary);
}

body.weather-thunderstorm .app-header h1,
body.weather-rainy .app-header h1 {
  color: #F8FAFC;
}

.app-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

body.weather-thunderstorm .app-header p,
body.weather-rainy .app-header p {
  color: #CBD5E1;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .main-content {
    grid-template-columns: 1fr 1.2fr;
  }
}

.card {
  background: var(--card-bg);
  border-radius: var(--radius); /* Sharp corners */
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.card h2 {
  font-size: 1.2rem;
  margin-bottom: 14px;
  color: var(--primary);
  border-bottom: 2px solid var(--bg-color);
  padding-bottom: 6px;
}

/* Presets & Search */
.presets-container {
  margin-bottom: 14px;
}

.presets-container label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  display: block;
  margin-bottom: 6px;
}

.preset-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-preset {
  background-color: #E0F2FE;
  color: #0369A1;
  border: 1px solid #BAE6FD;
  padding: 6px 10px;
  border-radius: var(--radius); /* Sharp corners */
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-preset:hover {
  background-color: #BAE6FD;
}

.search-form {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.search-form .form-group {
  flex: 1;
}

.search-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius); /* Sharp corners */
  font-size: 0.95rem;
}

.search-form input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius); /* Sharp corners */
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.unit-toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.btn-toggle {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius); /* Sharp corners */
  cursor: pointer;
  font-weight: 600;
  color: var(--text-main);
}

.btn-toggle:hover {
  background-color: #E2E8F0;
}

.error-banner {
  background-color: var(--error-bg);
  color: var(--error-text);
  padding: 10px;
  border-radius: var(--radius); /* Sharp corners */
  font-size: 0.85rem;
  margin-top: 12px;
}

/* Display Section */
.display-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.weather-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.main-temp-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%);
  color: white;
  padding: 20px;
  border-radius: var(--radius); /* Sharp corners */
  margin-bottom: 12px;
}

.weather-icon {
  font-size: 3.2rem;
}

.current-temp {
  font-size: 2.2rem;
  font-weight: 700;
  display: block;
  line-height: 1.1;
}

.weather-condition {
  font-size: 1rem;
  opacity: 0.9;
}

/* Recommended Clothing Styling */
.clothing-card {
  background-color: #F8FAFC;
  border: 1px solid var(--border-color);
  padding: 12px;
  margin-bottom: 12px;
  border-radius: var(--radius);
}

.clothing-value {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-card {
  background: var(--bg-color);
  padding: 10px 12px;
  border-radius: var(--radius); /* Sharp corners */
}

.metric-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  display: block;
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

/* Forecast Grid */
.forecast-section {
  margin-top: 20px;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.forecast-card {
  background: var(--bg-color);
  padding: 12px;
  border-radius: var(--radius); /* Sharp corners */
  text-align: center;
}

.forecast-day {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.forecast-icon {
  font-size: 1.8rem;
  margin: 4px 0;
}

.forecast-temps {
  font-size: 0.9rem;
  font-weight: 600;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-style: italic;
}

.hidden {
  display: none !important;
}

.app-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

body.weather-thunderstorm .app-footer,
body.weather-rainy .app-footer {
  color: #CBD5E1;
}
