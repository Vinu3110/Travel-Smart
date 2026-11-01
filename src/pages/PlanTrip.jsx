
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { getDestinations } from "../services/destinationService";
import "./PlanTrip.css";

function readStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round((end - start) / 86400000);
}

function findDestinationImage(destination) {
  const places = getDestinations();
  const search = destination.trim().toLowerCase();

  const match = places.find((place) =>
    [
      place.name,
      place.country,
      place.location,
      place.id
    ].some((value) => value?.toLowerCase() === search)
  );

  return match || null;
}

export default function PlanTrip() {
  const navigate = useNavigate();
  const today = getTodayString();

  const [trip, setTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "30000"
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const duration = calculateDuration(
    trip.startDate,
    trip.endDate
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setTrip((previous) => {
      const updated = {
        ...previous,
        [name]: value
      };

      if (
        name === "startDate" &&
        updated.endDate &&
        updated.endDate <= value
      ) {
        updated.endDate = "";
      }

      return updated;
    });

    setMessage("");
    setMessageType("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const currentUser = getCurrentUser();

    if (!currentUser?.email) {
      setMessage("Please log in before saving your trip.");
      setMessageType("error");
      return;
    }

    if (!trip.destination.trim()) {
      setMessage("Please enter your destination.");
      setMessageType("error");
      return;
    }

    if (!trip.startDate || !trip.endDate) {
      setMessage("Please select both your start and end dates.");
      setMessageType("error");
      return;
    }

    if (trip.startDate <= today) {
      setMessage("Your trip must start after today.");
      setMessageType("error");
      return;
    }

    if (trip.endDate <= trip.startDate) {
      setMessage("The end date must be after the start date.");
      setMessageType("error");
      return;
    }

    if (Number(trip.travelers) < 1) {
      setMessage("Please select at least one traveler.");
      setMessageType("error");
      return;
    }

    if (!trip.budget || Number(trip.budget) <= 0) {
      setMessage("Please enter a valid budget.");
      setMessageType("error");
      return;
    }

    const destinationInfo = findDestinationImage(trip.destination);

    const email = currentUser.email.trim().toLowerCase();

    const newTrip = {
      id: String(Date.now()),
      destination: trip.destination.trim(),
      destinationName: destinationInfo?.name || trip.destination.trim(),
      country: destinationInfo?.country || "",
      location: destinationInfo?.location || trip.destination.trim(),
      image: destinationInfo?.image || "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration,
      travelers: Number(trip.travelers),
      budget: Number(trip.budget),
      owner: email,
      email,
      createdAt: new Date().toISOString()
    };

    try {
      const storedTrips = readStorage("travelSmartTrips", []);
      const allTrips = Array.isArray(storedTrips) ? storedTrips : [];

      localStorage.setItem(
        "travelSmartTrips",
        JSON.stringify([...allTrips, newTrip])
      );

      setMessage("Your trip plan has been saved successfully!");
      setMessageType("success");

      setTrip({
        destination: "",
        startDate: "",
        endDate: "",
        travelers: "2",
        budget: "30000"
      });
    } catch (error) {
      console.error("Could not save trip:", error);
      setMessage("Unable to save your trip. Please try again.");
      setMessageType("error");
    }
  }

  return (
    <main className="trip-page">
      <section className="trip-main">
        <div className="trip-intro">
          <span className="trip-eyebrow">
            ✧ YOUR JOURNEY, YOUR WAY
          </span>

          <h1>Let's plan something unforgettable.</h1>

          <p className="trip-description">
            Choose your destination, select your travel dates, and
            organize your next adventure with Travel Smart.
          </p>

          <div className="trip-benefits">
            <div className="trip-benefit">
              <span className="trip-benefit-icon">✈</span>
              <div>
                <strong>Choose your destination</strong>
                <p>Pick a place you have always wanted to visit.</p>
              </div>
            </div>

            <div className="trip-benefit">
              <span className="trip-benefit-icon">▦</span>
              <div>
                <strong>Select your travel dates</strong>
                <p>Plan a future trip with a start and end date.</p>
              </div>
            </div>

            <div className="trip-benefit">
              <span className="trip-benefit-icon">₹</span>
              <div>
                <strong>Manage your budget</strong>
                <p>Set an estimated budget for your adventure.</p>
              </div>
            </div>
          </div>
        </div>

        <form className="trip-form-card" onSubmit={handleSubmit}>
          <div className="trip-form-heading">
            <h2>Plan your trip</h2>
            <p>Fill in your travel details below.</p>
          </div>

          <div className="trip-field">
            <label htmlFor="destination">✈ Destination</label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="e.g. Japan, Bali, Paris"
              value={trip.destination}
              onChange={handleChange}
              required
            />
          </div>

          <div className="trip-field-row">
            <div className="trip-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                min={today}
                value={trip.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="trip-field">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={trip.startDate || today}
                value={trip.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="trip-duration">
            <span>Trip Duration</span>
            <strong>
              {duration > 0
                ? `${duration} ${duration === 1 ? "day" : "days"}`
                : "Select your travel dates"}
            </strong>
          </div>

          <div className="trip-field-row">
            <div className="trip-field">
              <label htmlFor="travelers">Travelers</label>
              <select
                id="travelers"
                name="travelers"
                value={trip.travelers}
                onChange={handleChange}
              >
                <option value="1">1 traveler</option>
                <option value="2">2 travelers</option>
                <option value="3">3 travelers</option>
                <option value="4">4 travelers</option>
                <option value="5">5 travelers</option>
                <option value="6">6 travelers</option>
              </select>
            </div>

            <div className="trip-field">
              <label htmlFor="budget">Budget (₹)</label>
              <input
                id="budget"
                name="budget"
                type="number"
                min="1"
                placeholder="30000"
                value={trip.budget}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button className="trip-submit-button" type="submit">
            Create my trip plan <span>→</span>
          </button>

          {message && (
            <p
              className={`trip-message ${
                messageType === "success" ? "trip-success" : "trip-error"
              }`}
              role="status"
            >
              {message}
            </p>
          )}

          <p className="trip-note">
            Select dates after today. Your trip details are stored in
            this browser and do not include live bookings or prices.
          </p>

          {messageType === "success" && (
            <button
              type="button"
              className="trip-view-button"
              onClick={() => navigate("/profile")}
            >
              View My Trips →
            </button>
          )}
        </form>
      </section>

      <footer className="trip-footer">
        <div className="trip-footer-brand">
          <span className="trip-footer-icon">✈</span>
          <strong>Travel Smart</strong>
        </div>
        <p>Make memories, one journey at a time.</p>
      </footer>
    </main>
  );
}
