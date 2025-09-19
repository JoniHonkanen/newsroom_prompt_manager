"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Compositions() {
  const [compositions, setCompositions] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [fragments, setFragments] = useState([]);
  const [newComposition, setNewComposition] = useState({
    name: "",
    ethical_persona_id: "",
    fragment_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    loadCompositions();
    loadPersonas();
    loadFragments();
  }, []);

  const loadCompositions = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/prompt-compositions");
      const data = await response.json();
      setCompositions(data);
    } catch (error) {
      console.error("Error loading compositions:", error);
    }
  };

  const loadPersonas = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/ethical-personas");
      const data = await response.json();
      setPersonas(data);
    } catch (error) {
      console.error("Error loading personas:", error);
    }
  };

  const loadFragments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/prompt-fragments");
      const data = await response.json();
      setFragments(data);
    } catch (error) {
      console.error("Error loading fragments:", error);
    }
  };

  const saveComposition = async () => {
    if (!newComposition.name || !newComposition.ethical_persona_id) {
      alert("Please enter name and select a persona");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/prompt-compositions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newComposition.name,
          ethical_persona_id: parseInt(newComposition.ethical_persona_id),
          fragment_ids: newComposition.fragment_ids
        }),
      });

      if (response.ok) {
        setNewComposition({ name: "", ethical_persona_id: "", fragment_ids: [] });
        setShowBuilder(false);
        loadCompositions();
        alert("Composition saved!");
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save composition");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const activateComposition = async (compositionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/prompt-compositions/${compositionId}/activate`, {
        method: "PUT",
      });

      if (response.ok) {
        loadCompositions();
        alert("Composition activated!");
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to activate composition");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const deleteComposition = async (compositionId) => {
    if (!confirm("Are you sure you want to delete this composition?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/prompt-compositions/${compositionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadCompositions();
        alert("Composition deleted successfully");
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete composition");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const toggleFragment = (fragmentId) => {
    setNewComposition(prev => ({
      ...prev,
      fragment_ids: prev.fragment_ids.includes(fragmentId)
        ? prev.fragment_ids.filter(id => id !== fragmentId)
        : [...prev.fragment_ids, fragmentId]
    }));
  };

  const getPersonaName = (personaId) => {
    const persona = personas.find(p => p.id === personaId);
    return persona ? persona.name : `ID: ${personaId}`;
  };

  const getFragmentNames = (fragmentIds) => {
    if (!fragmentIds || fragmentIds.length === 0) return "No fragments";
    return fragmentIds.map(id => {
      const fragment = fragments.find(f => f.id === id);
      return fragment ? fragment.name : `ID: ${id}`;
    }).join(", ");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Build Compositions</h1>
        <p>Combine ethical personas with modifier fragments to create complete prompts</p>
      </header>

      {!showBuilder ? (
        <div className={styles.startSection}>
          <button
            onClick={() => setShowBuilder(true)}
            className={styles.buildButton}
          >
            Create New Composition
          </button>
        </div>
      ) : (
        <div className={styles.builderSection}>
          <h2>Composition Builder</h2>
          
          <div className={styles.builderLayout}>
            {/* Left side - Form */}
            <div className={styles.builderForm}>
              <div className={styles.formGroup}>
                <label htmlFor="compositionName">Composition Name</label>
                <input
                  id="compositionName"
                  type="text"
                  placeholder="e.g., Finnish News Editor"
                  value={newComposition.name}
                  onChange={(e) =>
                    setNewComposition({ ...newComposition, name: e.target.value })
                  }
                  className={styles.nameInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="persona">Select Ethical Persona (Required)</label>
                <select
                  id="persona"
                  value={newComposition.ethical_persona_id}
                  onChange={(e) =>
                    setNewComposition({ ...newComposition, ethical_persona_id: e.target.value })
                  }
                  className={styles.selectInput}
                >
                  <option value="">Choose a persona...</option>
                  
                  {personas.filter(p => !p.is_system).length > 0 && (
                    <optgroup label="Your Custom Personas">
                      {personas.filter(p => !p.is_system).sort((a, b) => b.id - a.id).map((persona) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  <optgroup label="Default Ethical Frameworks">
                    {personas.filter(p => p.is_system).sort((a, b) => a.name.localeCompare(b.name)).map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Select Modifier Fragments (Optional)</label>
                <div className={styles.fragmentGrid}>
                  {fragments.map((fragment) => (
                    <div
                      key={fragment.id}
                      className={`${styles.fragmentCard} ${
                        newComposition.fragment_ids.includes(fragment.id) ? styles.selected : ""
                      }`}
                      onClick={() => toggleFragment(fragment.id)}
                    >
                      <h4>{fragment.name}</h4>
                      <p>{fragment.content.substring(0, 80)}...</p>
                      {fragment.is_system && <span className={styles.systemBadge}>System</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.builderActions}>
                <button
                  onClick={saveComposition}
                  disabled={loading}
                  className={styles.saveButton}
                >
                  {loading ? "Saving..." : "Save Composition"}
                </button>
                <button
                  onClick={() => {
                    setShowBuilder(false);
                    setNewComposition({ name: "", ethical_persona_id: "", fragment_ids: [] });
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className={styles.promptPreview}>
              <h3>Live Preview</h3>
              <div className={styles.previewContent}>
                {(() => {
                  const selectedPersona = personas.find(p => p.id == newComposition.ethical_persona_id);
                  const selectedFragments = fragments.filter(f => newComposition.fragment_ids.includes(f.id));
                  
                  if (!selectedPersona) {
                    return <p className={styles.previewPlaceholder}>Select a persona to see preview...</p>;
                  }

                  const promptParts = [selectedPersona.content];
                  if (selectedFragments.length > 0) {
                    promptParts.push(...selectedFragments.map(f => f.content));
                  }

                  const finalPrompt = promptParts.join('\n\n');

                  return (
                    <div>
                      <div className={styles.previewStats}>
                        <span>Characters: {finalPrompt.length}</span>
                        <span>Parts: {promptParts.length}</span>
                      </div>
                      <pre className={styles.previewText}>{finalPrompt}</pre>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.compositionList}>
        <h2>Existing Compositions ({compositions.length})</h2>
        {compositions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No compositions yet. Create your first one above!</p>
          </div>
        ) : (
          <div className={styles.compositionGrid}>
            {compositions.map((composition) => (
              <div key={composition.id} className={styles.compositionCard}>
                <div className={styles.compositionHeader}>
                  <h3>{composition.name}</h3>
                  {composition.is_active && (
                    <span className={styles.activeBadge}>Active</span>
                  )}
                </div>
                
                <div className={styles.compositionContent}>
                  <div className={styles.compositionDetail}>
                    <strong>Persona:</strong> {getPersonaName(composition.ethical_persona_id)}
                  </div>
                  <div className={styles.compositionDetail}>
                    <strong>Fragments:</strong> {getFragmentNames(composition.fragment_ids)}
                  </div>
                </div>
                
                <div className={styles.compositionMeta}>
                  <span className={styles.compositionId}>ID: {composition.id}</span>
                  {composition.created_at && (
                    <span className={styles.compositionDate}>
                      Created: {new Date(composition.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className={styles.compositionActions}>
                  {!composition.is_active ? (
                    <button
                      onClick={() => activateComposition(composition.id)}
                      className={styles.activateButton}
                    >
                      Activate
                    </button>
                  ) : (
                    <span className={styles.activeLabel}>Currently Active</span>
                  )}
                  
                  {!composition.is_active && (
                    <button
                      onClick={() => deleteComposition(composition.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.navigation}>
        <Link href="/" className={styles.navButton}>
          Back to Main
        </Link>
        <Link href="/personas" className={styles.navButton}>
          Manage Personas
        </Link>
        <Link href="/fragments" className={styles.navButton}>
          Manage Fragments
        </Link>
      </div>
    </div>
  );
}