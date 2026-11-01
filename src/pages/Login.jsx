
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.notice || "");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = loginUser(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const from = location.state?.from;
    let destination = "/";

    if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
      destination = from;
    } else if (
      from &&
      typeof from.pathname === "string" &&
      from.pathname.startsWith("/") &&
      !from.pathname.startsWith("//")
    ) {
      destination =
        from.pathname + (from.search || "") + (from.hash || "");
    }

    navigate(destination, { replace: true });
  }

  return (
    <main className="auth-page">

      {/* LEFT VISUAL SECTION */}
      <section className="auth-visual login-visual">
        <Link to="/" className="auth-brand">
          <span className="brand-icon">✦</span>
          TravelSmart
        </Link>

        <div className="auth-visual-content">
          <span className="eyebrow hero-eyebrow">
            WELCOME BACK, TRAVELLER
          </span>

          <h1>Collect moments. Not just miles.</h1>

          <p>
            Every destination has a story. Sign in to revisit
            your favourite places and continue your travel adventure.
          </p>

          <div className="auth-feature">
            <span className="feature-icon">◎</span>
            <span>
              <strong>Your journey continues</strong>
              <small>Pick up where your wanderlust left off.</small>
            </span>
          </div>

          <small className="visual-caption">
            Every great journey begins with a single step.
          </small>
        </div>
      </section>

      {/* RIGHT LOGIN FORM */}
      <section className="auth-form-side">
        <div className="auth-card">
          <span className="eyebrow">WELCOME BACK</span>

          <h2>Log in to TravelSmart</h2>

          <p>Enter your details to continue your journey.</p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-group">
              Email address

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="form-group">
              Password

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="auth-submit" type="submit">
              Log In <span>→</span>
            </button>
          </form>

          <div className="auth-footer">
            New to TravelSmart?{" "}
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
