# Talking Label — Setup KI-Fragefunktion (Gemini)

## Was ist neu
- 4 Sprachen (DE/EN/ES/AR) mit vollständiger Übersetzung + RTL für Arabisch
- Sprach-Frage-Button ("Frage stellen"): Kunde spricht eine Frage, System antwortet per KI
- KI-Antworten kommen NUR aus den Produktdaten (kein Halluzinieren bei Allergenen)
- Fällt automatisch auf das alte Keyword-System zurück, falls die KI offline/nicht erreichbar ist

## Dateien
- `index.html` — der komplette Prototyp (Frontend)
- `netlify/functions/ask.js` — Serverless-Funktion, die Gemini aufruft (API-Key bleibt hier sicher)
- `netlify.toml` — Netlify-Konfiguration

## Deployment auf Netlify

1. Diesen ganzen Ordner (mit der `netlify/` Unterordner-Struktur!) auf Netlify hochladen
   - Entweder per Drag & Drop im Netlify-Dashboard ("Deploys" -> Ordner reinziehen)
   - Oder über GitHub-Repo verbinden

2. **WICHTIG:** API-Key als Umgebungsvariable eintragen:
   - Netlify Dashboard -> dein Projekt -> **Site configuration** -> **Environment variables**
   - Variable hinzufügen: 
     - Key: `GEMINI_API_KEY`
     - Value: dein Gemini API-Key von Google AI Studio
   - Optional: `GEMINI_MODEL` (Standard: `gemini-3.6-flash`) – falls Google das Modell wieder abkündigt,
     hier einfach den neuen Modellnamen eintragen
   - Danach: **Deploys** -> **Trigger deploy** -> **Clear cache and deploy site**
     (Umgebungsvariablen wirken erst nach einem neuen Deploy!)

3. Testen: Seite öffnen -> Produkt scannen -> "Frage stellen" antippen -> Mikrofon-Berechtigung erlauben -> Frage stellen

## Kosten
Gemini hat ein kostenloses Kontingent (Free Tier), das für eine Messe/Demo über mehrere Tage
problemlos ausreichen sollte. Bei sehr hohem Traffic können Kosten anfallen — im Google AI Studio
unter "Usage" im Auge behalten.

## Falls die KI mal nicht antwortet
Das System merkt automatisch, wenn die Gemini-Funktion nicht erreichbar ist (z. B. kein Internet,
Kontingent aufgebraucht, Function noch nicht deployed) und wechselt automatisch zum
Keyword-basierten Fallback-System — die App funktioniert also immer, auch offline.
