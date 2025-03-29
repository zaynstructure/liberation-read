// src/App.js
import React, { useState } from "react";
import LandingPage from "./LandingPage";
import MindMap from "./MindMap";

const App = () => {
  const [seedConcept, setSeedConcept] = useState(null);

  return (
    <>
      {!seedConcept ? (
        <LandingPage onStart={(seed) => setSeedConcept(seed)} />
      ) : (
        <MindMap seedConcept={seedConcept} />
      )}
    </>
  );
};

export default App;
