"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [newPersona, setNewPersona] = useState({ name: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/ethical-personas");
      const data = await response.json();
      setPersonas(data);
    } catch (error) {
      console.error("Error loading personas:", error);
    }
  };

  // Erottele käyttäjän luomat ja system-persoonat
  const userPersonas = personas.filter(p => !p.is_system).sort((a, b) => b.id - a.id); // Uusin ensin
  const systemPersonas = personas.filter(p => p.is_system).sort((a, b) => a.name.localeCompare(b.name)); // Aakkosittain

  const savePersona = async () => {
    if (!newPersona.name || !newPersona.content) {
      alert("Please fill in both name and content");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/ethical-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPersona),
      });

      if (response.ok) {
        setNewPersona({ name: "", content: "" });
        loadPersonas();
        alert("Ethical persona saved!");
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save persona");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const deletePersona = async (personaId) => {
    if (!confirm("Are you sure you want to delete this persona?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/ethical-personas/${personaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadPersonas();
        alert("Persona deleted successfully");
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete persona");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎭 Ethical Personas Manager</h1>
        <p>Create and manage AI ethical frameworks and personalities</p>
      </header>

      <div className={styles.addSection}>
        <h2>Create New Ethical Persona</h2>
        <div className={styles.formGroup}>
          <label htmlFor="personaName">Persona Name</label>
          <input
            id="personaName"
            type="text"
            placeholder="e.g., Utilitarian Editor"
            value={newPersona.name}
            onChange={(e) =>
              setNewPersona({ ...newPersona, name: e.target.value })
            }
            className={styles.nameInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="personaContent">Persona Instructions</label>
          <textarea
            id="personaContent"
            placeholder="You are an AI that always acts according to... Describe the ethical framework and behavior..."
            value={newPersona.content}
            onChange={(e) =>
              setNewPersona({ ...newPersona, content: e.target.value })
            }
            className={styles.contentTextarea}
            rows={10}
          />
        </div>

        <button
          onClick={savePersona}
          disabled={loading}
          className={styles.saveButton}
        >
          {loading ? "Saving..." : "Save Persona"}
        </button>
      </div>

      <div className={styles.personaList}>
        {/* User-created personas section */}
        {userPersonas.length > 0 && (
          <div className={styles.personaSection}>
            <h2>Your Custom Personas ({userPersonas.length})</h2>
            <div className={styles.personaGrid}>
              {userPersonas.map((persona) => (
                <div key={persona.id} className={styles.personaCard}>
                  <div className={styles.personaHeader}>
                    <h3>{persona.name}</h3>
                    <span className={styles.customBadge}>Custom</span>
                  </div>
                  
                  <div className={styles.personaContent}>
                    <pre>{persona.content}</pre>
                  </div>
                  
                  <div className={styles.personaMeta}>
                    <span className={styles.personaId}>ID: {persona.id}</span>
                    <span className={styles.personaLength}>
                      {persona.content.length} chars
                    </span>
                    {persona.created_at && (
                      <span className={styles.personaDate}>
                        Created: {new Date(persona.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className={styles.personaActions}>
                    <button
                      onClick={() => deletePersona(persona.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System personas section */}
        <div className={styles.personaSection}>
          <h2>Default Ethical Frameworks ({systemPersonas.length})</h2>
          <div className={styles.personaGrid}>
            {systemPersonas.map((persona) => (
              <div key={persona.id} className={styles.personaCard}>
                <div className={styles.personaHeader}>
                  <h3>{persona.name}</h3>
                  <span className={styles.systemBadge}>System</span>
                </div>
                
                <div className={styles.personaContent}>
                  <pre>{persona.content}</pre>
                </div>
                
                <div className={styles.personaMeta}>
                  <span className={styles.personaId}>ID: {persona.id}</span>
                  <span className={styles.personaLength}>
                    {persona.content.length} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {userPersonas.length === 0 && systemPersonas.length === 0 && (
          <div className={styles.emptyState}>
            <p>No personas found. Create your first one above!</p>
          </div>
        )}
      </div>

      <div className={styles.navigation}>
        <Link href="/" className={styles.navButton}>
          Back to Main
        </Link>
        <Link href="/fragments" className={styles.navButton}>
          Manage Fragments
        </Link>
      </div>
    </div>
  );
}