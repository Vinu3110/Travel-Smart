
import { useState } from "react";
import "./WeatherForecast.css";

function getWeather(code) {
  if (code === 0) return { icon: "☀️", text: "Clear sky" };
  if (code === 1) return { icon: "🌤️", text: "Mostly clear" };
  if (code === 2) return { icon: "⛅", text: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", text: "Cloudy" };
  if ([45, 48].includes(code)) return { icon: "🌫️", text: "Foggy" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { icon: "🌦️", text: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { icon: "🌧️", text: "Rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { icon: "❄️", text: "Snow" };
  if ([95, 96, 99].includes(code))
    return { icon: "⛈️", text: "Thunderstorm" };

  return { icon: "🌍", text: "Weather information" };
}

export default function WeatherForecast() {
  const [city, setCity] = useState("");
  const [place, setPlace] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getForecast(event) {
    event.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Could not search for this city.");
      }

      const geoData = await geoResponse.json();
      const location = geoData.results?.[0];

      if (!location) {
        throw new Error("City not found. Please try another name.");
      }

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&forecast_days=5&timezone=auto`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Could not load the weather forecast.");
      }

      const data = await response.json();

      setPlace(
        `${location.name}${location.admin1 ? ", " + location.admin1 : ""}, ${location.country}`
      );

      setWeather(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const currentWeather = weather
    ? getWeather(weather.current.weather_code)
    : null;

  return (
    <section className="weather-section" id="weather-forecast">
      <div className="weather-heading">
        <span className="weather-eyebrow">✦ LIVE WEATHER</span>
        <h2>Weather Forecast</h2>
        <p>Discover the weather before your next adventure.</p>
      </div>

      <form className="weather-search" onSubmit={getForecast}>
        <input
          type="text"
          placeholder="🔍  Enter a city, e.g. Vijayawada"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          aria-label="City name"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Check Weather ☀️"}
        </button>
      </form>

      {error && (
        <p className="weather-error" role="alert">
          {error}
        </p>
      )}

      {weather && (
        <div className="weather-results">
          <div className="weather-current">
            <div className="current-weather-top">
              <div>
                <p className="weather-location">📍 {place}</p>
                <p className="current-description">
                  {currentWeather.text}
                </p>
              </div>

              <span className="current-weather-icon" aria-hidden="true">
                {currentWeather.icon}
              </span>
            </div>

            <h3 className="current-temperature">
              {Math.round(weather.current.temperature_2m)}
              <span>°C</span>
            </h3>

            <p className="feels-like">
              Feels like {Math.round(weather.current.apparent_temperature)}°C
            </p>

            <div className="weather-details">
              <div className="weather-detail">
                <span>💧</span>
                <div>
                  <small>Humidity</small>
                  <strong>{weather.current.relative_humidity_2m}%</strong>
                </div>
              </div>

              <div className="weather-detail">
                <span>💨</span>
                <div>
                  <small>Wind speed</small>
                  <strong>{weather.current.wind_speed_10m} km/h</strong>
                </div>
              </div>

              <div className="weather-detail">
                <span>🌡️</span>
                <div>
                  <small>Feels like</small>
                  <strong>
                    {Math.round(weather.current.apparent_temperature)}°C
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <h3 className="forecast-title">Your 5-Day Forecast</h3>
          <p className="forecast-subtitle">
            Plan your journey with confidence.
          </p>

          <div className="forecast-grid">
            {weather.daily.time.map((date, index) => {
              const dailyWeather = getWeather(
                weather.daily.weather_code[index]
              );

              return (
                <article className="forecast-card" key={date}>
                  <p className="forecast-date">
                    {new Date(date + "T12:00:00").toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    )}
                  </p>

                  <span className="forecast-icon" aria-hidden="true">
                    {dailyWeather.icon}
                  </span>

                  <p className="forecast-condition">
                    {dailyWeather.text}
                  </p>

                  <div className="forecast-temperatures">
                    <strong>
                      {Math.round(weather.daily.temperature_2m_max[index])}°
                    </strong>
                    <span>
                      {Math.round(weather.daily.temperature_2m_min[index])}°
                    </span>
                  </div>

                  <p className="forecast-label">High / Low</p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <p className="weather-credit">
        🌍 Weather data provided by Open-Meteo
      </p>
    </section>
  );
}
