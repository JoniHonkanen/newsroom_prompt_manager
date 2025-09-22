"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function TestArticle() {
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!title.trim() || !article.trim()) {
      setError("Lisää otsikko ja artikkelin teksti.");
      return;
    }

    setLoading(true);
    try {
      // Primary payload per spec
      let res = await fetch("http://localhost:8000/api/test-article-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), article: article.trim() }),
      });

      // Some backends may expect `content` instead of `article` – try fallback
      if (!res.ok) {
        res = await fetch("http://localhost:8000/api/test-article-simple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: article.trim() }),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Virhe kutsussa");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Tuntematon virhe");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🧪 Testaa Päätoimittaja-agenttia</h1>
        <p>Anna otsikko ja liitä artikkelin teksti, sitten lähetä arvioitavaksi.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Otsikko</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kirjoita artikkelin otsikko"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="article">Artikkelin teksti</label>
          <textarea
            id="article"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            placeholder="Liitä artikkelin teksti tähän (vain teksti)"
            className={styles.textarea}
            rows={14}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {result?.prompt_used && (
          <div className={styles.block}>
            <h4>Käytetty prompt</h4>
            <pre className={styles.pre}>{result.prompt_used}</pre>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Arvioidaan..." : "Lähetä arvioitavaksi"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setTitle("");
              setArticle("");
              setResult(null);
              setError("");
            }}
          >
            Tyhjennä
          </button>
        </div>
      </form>

      {result && (
        <div className={styles.resultSection}>
          <h2>Tulos</h2>
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <h3>Yhteenveto</h3>
              <ul className={styles.summaryList}>
                <li>
                  <strong>Status:</strong> {result.status}
                </li>
                {typeof result.editorial_decision !== "undefined" && (
                  <li>
                    <strong>Päätös:</strong> {String(result.editorial_decision)}
                  </li>
                )}
                {typeof result.featured !== "undefined" && (
                  <li>
                    <strong>Etusivu:</strong> {result.featured ? "Kyllä" : "Ei"}
                  </li>
                )}
                {typeof result.interview_needed !== "undefined" && (
                  <li>
                    <strong>Haastattelu:</strong> {result.interview_needed ? "Tarvitaan" : "Ei"}
                  </li>
                )}
                {typeof result.issues_count !== "undefined" && (
                  <li>
                    <strong>Havaittuja ongelmia:</strong> {result.issues_count}
                  </li>
                )}
              </ul>
              {result.reasoning && (
                <div className={styles.block}>
                  <h4>Perustelut</h4>
                  <p>{result.reasoning}</p>
                </div>
              )}
              {result.message && (
                <div className={styles.block}>
                  <h4>Viesti</h4>
                  <p>{result.message}</p>
                </div>
              )}
            </div>

            {result.review && (
              <div className={styles.resultCard}>
                <h3>Arvioinnin yksityiskohdat</h3>
                <div className={styles.block}>
                  <h4>Tila</h4>
                  <p>{result.review.status}</p>
                </div>
                {Array.isArray(result.review.issues) && result.review.issues.length > 0 && (
                  <div className={styles.block}>
                    <h4>Ongelmat</h4>
                    <ul>
                      {result.review.issues.map((i, idx) => (
                        <li key={idx}>{typeof i === "string" ? i : JSON.stringify(i)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.review.approval_comment && (
                  <div className={styles.block}>
                    <h4>Hyväksymisen kommentti</h4>
                    <p>{result.review.approval_comment}</p>
                  </div>
                )}
                {result.review.editorial_reasoning && (
                  <div className={styles.block}>
                    <h4>Toimituksellinen perustelu</h4>
                    {(() => {
                      const er = result.review.editorial_reasoning;
                      return (
                        <div className={styles.editorialReasoning}>
                          <div className={styles.erHeaderRow}>
                            {er.reviewer && (
                              <div className={styles.erItem}><strong>Arvioija:</strong> {er.reviewer}</div>
                            )}
                            {er.initial_decision && (
                              <div className={styles.erItem}><strong>Alkupäätös:</strong> {er.initial_decision}</div>
                            )}
                          </div>

                          {Array.isArray(er.checked_criteria) && er.checked_criteria.length > 0 && (
                            <div className={styles.erChipsRow}>
                              {er.checked_criteria.map((c, idx) => (
                                <span key={idx} className={styles.erChip}>{c}</span>
                              ))}
                            </div>
                          )}

                          {Array.isArray(er.failed_criteria) && er.failed_criteria.length > 0 && (
                            <div className={styles.erFailed}>
                              <strong>Epäonnistuneet kriteerit:</strong>
                              <ul>
                                {er.failed_criteria.map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(er.reasoning_steps) && er.reasoning_steps.length > 0 && (
                            <div className={styles.erSteps}>
                              <h5>Arviointiaskeleet</h5>
                              <ol>
                                {er.reasoning_steps.map((step) => (
                                  <li key={step.step_id} className={styles.erStep}>
                                    <div className={styles.erStepHeader}>
                                      <span className={styles.erStepBadge}>#{step.step_id}</span>
                                      <span className={styles.erStepAction}>{step.action}</span>
                                      <span className={`${styles.erStepResult} ${step.result === "PASS" ? styles.pass : styles.fail}`}>
                                        {step.result}
                                      </span>
                                    </div>
                                    {step.observation && (
                                      <p className={styles.erObservation}>{step.observation}</p>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {er.explanation && (
                            <div className={styles.erExplanation}>
                              <h5>Yhteenveto</h5>
                              <p>{er.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {result.review.headline_news_assessment && (
                  <div className={styles.block}>
                    <h4>Etusivuarvio</h4>
                    <pre className={styles.pre}>{JSON.stringify(result.review.headline_news_assessment, null, 2)}</pre>
                  </div>
                )}
                {result.review.interview_decision && (
                  <div className={styles.block}>
                    <h4>Haastattelupäätös</h4>
                    <pre className={styles.pre}>{JSON.stringify(result.review.interview_decision, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          

          <details className={styles.rawDetails}>
            <summary>Näytä raaka JSON</summary>
            <pre className={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}

      <div className={styles.navigation}>
        <Link href="/" className={styles.navButton}>
          ← Takaisin pääsivulle
        </Link>
      </div>
    </div>
  );
}
