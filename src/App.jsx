
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import { getCurrentUser } from "./services/auth";

// Existing pages
import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Chatbot
import AITravelChatbot from "./pages/AITravelChatbot";

// Travel Tools
import NearbyAttractions from "./pages/NearbyAttractions";
import CurrencyConverter from "./pages/CurrencyConverter";
import PackingChecklist from "./pages/PackingChecklist";
import TravelBudget from "./pages/TravelBudget";

// Protect pages that require login
function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default function App() {
  const location = useLocation();

  // Scroll to a Home page section after navigation
  useEffect(() => {
    const sectionId = location.state?.scrollTo;

    if (location.pathname === "/" && sectionId) {
      const timer = setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.key, location.state]);

  return (
    <div className="app">

      <Navbar />

      <main>
        <Routes>

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* LOGIN AND REGISTER */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PLAN TRIP */}
          <Route
            path="/plan-trip"
            element={
              <ProtectedRoute>
                <PlanTrip />
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* AI CHATBOT */}
          <Route
            path="/ai-chatbot"
            element={
              <ProtectedRoute>
                <AITravelChatbot />
              </ProtectedRoute>
            }
          />

          {/* NEARBY ATTRACTIONS */}
          <Route
            path="/nearby-attractions"
            element={
              <ProtectedRoute>
                <NearbyAttractions />
              </ProtectedRoute>
            }
          />

          {/* CURRENCY CONVERTER */}
          <Route
            path="/currency-converter"
            element={
              <ProtectedRoute>
                <CurrencyConverter />
              </ProtectedRoute>
            }
          />

          {/* PACKING CHECKLIST */}
          <Route
            path="/packing-checklist"
            element={
              <ProtectedRoute>
                <PackingChecklist />
              </ProtectedRoute>
            }
          />

          {/* TRAVEL BUDGET */}
          <Route
            path="/travel-budget"
            element={
              <ProtectedRoute>
                <TravelBudget />
              </ProtectedRoute>
            }
          />

          {/* UNKNOWN PAGE */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </main>

    </div>
  );
}
