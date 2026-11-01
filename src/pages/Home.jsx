
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WeatherForecast from "./WeatherForecast";
import PlanTrip from "./PlanTrip";
import destinations from "../services/destinationService";

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const fallbackImage =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80";

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const [favorites, setFavorites] = useState(() =>
    readStorage("favorites", [])
  );

  // Filter featured destinations
  const filteredDestinations = destinations.filter((destination) => {
    const query = activeSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query) ||
      destination.location.toLowerCase().includes(query) ||
      destination.category.toLowerCase().includes(query)
    );
  });

  // Search places using Wikipedia API
  async function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      setActiveSearch("");
      setPlaceResults([]);
      setPlaceError("Please enter a place name.");
      return;
    }

    setActiveSearch(query);
    setPlaceLoading(true);
    setPlaceError("");
    setPlaceResults([]);

    try {
      const url =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        "&gsrsearch=" +
        encodeURIComponent(query) +
        "&gsrnamespace=0" +
        "&gsrlimit=6" +
        "&prop=pageimages%7Cextracts" +
        "&piprop=thumbnail" +
        "&pithumbsize=600" +
        "&exintro=1" +
        "&explaintext=1" +
        "&format=json" +
        "&origin=*";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Unable to search places.");
      }

      const data = await response.json();
      const pages = Object.values(data.query?.pages || {});

      const results = pages.map((page) => ({
        id: page.pageid,
        name: page.title,
        description:
          page.extract?.slice(0, 220) ||
          `Discover ${page.title} and learn more about this place.`,
        image: page.thumbnail?.source || fallbackImage,
        link: `https://en.wikipedia.org/?curid=${page.pageid}`,
      }));

      setPlaceResults(results);

      if (results.length === 0) {
        setPlaceError("No places found. Try another search.");
      }

      setTimeout(() => {
        document
          .getElementById("place-search-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch {
      setPlaceError(
        "Unable to load places. Check your internet connection and try again."
      );
    } finally {
      setPlaceLoading(false);
    }
  }

  // Add or remove favorites
  function toggleFavorite(destinationId) {
    setFavorites((previous) => {
      const updated = previous.includes(destinationId)
        ? previous.filter((id) => id !== destinationId)
        : [...previous, destinationId];

      localStorage.setItem("favorites", JSON.stringify(updated));

      return updated;
    });
  }

  // Open the existing trip planner
  function openTripPlanner(destination = "") {
    navigate("/plan-trip", {
      state: {
        destination,
      },
    });
  }

  return (
    <main className="home-page">

      {/* HOME HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow">
            YOUR NEXT ADVENTURE STARTS HERE
          </span>

          <h1>
            Explore the World
            <br />
            with Travel Smart
          </h1>

          <p>
            Discover beautiful destinations, explore new places,
            and plan your next unforgettable journey.
          </p>

          {/* PLACE SEARCH */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-field">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search places, cities, or countries..."
                aria-label="Search places"
              />
            </div>

            <button className="search-button" type="submit">
              {placeLoading ? "Searching..." : "Search Places"}
            </button>
          </form>

          {/* HERO BUTTONS */}
          <div className="hero-actions">
            <button
              type="button"
              className="button"
              onClick={() =>
                document
                  .getElementById("destinations")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Destinations
            </button>

            <button
              type="button"
              className="button"
              onClick={() => openTripPlanner()}
            >
              Plan My Trip
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section id="destinations" className="section destination-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">EXPLORE THE WORLD</span>
            <h2>Popular Destinations</h2>
            <p className="section-subtitle">
              Find inspiration for your next trip.
            </p>
          </div>
        </div>

        {filteredDestinations.length === 0 ? (
          <p className="api-search-message">
            No matching destinations in our featured collection.
            Try the place search above to discover more results.
          </p>
        ) : (
          <div className="destination-grid">
            {filteredDestinations.map((destination) => (
              <article className="destination-card" key={destination.id}>
                <div className="destination-gallery">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    loading="lazy"
                  />

                  <span className="destination-category">
                    {destination.category}
                  </span>

                  <button
                    type="button"
                    className={`favorite-button ${
                      favorites.includes(destination.id) ? "favorited" : ""
                    }`}
                    aria-label={
                      favorites.includes(destination.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    onClick={() => toggleFavorite(destination.id)}
                  >
                    {favorites.includes(destination.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="destination-info">
                  <div className="destination-heading">
                    <h3>{destination.name}</h3>
                    <p className="destination-country">
                      {destination.location}
                    </p>
                  </div>

                  <p className="destination-rating">
                    ★ {destination.rating}
                  </p>
                </div>

                <p className="destination-description">
                  {destination.description}
                </p>

                <div className="destination-bottom">
                  <div className="destination-price">
                    <span>Estimated budget</span>
                    <strong>{destination.price}</strong>
                  </div>

                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => openTripPlanner(destination.location)}
                  >
                    Plan Trip
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>


      {/* READY FOR YOUR NEXT ADVENTURE */}
      <section className="bottom-cta">
        <div className="bottom-cta-content">
          <span className="eyebrow">MAKE IT HAPPEN</span>

          <h2>Ready for Your Next Adventure?</h2>

          <p>
            Choose your destination, set your budget, and save your travel plans.
          </p>

          <button
            type="button"
            className="button bottom-cta-button"
            onClick={() => openTripPlanner()}
          >
            Plan Your Trip
          </button>
        </div>
      </section>

      {/* WEATHER FORECAST */}
      <section className="section weather-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">CHECK BEFORE YOU GO</span>
            <h2>Weather Forecast</h2>
            <p className="section-subtitle">
              Check the weather before planning your adventure.
            </p>
          </div>
        </div>

        <WeatherForecast />
      </section>

      {/* PLAN YOUR TRIP */}
      <section id="home-trip-planner" className="home-trip-planner">
        <PlanTrip />
      </section>

      {/* PLACE SEARCH RESULTS */}
      {(placeLoading || placeError || placeResults.length > 0) && (
        <section
          id="place-search-results"
          className="section destination-section"
        >
          <div className="section-title-row">
            <div>
              <span className="eyebrow">DISCOVER NEW PLACES</span>
              <h2>Search Results: {activeSearch}</h2>
              <p className="section-subtitle">
                Explore places found through our search service.
              </p>
            </div>
          </div>

          {placeLoading && (
            <p className="api-search-message" role="status">
              Searching for places...
            </p>
          )}

          {placeError && (
            <p className="api-search-message" role="status">
              {placeError}
            </p>
          )}

          {!placeLoading && placeResults.length > 0 && (
            <div className="destination-grid">
              {placeResults.map((place) => (
                <article className="destination-card" key={place.id}>
                  <div className="destination-gallery">
                    <img
                      src={place.image}
                      alt={place.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                    />

                    <span className="destination-category">
                      Search Result
                    </span>
                  </div>

                  <div className="destination-info">
                    <div className="destination-heading">
                      <h3>{place.name}</h3>
                      <p className="destination-country">
                        Discover this place
                      </p>
                    </div>
                  </div>

                  <p className="destination-description">
                    {place.description}
                  </p>

                  <div className="destination-bottom">
                    <a
                      className="button button-small"
                      href={place.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More
                    </a>

                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => openTripPlanner(place.name)}
                    >
                      Plan Trip
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Home;
