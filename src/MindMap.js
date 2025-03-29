// src/MindMap.js
import React, { useRef, useEffect, useState } from "react";
import cytoscape from "cytoscape";
import axios from "axios";
import convertToLiberatoryPoem from "./convertToLiberatoryPoem";

const MindMap = ({ seedConcept }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [poem, setPoem] = useState([]);
  const poemRef = useRef([]);

  useEffect(() => {
    if (!seedConcept || !containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: ".center",
          style: {
            "background-color": "#8a2be2",
            label: "data(label)",
            color: "#ffffff",
            "font-size": "14px",
            "font-weight": "bold",
            "text-outline-color": "#000",
            "text-outline-width": 2,
            width: 60,
            height: 60,
          },
        },
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": "11px",
            "text-wrap": "wrap",
            "text-max-width": 80,
            color: "#ffffff",
          },
        },
      ],
    });

    cyRef.current = cy;

    const fetchLinksAndLock = async () => {
      const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${seedConcept}&format=json&origin=*`;
      try {
        const res = await axios.get(url);
        const links = res.data.parse.links
          .filter((l) => !l.ns && !l.exists?.includes("missing"))
          .slice(0, 10);

        const nodes = links.map((link) => ({
          data: { id: link["*"], label: link["*"] },
        }));

        const edges = links.map((link) => ({
          data: { source: seedConcept, target: link["*"] },
        }));

        cy.add([
          { data: { id: seedConcept, label: seedConcept }, classes: "center" },
          ...nodes,
          ...edges,
        ]);

        const layout = cy.layout({
          name: "cose",
          animate: false,
          padding: 100,
          nodeRepulsion: 150000,
          idealEdgeLength: 120,
          minNodeSpacing: 60,
        });
        layout.run();

        setTimeout(() => {
          cy.nodes().forEach((n) => {
            const pos = n.position();
            n.data("x", pos.x);
            n.data("y", pos.y);
          });
          cy.layout({ name: "preset" }).run();

          cy.zoom(1.8);
          cy.center();

          cy.userZoomingEnabled(false);
          cy.userPanningEnabled(false);
          cy.autoungrabify(true);
          cy.boxSelectionEnabled(false);
        }, 300);
      } catch (err) {
        console.error("Error loading map:", err);
      }
    };

    fetchLinksAndLock();

    cy.off("tap", "node");
    cy.on("tap", "node", async (event) => {
      const id = event.target.id();
      if (poemRef.current.some((entry) => entry.title === id)) return;

      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${id}`;
      try {
        const res = await axios.get(url);
        const extract = res.data.extract;
        const newEntry = { title: id, original: extract, converted: null };
        setPoem((prev) => {
          const updated = [...prev, newEntry];
          poemRef.current = updated;
          return updated;
        });

        cy.batch(() => {
          event.target.style({
            "background-color": "#444",
            "text-outline-color": "#999",
            opacity: 0.7,
          });
        });
      } catch {
        const newEntry = { title: id, original: "(No intro found)", converted: null };
        setPoem((prev) => {
          const updated = [...prev, newEntry];
          poemRef.current = updated;
          return updated;
        });
      }
    });

    return () => {
      cy.destroy();
    };
  }, [seedConcept]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: 2,
          display: "flex",
          alignItems: "center",
          padding: "2rem 0",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "calc(100vh - 4rem)",
            maxHeight: "90vh",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          background: "#111",
          color: "white",
          padding: "2rem 1rem",
          overflowY: "auto",
          fontFamily: "'Georgia', serif",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", fontWeight: 400 }}>
          Your Resistance Reading
        </h2>

        {poem.map((entry, index) => (
          <div
            key={index}
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              border: "1px solid #333",
              borderRadius: "8px",
              backgroundColor: "#1a1a1a",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem", color: "#ccc", fontWeight: 600 }}>
              {entry.title}
            </h4>
            <p style={{ margin: 0, whiteSpace: "pre-line", lineHeight: 1.5 }}>
              {entry.original}
            </p>
            {entry.converted && (
              <p
                style={{
                  margin: "0.5rem 0 0",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                  color: "#8a2be2",
                }}
              >
                {entry.converted}
              </p>
            )}
            {!entry.converted && (
              <button
                onClick={async () => {
                  const convertedText = await convertToLiberatoryPoem(entry.original);
                  setPoem((prev) => {
                    const updated = prev.map((e, i) =>
                      i === index ? { ...e, converted: convertedText } : e
                    );
                    poemRef.current = updated;
                    return updated;
                  });
                }}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "#8a2be2",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Convert to Liberatory Poem
              </button>
            )}
          </div>
        ))}

        {poem.length > 0 && (
          <button
            onClick={() => {
              setPoem([]);
              poemRef.current = [];
            }}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              border: "none",
              background: "#8a2be2",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Reset Poem
          </button>
        )}
      </div>
    </div>
  );
};

export default MindMap;
