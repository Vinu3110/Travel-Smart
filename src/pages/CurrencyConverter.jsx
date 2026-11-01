
import React, { useState } from "react";
import "./TravelTools.css";

const currencies = [
  "INR", "USD", "EUR", "GBP", "JPY", "AUD",
  "CAD", "SGD", "AED", "CHF", "CNY", "NZD"
];

function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convertCurrency = async (e) => {
    e.preventDefault();

    const number = Number(amount);

    if (!Number.isFinite(number) || number <= 0) {
      setError("Enter an amount greater than zero.");
      setResult(null);
      return;
    }

    if (from === to) {
      setResult(number);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `https://api.frankfurter.dev/v2/rate/${from}/${to}`
      );

      if (!response.ok) {
        throw new Error("Exchange rate unavailable for these currencies.");
      }

      const data = await response.json();
      setResult(number * data.rate);
    } catch (err) {
      setError(err.message || "Unable to convert currency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-tools">
      <h1>Currency Converter</h1>
      <p className="tool-description">
        Convert money between popular world currencies.
      </p>

      <div className="tool-card">
        <form onSubmit={convertCurrency} className="tool-form">
          <input
            className="tool-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />

          <select
            className="tool-select"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>

          <span>to</span>

          <select
            className="tool-select"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>

          <button className="tool-button" disabled={loading}>
            {loading ? "Converting..." : "Convert"}
          </button>
        </form>

        {error && <p className="tool-error">{error}</p>}

        {result !== null && (
          <div className="tool-card">
            <p>Converted Amount</p>
            <div className="tool-total">
              {result.toLocaleString(undefined, {
                maximumFractionDigits: 2
              })} {to}
            </div>
            <p>
              {amount} {from} = {result.toFixed(2)} {to}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyConverter;
