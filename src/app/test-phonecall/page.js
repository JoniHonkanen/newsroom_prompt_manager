"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { buildApiUrl } from "@/lib/api";

const defaultInstructions =
  "Olet Tampereen yliopiston tekoäly, joka tekee LYHYEN haastattelun.\n" +
  "Kun esittelet itsesi, kerro että teet haastattelua artikkelia varten, mutta älä lue koko otsikkoa ääneen.\n" +
  "Sen sijaan kuvaile aihe lyhyesti ja luonnollisesti omilla sanoillasi.\n" +
  "KRIITTINEN SÄÄNTÖ: Sinä olet haastattelija! Et saa koskaan selittää tai kertoa aiheesta.\n" +
  "HAASTATTELUN RAKENNE:\n" +
  "1. Aloita: 'Hei, olen Tampereen yliopiston tekoälyjournalisti. Teen lyhyttä haastattelua [kuvaile aihe lyhyesti]'\n" +
  "2. Kysy lupa jatkaa\n" +
  "3. Esitä 2 pääkysymystä yksi kerrallaan, odota vastaus jokaiseen\n" +
  "4. Lopuksi kysy: 'Onko jotain mitä haluatte vielä kertoa aiheesta?'\n" +
  "5. Kuuntele vastaus ja kiitä haastattelusta\n" +
  "6. Lopeta haastattelu kohteliaasti\n" +
  "Pysy suomen kielessä koko ajan.";

const defaultRules = [
  "Kysy VAIN 2 pääkysymystä. Älä keksi lisäkysymyksiä.",
  "Älä vastaa omiin kysymyksiisi. Kun haastateltava on valmis, kysy seuraava kysymys.",
  "Puhu vain suomea koko haastattelun ajan.",
  "Kysy vain yksi kysymys kerrallaan ja odota vastaus.",
  "2 pääkysymyksen jälkeen kysy: 'Onko jotain mitä haluatte vielä kertoa aiheesta?'",
  "Lopetuksen jälkeen kiitä ja pyydä sulkemaan puhelu.",
  "ET OLE ASIANTUNTIJA. Olet VAIN haastattelija. Älä koskaan selitä tai kerro aiheesta mitään.",
  "Jos haastateltava keskeyttää tai puhuu päälle, jatka haastattelua siitä mihin jäit. Älä suotta kommentoi tai selitä.",
];

export default function TestInterview() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [questions, setQuestions] = useState([{ id: "1", text: "" }]);
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [rules, setRules] = useState([...defaultRules]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAddQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { id: newId, text: "" }]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) {
      setError("Haastattelussa täytyy olla vähintään yksi kysymys!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id, text) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      setError("Puhelinnumero on pakollinen!");
      return false;
    }

    if (!phoneNumber.match(/^\+?[0-9\s-]{8,}$/)) {
      setError("Virheellinen puhelinnumero! Käytä muotoa +358401234567");
      return false;
    }

    const emptyQuestions = questions.filter((q) => !q.text.trim());
    if (emptyQuestions.length > 0) {
      setError("Kaikki kysymykset täytyy täyttää tai poistaa tyhjät!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const phoneScriptJson = {
        role: "system",
        rules: rules,
        voice: "nova",
        language: "fi",
        temperature: 0.7,
        instructions: instructions.trim() || defaultInstructions,
        article_title: articleTitle.trim() || "Testi-haastattelu",
        questions_data: questions.map((q, index) => ({
          text: q.text.trim(),
          topic: "Yleinen",
          position: index + 1
        })),
        closing_question: "Onko jotain mitä haluatte vielä kertoa aiheesta?"
      };

      const res = await fetch(buildApiUrl("/start-interview"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber.trim(),
          phone_script_json: phoneScriptJson,
          article_id: null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber("");
    setArticleTitle("");
    setQuestions([{ id: "1", text: "" }]);
    setInstructions(defaultInstructions);
    setRules([...defaultRules]);
    setResult(null);
    setError("");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📞 Testaa puhelinhaastattelua</h1>
        <p>
          Syötä puhelinnumero ja kysymykset, niin Twilio-agentti soittaa ja
          tekee haastattelun.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Puhelinnumero *</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+358401234567"
            className={styles.input}
            disabled={loading}
          />
          <p className={styles.hint}>
            Kansainvälinen muoto suositeltu (esim. +358401234567)
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="articleTitle">Artikkelin aihe/otsikko (valinnainen)</label>
          <input
            id="articleTitle"
            type="text"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder="Esim. Uusi tutkimus ilmastonmuutoksesta"
            className={styles.input}
            disabled={loading}
          />
          <p className={styles.hint}>
            Tekoäly käyttää tätä kontekstina haastattelussa (voi jättää tyhjäksi)
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instructions">
            Haastattelijan rooli ja ohjeistus
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Olet toimittaja..."
            className={styles.textarea}
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Edistyneet asetukset */}
        <div className={styles.advancedSection}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={styles.advancedToggle}
            disabled={loading}
          >
            {showAdvanced ? "▼" : "▶"} Edistyneet asetukset (säännöt)
          </button>

          {showAdvanced && (
            <div className={styles.advancedContent}>
              <label>Haastattelijan säännöt ({rules.length} kpl)</label>
              <p className={styles.hint}>
                Nämä säännöt ohjaavat AI:n käyttäytymistä haastattelussa
              </p>

              {rules.map((rule, index) => (
                <div key={index} className={styles.ruleRow}>
                  <div className={styles.ruleNumber}>{index + 1}.</div>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index] = e.target.value;
                      setRules(newRules);
                    }}
                    className={styles.input}
                    disabled={loading}
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRules(rules.filter((_, i) => i !== index));
                      }}
                      disabled={loading}
                      className={styles.removeButton}
                      title="Poista sääntö"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              <div className={styles.ruleActions}>
                <button
                  type="button"
                  onClick={() => setRules([...rules, ""])}
                  disabled={loading}
                  className={styles.addButton}
                >
                  + Lisää sääntö
                </button>
                <button
                  type="button"
                  onClick={() => setRules([...defaultRules])}
                  disabled={loading}
                  className={styles.secondaryButton}
                >
                  Palauta oletussäännöt
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Haastattelukysymykset * ({questions.length} kpl)</label>

          {questions.map((question, index) => (
            <div key={question.id} className={styles.questionRow}>
              <div className={styles.questionNumber}>{index + 1}.</div>
              <input
                type="text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(question.id, e.target.value)
                }
                placeholder={`Esim. Mitä mieltä olet aiheesta X?`}
                className={styles.input}
                disabled={loading}
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(question.id)}
                  disabled={loading}
                  className={styles.removeButton}
                  title="Poista kysymys"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={loading || questions.length >= 10}
            className={styles.addButton}
          >
            + Lisää kysymys
          </button>

          {questions.length >= 10 && (
            <p className={styles.warning}>
              ⚠️ Maksimi 10 kysymystä per haastattelu
            </p>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "⏳ Soitetaan..." : "📞 Aloita haastattelu"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleReset}
            disabled={loading}
          >
            Tyhjennä
          </button>
        </div>
      </form>

      {result && (
        <div className={styles.resultSection}>
          <h2>✅ Haastattelu aloitettu!</h2>

          <div className={styles.resultCard}>
            <h3>Yhteenveto</h3>
            <ul className={styles.summaryList}>
              <li>
                <strong>Status:</strong> {result.status}
              </li>
              <li>
                <strong>📞 Puhelinnumero:</strong> {result.to_number}
              </li>
              <li>
                <strong>🆔 Puhelun ID:</strong> <code>{result.call_sid}</code>
              </li>
              <li>
                <strong>🌍 Kieli:</strong> {result.language}
              </li>
              <li>
                <strong>📱 Twilio-numero:</strong> {result.from_number}
              </li>
            </ul>
          </div>

          <div className={styles.infoBox}>
            <p>
              💡 <strong>Vinkki:</strong> Puhelu on nyt käynnissä! Haastateltava
              saa puhelun muutaman sekunnin kuluttua. Haastattelu etenee
              automaattisesti kysymysten mukaan.
            </p>
          </div>

          <details className={styles.rawDetails}>
            <summary>Näytä raaka JSON</summary>
            <pre className={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}

      <div className={styles.infoSection}>
        <h3>💡 Ohjeita</h3>
        <ul>
          <li>Puhelinnumeron tulee olla kansainvälisessä muodossa (+358...)</li>
          <li>Haastattelu tehdään suomeksi OpenAI:n Realtime API:lla</li>
          <li>Kysymykset esitetään siinä järjestyksessä kuin ne on lisätty</li>
          <li>Haastattelija odottaa vastauksen ennen seuraavaa kysymystä</li>
          <li>
            Kun kaikki kysymykset on kysytty, puhelu päättyy automaattisesti
          </li>
          <li>Voit lisätä enintään 10 kysymystä per haastattelu</li>
        </ul>
      </div>

      <div className={styles.navigation}>
        <Link href="/" className={styles.navButton}>
          ← Takaisin pääsivulle
        </Link>
      </div>
    </div>
  );
}