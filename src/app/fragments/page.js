"use client";
// THESE ARE THE SMALL COMPONENTS THAT IS USED TO BUILD THE FINAL PROMPT
// FINAL PROMPT = Persona + Fragments * n
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Fragments() {
  const [fragments, setFragments] = useState([]);
  const [newFragment, setNewFragment] = useState({ name: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFragments();
  }, []);

  const loadFragments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/prompt-fragments");
      const data = await response.json();
      setFragments(data);
    } catch (error) {
      console.error("Error loading fragments:", error);
    }
  };

  const saveFragment = async () => {
    if (!newFragment.name || !newFragment.content) {
      alert("Please fill in both name and content");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/prompt-fragments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFragment),
      });

      if (response.ok) {
        setNewFragment({ name: "", content: "" });
        loadFragments();
        alert("✅ Fragment saved!");
      } else {
        throw new Error("Failed to save fragment");
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const deleteFragment = async (fragmentId) => {
    if (!confirm("Are you sure you want to delete this fragment?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/prompt-fragments/${fragmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadFragments();
        alert("Fragment deleted successfully");
      } else {
        // Try to parse backend error message
        let message = "Failed to delete fragment";
        try {
          const err = await response.json();
          message = err.detail || message;
        } catch (_) {}
        throw new Error(message);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🧩 Fragment Manager</h1>
        <p>Create and manage reusable prompt fragments</p>
      </header>

      <div className={styles.addSection}>
        <h2>Create New Fragment</h2>
        <div className={styles.formGroup}>
          <label htmlFor="fragmentName">Fragment Name</label>
          <input
            id="fragmentName"
            type="text"
            placeholder="e.g., identity_editor_chief"
            value={newFragment.name}
            onChange={(e) =>
              setNewFragment({ ...newFragment, name: e.target.value })
            }
            className={styles.nameInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fragmentContent">Fragment Content</label>
          <textarea
            id="fragmentContent"
            placeholder="Enter the prompt fragment content here..."
            value={newFragment.content}
            onChange={(e) =>
              setNewFragment({ ...newFragment, content: e.target.value })
            }
            className={styles.contentTextarea}
            rows={8}
          />
        </div>

        <button
          onClick={saveFragment}
          disabled={loading}
          className={styles.saveButton}
        >
          {loading ? "⏳ Saving..." : "💾 Save Fragment"}
        </button>
      </div>

      <div className={styles.fragmentList}>
        <h2>Existing Fragments ({fragments.length})</h2>
        {fragments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No fragments yet. Create your first one above!</p>
          </div>
        ) : (
          <div className={styles.fragmentGrid}>
            {fragments.map((fragment) => (
              <div key={fragment.id} className={styles.fragmentCard}>
                <div className={styles.fragmentHeader}>
                  <h3>{fragment.name}</h3>
                  {fragment.is_system && (
                    <span className={styles.systemBadge}>System</span>
                  )}
                </div>
                <div className={styles.fragmentContent}>
                  <pre>{fragment.content}</pre>
                </div>
                <div className={styles.fragmentMeta}>
                  <span className={styles.fragmentId}>ID: {fragment.id}</span>
                  <span className={styles.fragmentLength}>
                    {fragment.content?.length || 0} chars
                  </span>
                </div>
                {!fragment.is_system && (
                  <div className={styles.fragmentActions}>
                    <button
                      onClick={() => deleteFragment(fragment.id)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href="/" className={styles.backButton}>
        ← Back to Main
      </Link>
    </div>
  );
}
