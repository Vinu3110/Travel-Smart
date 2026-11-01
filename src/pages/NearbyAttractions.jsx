
import React, { useState } from "react";
import "./TravelTools.css";

function NearbyAttractions() {
  const [city, setCity] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const findAttractions = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      setMessage("Please enter a city name.");
      return;
    }

    setLoading(true);
    setPlaces([]);
    setMessage("Finding attractions...");

    try {
      // Step 1: Find city coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Could not search for this city.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Try another name.");
      }

      const location = geoData.results[0];
      const { latitude, longitude } = location;

      // Step 2: Search OpenStreetMap for attractions
      const query = `
        [out:json][timeout:25];
        (
          node["tourism"~"attraction|museum|viewpoint|artwork"](around:10000,${latitude},${longitude});
          way["tourism"~"attraction|museum|viewpoint"](around:10000,${latitude},${longitude});
          relation["tourism"~"attraction|museum|viewpoint"](around:10000,${latitude},${longitude});
          node["historic"](around:10000,${latitude},${longitude});
          way["historic"](around:10000,${latitude},${longitude});
          node["leisure"="park"](around:10000,${latitude},${longitude});
          way["leisure"="park"](around:10000,${latitude},${longitude});
        );
        out center tags;
      `;

      const osmResponse = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: new URLSearchParams({ data: query })
        }
      );

      if (!osmResponse.ok) {
        throw new Error("Attraction service is busy. Please try again later.");
      }

      const osmData = await osmResponse.json();

      const results = (osmData.elements || [])
        .map((place) => {
          const tags = place.tags || {};
          const lat = place.lat ?? place.center?.lat;
          const lon = place.lon ?? place.center?.lon;

          return {
            id: `${place.type}-${place.id}`,
            name: tags.name || tags["name:en"] || "",
            type:
              tags.tourism ||
              tags.historic ||
              tags.leisure ||
              "Attraction",
            lat,
            lon
          };
        })
        .filter((place) => place.name && place.lat && place.lon);

      setPlaces(results);
      setMessage(
        results.length
          ? `Found ${results.length} places near ${location.name}.`
          : "No named attractions found. Try another city."
      );
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-tools">
      <h1>Nearby Attractions</h1>
      <p className="tool-description">
        Discover tourist attractions, parks, museums and historic places.
      </p>

      <div className="tool-card">
        <form className="tool-form" onSubmit={findAttractions}>
          <input
            className="tool-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city, e.g. Vijayawada"
          />
          <button className="tool-button" disabled={loading}>
            {loading ? "Searching..." : "Find Attractions"}
          </button>
        </form>

        {message && <p className="tool-message">{message}</p>}
      </div>

      <div className="tool-list">
        {places.map((place) => (
          <div className="tool-item" key={place.id}>
            <h3>{place.name}</h3>
            <p>Type: {place.type}</p>
            <a
              href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`}
              target="_blank"
              rel="noreferrer"
            >
              View on OpenStreetMap
            </a>
          </div>
        ))}
      </div>

      <p className="tool-message">
        Attraction data © OpenStreetMap contributors.
      </p>
    </div>
  );
}

export default NearbyAttractions;
