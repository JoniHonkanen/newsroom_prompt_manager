"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [compositions, setCompositions] = useState([]);
  const [activeComposition, setActiveComposition] = useState("");
  const [loading, setLoading] = useState(false);

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
        console.log("TÄNNE MENI!");
        setActiveComposition([]);
        setCompositions([]);

        return;
      }
      setCompositions(data);
      const active = data.find((c) => c.is_active);
      if (active) {
        setActiveComposition(active.name);
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
            <span className={styles.activeName}>🟢 {activeComposition}</span>
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
