# 🔊 Talking Label – Audio Product Information in the Smart Store

> **Omni-Commerce · Accessibility · Web Speech API · Gemini · Design Science Research**

You stand in front of a shelf and find an interesting product – but the electronic shelf label (ESL) only shows **name, price and size**. Is it vegan? Halal? Does it contain nuts? When does it expire? **Talking Label** closes this gap: scan the QR code on the ESL with your phone camera, choose what you want to know – or simply **ask a question by voice** – and the answer is **read aloud in German, English, Spanish or Arabic**. No app, no download, no staff needed.

**▶ Live demo:** [Protein Bar](https://omnilabel.netlify.app/?produkt=protein) · [Snack Bar](https://omnilabel.netlify.app/?produkt=snack)

*Omni-Commerce research project, summer semester 2026, EAH Jena · Supervisor: Prof. Dr. Andrej Werner*

<p>
  <img src="assets/esl-protein-bar.jpg" width="48%" alt="Electronic shelf label with QR code">
</p>

---

## 🧩 Problem

> *"The cafeteria is full. I quickly need a protein bar – but I'm vegan. The label only shows the price. Is it vegan? Does it contain nuts? There's nobody to ask."*
> → Unsure, and in the end buys nothing.

The ESL in the smart store lacks allergens, vegan/halal status, nutrition facts and ingredients, best-before date and organic certification. The QR code that is already printed on the label leads nowhere useful.

---

## 🎯 Goal

A system that gives customers **instant access to all relevant product information via the QR code on the shelf – as audio, without an app and without staff.**

- Close the information gap at the shelf
- Enable self-service
- Accessibility through audio (visually impaired and older customers)
- Realistic and immediately testable

---

## 💡 Solution: Scan. Choose. Listen.

| Step | What happens |
|---|---|
| **1 · Scan** | QR code with the phone camera, opens the web page directly |
| **2 · Choose** | Pick a preference: vegan, halal, allergens, nutrition, best-before date … |
| **3 · Listen** | The answer is shown as text and read aloud in the chosen language |
| **or: Ask** | Tap *"Frage stellen"* and ask by voice, e.g. *"Is there gluten in it?"* – the AI answers only from the product data |

**Two user groups** with different information needs:

| First-time buyer – *"What's inside?"* | Regular customer – *"Just a quick check"* |
|---|---|
| Vegan · Halal · Organic | Best-before date & batch |
| Age restriction | Disposal & recycling |
| Allergens | Ratings |
| Nutrition facts & ingredients | |

<p>
  <img src="docs/screen-1-welcome.png" width="30%" alt="Welcome screen after scanning, language switch DE/EN/ES/AR">
  <img src="docs/screen-2-en-allergene.png" width="30%" alt="English: allergen answer with audio output">
  <img src="docs/screen-3-ar-rtl.png" width="30%" alt="Arabic with right-to-left layout">
</p>

### 🌍 Four languages

German, English, Spanish and Arabic – the full interface, all answers and the speech output switch with one tap. Arabic uses a complete **right-to-left layout**. For each language the best available voice on the device is selected automatically.

### 🎙️ Ask by voice (AI with a safe fallback)

1. The browser's speech recognition turns the spoken question into text.
2. A **Netlify Function** (`netlify/functions/ask.js`) sends the question together with the product data to **Gemini**. The API key exists only as a server-side environment variable – never in the frontend.
3. The prompt is deliberately strict: Gemini may answer **only from the product data**, must never claim a product is allergen-safe without evidence, and otherwise says that the information is not available. Answers are short and spoken-style, in the chosen language.
4. If the function is unreachable (offline, quota used up, not deployed), the app **automatically falls back to keyword matching** – it always works.

---

## 🗂️ Data maintenance via Google Sheets

The store staff maintain product data in a **Google Sheet – no programming needed**. The page reads the sheet as CSV ("Publish to web") on every visit; if the sheet is unreachable, the built-in data is used, so the prototype also works offline.

| Column | Example |
|---|---|
| `produkt` | `protein` (matches `?produkt=` in the QR link) |
| `name`, `size` | Protein Bar, 50 g |
| `preis`, `neue preis`, `rabatt` | 2,49 · 1,87 · −25 % |
| `vegan`, `halal`, `bio` | ja / nein |
| `allergene`, `naehrwerte` | free text |
| `verfallsdatum`, `entsorgung`, `rating` | free text |

The **QR code never changes** – only the sheet is edited, e.g. to update a price or discount.

---

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Web Speech API](https://img.shields.io/badge/Web%20Speech%20API-4285F4?style=flat)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat&logo=googlesheets&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify%20Functions-00C7B7?style=flat&logo=netlify&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)

- Frontend: single HTML file, no framework, no build step
- `SpeechSynthesis` (text-to-speech) and `SpeechRecognition` (voice questions)
- Backend: one Netlify serverless function as a proxy to the Gemini API
- Product chosen via URL parameter `?produkt=protein|snack`

```
QR code on ESL ──► index.html (browser)
                     ├─ product data ◄── Google Sheets (CSV) · built-in fallback
                     ├─ text-to-speech (DE/EN/ES/AR)
                     └─ voice question ──► /.netlify/functions/ask ──► Gemini
                                              (API key server-side)   └─ fallback: keyword matching
```

---

## 🔬 Method & Evaluation

**Design Science Research** (Hevner et al., 2004): problem analysis (observation, ESL documentation) → prototype (QR + Web Speech API) → evaluation → refinement based on feedback.

Five students tested the first, German-only version of the prototype and rated it on a scale from 1 (poor) to 5 (very good):

| Question | Ratings | Mean |
|---|---|---|
| How easy to understand was the system? | 4, 4, 5, 5, 5 | **4.6** |
| Was the information fast enough? | 3, 4, 4, 5, 5 | **4.2** |
| Was the speech output easy to understand? | 4, 5, 5, 5, 5 | **4.8** |
| Was all necessary information provided? | 4, 4, 5, 5, 5 | **4.6** |

<p><img src="docs/evaluation.png" width="80%" alt="Evaluation results"></p>

- 🗣️ The **speech output** was rated best (4.8).
- ⏱️ **Speed** was the weakest point (4.2): the next iteration should shorten the path to the answer – the voice question feature addresses this by skipping the menu.
- The multilingual version and the AI voice question have **not yet been evaluated** with users.

---

## ⚠️ Limitations

- Small test group (n = 5 students), so the results are indicative only.
- Product data is **demo data** for two sample products.
- Voice quality and speech recognition depend on the browser and the voices installed on the device.
- AI answers depend on an external API (Gemini); the keyword fallback covers outages.

## 🔭 Next Steps

1. **Integration with a real ESL:** link the QR code on the shelf to the live page
2. **Larger usability test:** more participants and all four languages, measure time, decision confidence and satisfaction
3. **Better speech quality:** optional AI-based text-to-speech for a more natural voice

---

## 📁 Project Structure

```
talking-label/
├── index.html              # Complete prototype (UI in 4 languages, product data, Sheets loader, speech in/out)
├── netlify/functions/
│   └── ask.js              # Serverless proxy to Gemini (strict, data-only prompt)
├── netlify.toml            # Netlify configuration
├── SETUP.md                # Deployment & API key setup (German)
├── assets/
│   ├── esl-protein-bar.jpg # Electronic shelf label with QR code
│   └── qr/                 # QR codes for both demo products
└── docs/                   # Screenshots and evaluation chart
```

**Run locally:** open `index.html` in a browser (Chrome or Safari for the best voices), or add `?produkt=snack` to the URL. Without the Netlify function, voice questions use the keyword fallback.

**Deploy with AI:** connect this repository to Netlify and set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`, default `gemini-3.6-flash`) as environment variables – see [SETUP.md](SETUP.md).

---

## 💡 What I Learned

- Starting from a **real, observed problem** instead of a technology looking for a use case
- **Simplicity over complexity:** an earlier WebAR concept was dropped in favour of a solution customers can use in seconds
- Designing for **graceful degradation** (built-in data when the sheet is unreachable, keyword matching when the AI is unreachable)
- Using an LLM **safely**: restricted to the given data, with explicit rules for safety-critical answers such as allergens
- Keeping secrets out of the frontend with a **serverless proxy**
- Evaluating a prototype with users and turning feedback into concrete next steps
