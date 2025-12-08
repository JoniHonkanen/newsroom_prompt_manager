# Newsroom Prompt Manager - Admin Interface

**Part of the Newsroom ecosystem:** This admin interface enables management of backend prompts, ethical personas, and testing. Used for testing editorial decisions and initiating phone interviews.

**Related projects:**
- [Backend (newsroom_ai_pipeline)](https://github.com/JoniHonkanen/newsroom) - Handles news generation, enrichment, and publishing
- [Frontend (newsroom_production_frontend)](https://github.com/JoniHonkanen/newsroom_production_frontend) - Public news site

**Technologies:** Next.js, React, FastAPI backend (required)

---

Kevyt Next.js -pohjainen hallintakäyttöliittymä Newsroom AI -backendille. Täällä hallitset Ethical Personas, Prompt Fragments, Prompt Compositions sekä testaat Editor in Chief -arviointia ja puhelinhaastatteluja.

Backend (FastAPI) on pakollinen. Ilman sitä listat ovat tyhjiä eikä arviointi / haastattelu toimi.

## 1. Vaatimukset

| Komponentti | Versio / Huomio |
|-------------|-----------------|
| Node.js | >= 18 (suositus 20+) |
| Backend | FastAPI-palvelu portissa esim. `8000` |
| Tietokanta | PostgreSQL + pgvector (backend hoitaa) |
| Twilio | Vain puhelinhaastatteluun |

## 2. Asennus ja käynnistys (frontend)

```powershell
npm install
npm run dev  # käynnistyy oletuksena porttiin 3000
```

Avaa selaimessa: `http://localhost:3000`

## 3. Ympäristömuuttuja (backendin osoite)

API-kutsujen pohja muodostetaan `src/lib/api.js` tiedostossa:

```javascript
process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
```

Luo juureen `.env.local` jos backend ei ole oletuksessa:

```env
NEXT_PUBLIC_API_BASE_URL=https://newsroom-api.example.com
```

Poista mahdolliset loppuslashit (skripti siivoaa kyllä).

## 4. Keskeiset API-reitit

| Käyttö | Reitti | Method |
|--------|--------|--------|
| Prompt Compositions listaus / aktivointi | `/api/prompt-compositions` / `PUT /api/prompt-compositions/{name}` | GET / PUT |
| Ethical Personas | `/api/ethical-personas` | GET / POST / DELETE |
| Prompt Fragments | `/api/prompt-fragments` | GET / POST / DELETE |
| Test Article arviointi | `/api/test-article-simple` | POST |
| Puhelinhaastattelun aloitus | `/api/start-interview` | POST |

Varmista että backendin CORS sallii tämän originin: `http://localhost:3000` (tai oma domain).

### Pikatesti yhteydestä

```powershell
curl http://localhost:8000/health
curl http://localhost:8000/api/prompt-compositions
```

JSON-vastaus ilman virheitä = yhteys OK.

## 5. Puhelinhaastattelut (Twilio)

- Sivun `/test-phonecall` lomake kutsuu `POST /api/start-interview`.
- Backend tarvitsee julkisen URL:n Twilio-webhookeille (localtunnel / reverse proxy) asetettuna backendin `.env`:iin (`LOCALTUNNEL_URL`).
- UI näyttää vain aloitusvastauksen; puhelun kulku tapahtuu backendin ja Twilion välillä.

## 6. Tuotantobuild

```powershell
npm run build
npm start
```

Varmista että ympäristömuuttuja on asetettu ennen buildia (Vercel käyttää asetuksissa määritettyä arvoa).

## 7. Tiedostorakenne (lyhyesti)

| Polku | Tarkoitus |
|-------|-----------|
| `src/app/*` | Next.js App Router sivut |
| `src/app/components/HeaderNav.js` | Yläpalkin navigaatio |
| `src/lib/api.js` | Backend-URL:n rakentaminen |

## 8. Yleiset ongelmat

| Oire | Syy | Korjaus |
|------|-----|---------|
| Tyhjät listat | Backend ei vastaa | Käynnistä FastAPI / tarkista portti |
| CORS error | Origin ei sallittu | Lisää origin backendin CORS-konfigiin |
| Puhelinhaastattelu ei käynnisty | Twilio / julkinen URL puuttuu | Lisää avaimet + `LOCALTUNNEL_URL` |

## 9. Nopein aloitus (dev)

```powershell
git clone <repo>
cd newsroom_prompt_manager
npm install
setx NEXT_PUBLIC_API_BASE_URL "http://localhost:8000"  # Uusi shell tarvitaan
npm run dev
```

Backend rinnalla (eri repo):

```powershell
python server.py
```

---

