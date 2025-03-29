// src/LandingPage.js
import React, { useState } from "react";
import "./LandingPage.css";

const seedSuggestions = ["Debt", "Freedom", "Memory", "Silence", "Colonialism"];

const LandingPage = ({ onStart }) => {
  const [input, setInput] = useState("");

  const handleStart = () => {
    const word = input.trim() || seedSuggestions[Math.floor(Math.random() * seedSuggestions.length)];
    onStart(word);
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Liberation Map</h1>
      <p className="landing-subtext">
        A poetic exploration of knowledge.<br />Start with a word. Let memory branch.
      </p>

      <input
        type="text"
        className="landing-input"
        placeholder="e.g. Debt, Freedom, Memory"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="suggestions">
        {seedSuggestions.map((word) => (
          <button key={word} onClick={() => setInput(word)} className="chip">
            {word}
          </button>
        ))}
      </div>

      <button className="start-button" onClick={handleStart}>
        Trace the Roots
      </button>
    </div>
  );
};

export default LandingPage;
