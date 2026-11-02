
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logoutUser,
  updateUser,
} from "../services/auth";
import { getDestinations } from "../services/destinationService";

const TRIPS_KEY = "travelSmartTrips";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// Get an image from your existing destination list first.
function getLocalImage(destination) {
  const destinations = getDestinations();

  const match = destinations.find((item) => {
    const search = destination.trim().toLowerCase();

    return (
      item.name?.toLowerCase() === search ||
      item.location?.toLowerCase() === search ||
      item.country?.toLowerCase() === search ||
      item.id?.toLowerCase() === search
    );
  });

  return match?.image || null;
}

// Fetch an image using Wikipedia when no local image exists.
async function fetchDestinationImage(destination) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(destination + " travel")}&limit=5`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const pages = data.pages || [];

    const cleanName = destination.trim().toLowerCase();

    const match =
      pages.find(
        (page) => page.title?.toLowerCase() === cleanName
      ) ||
      pages.find((page) =>
        page.title?.toLowerCase().includes(cleanName)
      ) ||
      pages.find((page) => page.thumbnail?.url);

    return match?.thumbnail?.url || null;
  } catch (error) {
    console.error("Image API error:", error);
    return null;
  }
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getCurrentUser());
  const [name, setName] = useState(() => getCurrentUser()?.name || "");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [trips, setTrips] = useState(() => {
    const currentUser = getCurrentUser();

    if (!currentUser?.email) return [];

    const allTrips = readStorage(TRIPS_KEY, []);

    return (Array.isArray(allTrips) ? allTrips : []).filter(
      (trip) =>
        (trip.owner || trip.email || "").toLowerCase() ===
        currentUser.email.toLowerCase()
    );
  });

  const [images, setImages] = useState({});
  const [editTripId, setEditTripId] = useState(null);
  const [tripForm, setTripForm] = useState({});

  // Fetch images for all saved trips.
  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      for (const trip of trips) {
        if (!trip.destination) continue;

        const localImage = getLocalImage(trip.destination);

        if (localImage) {
          if (!cancelled) {
            setImages((previous) => ({
              ...previous,
              [trip.id]: localImage,
            }));
          }
          continue;
        }

        const apiImage = await fetchDestinationImage(
          trip.destination
        );

        if (!cancelled && apiImage) {
          setImages((previous) => ({
            ...previous,
            [trip.id]: apiImage,
          }));
        }
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [trips]);

  function saveName(event) {
    event.preventDefault();

    const newName = name.trim();

    if (!newName) {
      setMessage("Please enter your name.");
      return;
    }

    const updatedUser = {
      ...user,
      name: newName,
    };

    updateUser(updatedUser);

    setUser(updatedUser);
    setName(newName);
    setEditing(false);
    setMessage("Profile name updated successfully.");
  }

  function startEditingTrip(trip) {
    setEditTripId(trip.id);

    setTripForm({
      destination: trip.destination || "",
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      travelers: trip.travelers || 1,
      budget: trip.budget || "",
    });
  }

  function updateTripField(event) {
    setTripForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function saveTrip(event) {
    event.preventDefault();

    if (!tripForm.destination.trim()) {
      alert("Please enter a destination.");
      return;
    }

    if (
      tripForm.startDate &&
      tripForm.endDate &&
      tripForm.endDate <= tripForm.startDate
    ) {
      alert("The end date must be after the start date.");
      return;
    }

    const allTrips = readStorage(TRIPS_KEY, []);

    const updatedTrips = allTrips.map((trip) => {
      if (String(trip.id) !== String(editTripId)) {
        return trip;
      }

      const duration =
        tripForm.startDate && tripForm.endDate
          ? Math.round(
              (new Date(tripForm.endDate) -
                new Date(tripForm.startDate)) /
                86400000
            )
          : trip.duration;

      return {
        ...trip,
        ...tripForm,
        destination: tripForm.destination.trim(),
        travelers: Number(tripForm.travelers),
        budget: Number(tripForm.budget),
        duration,
      };
    });

    localStorage.setItem(
      TRIPS_KEY,
      JSON.stringify(updatedTrips)
    );

    const currentEmail = user.email.toLowerCase();

    setTrips(
      updatedTrips.filter(
        (trip) =>
          (trip.owner || trip.email || "").toLowerCase() ===
          currentEmail
      )
    );

    setEditTripId(null);
    setMessage("Trip updated successfully.");
  }

  function deleteTrip(tripId) {
    if (
      !window.confirm("Are you sure you want to delete this trip?")
    ) {
      return;
    }

    const allTrips = readStorage(TRIPS_KEY, []);

    const updatedTrips = allTrips.filter(
      (trip) => String(trip.id) !== String(tripId)
    );

    localStorage.setItem(
      TRIPS_KEY,
      JSON.stringify(updatedTrips)
    );

    setTrips((previous) =>
      previous.filter(
        (trip) => String(trip.id) !== String(tripId)
      )
    );

    setMessage("Trip deleted successfully.");
  }

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  if (!user) {
    return (
      <main style={styles.container}>
        <h1>Please log in to view your profile.</h1>
        <Link to="/login">Go to Login</Link>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>YOUR TRAVEL SPACE</p>
          <h1>My Profile</h1>
          <p>Manage your account and all your adventures.</p>
        </div>

        <button
          style={styles.secondaryButton}
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      {message && (
        <p role="status" style={styles.message}>
          {message}
        </p>
      )}

      <section style={styles.card}>
        <h2>Account details</h2>

        {!editing ? (
          <>
            <div style={styles.avatar}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <h3>{user.name}</h3>
            <p>{user.email}</p>

            <button
              style={styles.button}
              onClick={() => {
                setName(user.name || "");
                setEditing(true);
                setMessage("");
              }}
            >
              Edit profile name
            </button>
          </>
        ) : (
          <form onSubmit={saveName}>
            <label style={styles.label} htmlFor="profileName">
              Your name
            </label>

            <input
              id="profileName"
              style={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />

            <p>Email: {user.email}</p>

            <button style={styles.button} type="submit">
              Save changes
            </button>{" "}

            <button
              style={styles.secondaryButton}
              type="button"
              onClick={() => {
                setEditing(false);
                setName(user.name || "");
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </section>

      <section style={styles.tripsSection}>
        <div style={styles.header}>
          <div>
            <h2>My Trips</h2>
            <p>{trips.length} saved trip(s)</p>
          </div>

          <button
            style={styles.button}
            onClick={() => navigate("/plan-trip")}
          >
            + Plan a trip
          </button>
        </div>

        {trips.length === 0 && (
          <div style={styles.card}>
            <h3>No trips yet</h3>
            <p>Your saved trips will appear here.</p>

            <button
              style={styles.button}
              onClick={() => navigate("/plan-trip")}
            >
              Create your first trip
            </button>
          </div>
        )}

        <div style={styles.tripGrid}>
          {trips.map((trip) => (
            <article key={trip.id} style={styles.tripCard}>
              {editTripId === trip.id ? (
                <form onSubmit={saveTrip}>
                  <h3>Edit trip</h3>

                  <label style={styles.label}>Destination</label>
                  <input
                    style={styles.input}
                    name="destination"
                    value={tripForm.destination}
                    onChange={updateTripField}
                    required
                  />

                  <label style={styles.label}>Start date</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="startDate"
                    value={tripForm.startDate}
                    onChange={updateTripField}
                  />

                  <label style={styles.label}>End date</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="endDate"
                    value={tripForm.endDate}
                    onChange={updateTripField}
                  />

                  <label style={styles.label}>Travelers</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="travelers"
                    min="1"
                    value={tripForm.travelers}
                    onChange={updateTripField}
                    required
                  />

                  <label style={styles.label}>Budget (₹)</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="budget"
                    min="1"
                    value={tripForm.budget}
                    onChange={updateTripField}
                    required
                  />

                  <button style={styles.button} type="submit">
                    Save trip
                  </button>{" "}

                  <button
                    style={styles.secondaryButton}
                    type="button"
                    onClick={() => setEditTripId(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div style={styles.imageWrapper}>
                    {images[trip.id] ? (
                      <img
                        src={images[trip.id]}
                        alt={trip.destination}
                        style={styles.tripImage}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        <span>✈</span>
                        <p>Finding destination image...</p>
                      </div>
                    )}
                  </div>

                  <div style={styles.tripContent}>
                    <h3>✈ {trip.destination}</h3>

                    <p>
                      {trip.startDate || "Start date not set"}
                      {trip.endDate ? ` — ${trip.endDate}` : ""}
                    </p>

                    <p>Duration: {trip.duration || "—"} days</p>
                    <p>Travelers: {trip.travelers || 1}</p>

                    <p>
                      Budget:{" "}
                      {trip.budget
                        ? `₹${Number(trip.budget).toLocaleString("en-IN")}`
                        : "Not set"}
                    </p>

                    {trip.itinerary && (
                      <details>
                        <summary>View AI itinerary</summary>
                        <pre style={styles.itinerary}>
                          {typeof trip.itinerary === "string"
                            ? trip.itinerary
                            : JSON.stringify(trip.itinerary, null, 2)}
                        </pre>
                      </details>
                    )}

                    <button
                      style={styles.button}
                      onClick={() => startEditingTrip(trip)}
                    >
                      Edit trip
                    </button>{" "}

                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteTrip(trip.id)}
                    >
                      Delete trip
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "24px",
    color: "#20302b",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#17836a",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  card: {
    padding: "28px",
    border: "1px solid #e1e9e5",
    borderRadius: "18px",
    marginBottom: "24px",
    background: "#ffffff",
  },
  avatar: {
    width: "64px",
    height: "64px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#d8f3e9",
    color: "#126b54",
    fontSize: "28px",
    fontWeight: "bold",
  },
  button: {
    background: "#16785f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
    marginTop: "8px",
  },
  secondaryButton: {
    background: "#edf3f0",
    color: "#20302b",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "#b42332",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    cursor: "pointer",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginTop: "14px",
    marginBottom: "6px",
  },
  input: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "500px",
    padding: "12px",
    border: "1px solid #ccd8d2",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  message: {
    padding: "12px",
    background: "#e5f7ed",
    borderRadius: "8px",
  },
  tripsSection: {
    marginTop: "36px",
  },
  tripGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  tripCard: {
    overflow: "hidden",
    border: "1px solid #e1e9e5",
    borderRadius: "16px",
    background: "#ffffff",
  },
  imageWrapper: {
    width: "100%",
    height: "210px",
    background: "#eaf3ee",
  },
  tripImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#16785f",
    fontSize: "28px",
  },
  tripContent: {
    padding: "22px",
  },
  itinerary: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
};
