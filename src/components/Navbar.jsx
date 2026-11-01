
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Compass,
  LogOut,
  MapPin,
  Coins,
  Luggage,
  Wallet,
  MessageCircle,
  ChevronDown
} from "lucide-react";

import { getCurrentUser, logoutUser } from "../services/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setToolsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setToolsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  function openProtectedPage(path) {
    setToolsOpen(false);

    if (!user) {
      navigate("/login", {
        state: { from: path }
      });
      return;
    }

    navigate(path);
  }

  function goToDestinations() {
    setToolsOpen(false);

    if (location.pathname === "/") {
      document.getElementById("destinations")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      navigate("/", {
        state: { scrollTo: "destinations" }
      });
    }
  }

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <header className="navbar">

      <Link to="/" className="brand">
        <span className="brand-icon">
          <Compass size={22} />
        </span>

        <span className="brand-text">
          <span>TravelSmart</span>
        </span>
      </Link>

      <nav className="nav-links">

        <Link to="/" className={`nav-link ${isActive("/")}`}>
          Home
        </Link>

        <button
          type="button"
          className={`nav-link nav-button ${isActive("/plan-trip")}`}
          onClick={() => openProtectedPage("/plan-trip")}
        >
          Plan Trip
        </button>

        <button
          type="button"
          className="nav-link nav-button"
          onClick={goToDestinations}
        >
          Destinations
        </button>

        {/* TRAVEL TOOLS DROPDOWN */}
        <div className="nav-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className={`nav-link nav-button travel-tools-toggle ${
              toolsOpen ? "dropdown-active" : ""
            }`}
            onClick={() => setToolsOpen((previous) => !previous)}
            aria-expanded={toolsOpen}
            aria-haspopup="true"
          >
            Travel Tools
            <ChevronDown
              size={15}
              className={toolsOpen ? "chevron-rotated" : ""}
            />
          </button>

          {toolsOpen && (
            <div className="nav-dropdown-menu">

              <button
                type="button"
                onClick={() => openProtectedPage("/nearby-attractions")}
              >
                <MapPin size={19} />
                <span>Nearby Attractions</span>
              </button>

              <button
                type="button"
                onClick={() => openProtectedPage("/currency-converter")}
              >
                <Coins size={19} />
                <span>Currency Converter</span>
              </button>

              <button
                type="button"
                onClick={() => openProtectedPage("/packing-checklist")}
              >
                <Luggage size={19} />
                <span>Packing Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => openProtectedPage("/travel-budget")}
              >
                <Wallet size={19} />
                <span>Travel Budget</span>
              </button>

            </div>
          )}
        </div>

        <button
          type="button"
          className={`nav-link nav-button ${isActive("/ai-chatbot")}`}
          onClick={() => openProtectedPage("/ai-chatbot")}
        >
          <MessageCircle size={17} />
          AI Chatbot
        </button>

        <button
          type="button"
          className={`nav-link nav-button ${isActive("/profile")}`}
          onClick={() => openProtectedPage("/profile")}
        >
          My Trips
        </button>

      </nav>

      <div className="nav-actions">

        {user ? (
          <>
            <Link className="nav-user" to="/profile">
              <span className="user-avatar small-avatar">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>

              <span className="nav-user-name">
                {user.name?.split(" ")[0] || "User"}
              </span>
            </Link>

            <button
              type="button"
              className="login-link"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="login-link" to="/login">
              Login
            </Link>

            <Link className="button button-small" to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </header>
  );
}
