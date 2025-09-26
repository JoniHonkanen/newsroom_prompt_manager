"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [compositions, setCompositions] = useState([]);
  const [activeComposition, setActiveComposition] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCompositions();
  }, []);

  const loadCompositions = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/prompt-compositions"
      );
      const data = await response.json();
      console.log("Loaded compositions:", data);

      if (data.length === 0 || data.detail === "Not Found") {
        setActiveComposition([]);
        setCompositions([]);

        return;
      }
      setCompositions(data);
      const active = data.find((c) => c.is_active);
      if (active) {
        setActiveComposition(active.name);
        // Build the full prompt from persona + fragments
        try {
          const [personasRes, fragmentsRes] = await Promise.all([
            fetch("http://localhost:8000/api/ethical-personas"),
            fetch("http://localhost:8000/api/prompt-fragments"),
          ]);
          const [personas, fragments] = await Promise.all([
            personasRes.json(),
            fragmentsRes.json(),
          ]);

          const persona = personas.find(
            (p) => p.id === active.ethical_persona_id
          );
          const selectedFragments = (active.fragment_ids || [])
            .map((id) => fragments.find((f) => f.id === id))
            .filter(Boolean);

          const parts = [];
          if (persona?.content) parts.push(persona.content);
          if (selectedFragments.length > 0)
            parts.push(...selectedFragments.map((f) => f.content));

          setActivePrompt(parts.join("\n\n"));
        } catch (e) {
          console.error("Failed building active prompt:", e);
          setActivePrompt("");
        }
      } else {
        setActivePrompt("");
      }
    } catch (error) {
      console.error("Error loading compositions:", error);
    }
  };

  const switchComposition = async (compositionName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/prompt-compositions${compositionName}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        setActiveComposition(compositionName);
        await loadCompositions(); // Refresh
        alert(`✅ Switched to: ${compositionName}`);
      } else {
        throw new Error("Failed to switch composition");
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📰 News Evaluation Prompt Manager</h1>
        <p>Switch between different editorial personas for news evaluation</p>
      </header>

      <div className={styles.currentActive}>
        <h2>Currently Active</h2>
        <div className={styles.activeCard}>
          {activeComposition ? (
            <div>
              <div className={styles.activeTopRow}>
                <div className={styles.activeName}>🟢 {activeComposition}</div>
                <button
                  className={styles.toggleButton}
                  onClick={() => setShowPreview((v) => !v)}
                  disabled={!activePrompt}
                >
                  {showPreview ? "Hide prompt" : "Show prompt"}
                </button>
              </div>
              {showPreview && (
                <div className={styles.promptPreview}>
                  <h3>Active Prompt Preview</h3>
                  <div className={styles.previewContent}>
                    {activePrompt ? (
                      <div>
                        <div className={styles.previewStats}>
                          <span>Characters: {activePrompt.length}</span>
                          <span>Parts: {activePrompt.split("\n\n").length}</span>
                        </div>
                        <pre className={styles.previewText}>{activePrompt}</pre>
                      </div>
                    ) : (
                      <p className={styles.previewPlaceholder}>
                        Prompt content not available.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className={styles.noActive}>⚪ No active composition</span>
          )}
        </div>
      </div>

      <nav className={styles.navigation}>
        <Link href="/fragments" className={styles.navButton}>
          <span>🧩 Manage Fragments</span>
          <br></br>
          <span>(The small parts of the prompt)</span>
        </Link>
        <Link href="/personas" className={styles.navButton}>
          🎭 Manage Personas
          <br></br>
          <span>(The persona of the editor)</span>
        </Link>
        <Link href="/compositions" className={styles.navButton}>
          🔨 Build Compositions (prompt)
          <br></br>
          <span>(Combine persona and fragments)</span>
        </Link>
      </nav>
    </div>
  );
}
