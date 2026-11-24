# Uloom Quest: gamified syllabus for Ashraful Uloom Online

Playable, faceless, mobile-first HTML5 games built from the **Jamiatul Ulama SA Tas-heel series** (Suhail's "jamaita tasheel series").
First build: **Class 1, Lessons 4 & 5** (started 24 Nov 2026).

## Layout
- `site/`: the deployable static site (working copy). `repo/` is the git clone of `suhailwadee/uloom-quest` that GitHub Pages serves. Copy `site/` into `repo/`, then commit and push.
  - `index.html`: hub page that lists every lesson game
  - `assets/uloom-online-logo.png`: Uloom Online logo, from /workspace/uloom-reel/assets
  - `class1-lessons-4-5/`: one folder per lesson game
    - `data.js`: **all lesson content**. Edit this for new lessons.
    - `game.js`: game engine (round types, sound, voice, effects). Reusable.
    - `style.css`, `index.html`
- `source/`: downloaded book PDFs plus page renders used to extract the content
- `test_game.py`: headless Chrome test. It plays every level and screenshots each round type at desktop, phone and tablet sizes. Run it with `cd site && python3 -m http.server 8765 &` and then `python3 test_game.py [url]`.
- `screenshots-test/`: latest test screenshots

## Sources (Class 1)
Madrasah Teacher mirror: https://madrasahteacher.com/2020/04/17/grade-1-tas-heel-syllabus-links/
| Book | PDF | Lesson 4 | Lesson 5 |
|---|---|---|---|
| Towards Reading the Qur'an Pt 1 (Lenasia Muslim Assoc.) | https://madrasahteacher.com/wp-content/uploads/2020/04/quraan-part-1.pdf | p15–16: ج ja, ش sha, ي ya | p17–18: ت ta, د da, ط taw |
| Tas-heelul Aqaa-id 1 | https://madrasahteacher.com/wp-content/uploads/2020/07/aqaaid-1.pdf | p24–27: All-Hearing (As-Samee'), Badr, poem | p30–33: All-Loving (Al-Wadood), two pigeons |
| Tas-heelul Fiqh 1 | https://madrasahteacher.com/wp-content/uploads/2020/07/fiqh-1.pdf | p10: urine/stool must not dirty body/clothes | p11: left hand for istinjaa |
| Tas-heelul Akhlaaq 1 | https://madrasahteacher.com/wp-content/uploads/2020/07/akhlaaq-1.pdf | p13 "My speech": **missing from the PDF** | p14–15: Give and Take, people of Madeenah |
| Tas-heelul Ahaadeeth 1 | https://madrasahteacher.com/wp-content/uploads/2020/04/hadeeth-1.pdf | p9: Mother (اَلْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ) | p10: Truthfulness (عَلَيْكُمْ بِالصِّدْقِ) |
| Tas-heelut Taa-reekh 1 | https://madrasahteacher.com/wp-content/uploads/2020/04/islamic-history-1-a4.pdf | p18: Building of the ark | p22: Ibraheem عليه السلام |
PDF page = book page +1 for Aqaa-id/Fiqh, −1 for Akhlaaq, +2 for Hadeeth, +2 for Taa-reekh, +1 for TRQ.
The PDFs are scans with no text layer, so the content was transcribed by reading page renders (`pdftoppm -r 90`).

## Rules for every new lesson game
1. Use **book content only**. Every question must trace to a page, and wrong-answer distractors must be harmless. Log the page refs in `data.js`.
2. **Faceless**: no human or animal faces or figures. Use shapes, letters, stars, geometric patterns, nature and objects only, with no book illustrations. Emoji are limited to faceless ones (📖⭐💧💚📜⛵🌙).
3. **No music or instruments**. Sound effects are short synthesized pops and whooshes; voice is the device's text-to-speech. A mute button is included.
4. Arabic uses Noto Naskh Arabic (Amiri for honorific glyphs and the Bismillah), wrapped in `.ar` (RTL, isolated). Avoid Amiri for letter or word tiles because its stacked ligatures (e.g. لج) confuse beginners.
5. Honorific tokens in `data.js`: `{T}` تَعَالٰى, `{S}` ﷺ, `{A}` عَلَيْهِ السَّلَام, `{R}` رَضِيَ اللهُ عَنْهُ.
6. Branding: Uloom Online green `#124930`, gold `#E7B008`, off-white `#FBFBF8`, logo in a white chip.

## Round types (engine)
`intro` (show new letters), `letter` (pop the floating bubble), `wordfind` (which word has letter X), `mcq`, `tf`, `car` (truthfulness yes/no picture), `match` (tap pairs), `order` (tap story events in sequence), `sort` (good/bad cards).
Levels: one per lesson, plus a `mixed:true` level that samples all rounds plus `mixedExtra`.
Scoring: 10 ★ first try, 5 ★ after a mistake. Stars: ≥85% first-try = 3, ≥60% = 2. Best stars are saved in localStorage (no login, no data collected).

## New lesson checklist
1. Copy `site/class1-lessons-4-5` to `site/classN-lessons-X-Y` and rewrite `data.js` from the book.
2. Add a link in `site/index.html`.
3. Run `test_game.py` against the local server, check the screenshots, then commit and push (Pages redeploys in about a minute).

## Voice (ElevenLabs, added 24 Nov 2026)
- Every spoken line is a recorded MP3 in `site/class1-lessons-4-5/audio/<id>.mp3`. The id is a hash of the language and text (`voice.js` `UQV.id`), and `audio/manifest.js` lists the ids that exist. If a clip is missing, the game falls back to device speech and logs `MISSING_CLIP` to the console. The test fails on that warning.
- English voice: **Emma - Bright Kids Educator** (`oClOrzqamOXmtcB8iqTj`). Arabic voice: **Habibah**, young female MSA (`w4LX7bK479eHGM1k15Em`). Both use the `eleven_multilingual_v2` model and were generated through the ElevenLabs MCP connector (flow `Eg4YxZZPoE1J7RnvlEKI`).
- Pipeline:
  1. `node tools/build_voice_manifest.js` lists every clip in `tools/voice_clips.json`. It must mirror the `speak()` calls in game.js.
  2. Make batches (`tools/batches.json`) with lines joined by `<break time="1.5s" />`.
  3. Generate one ElevenLabs take per batch and save it to `voice-raw/<batch>.mp3`.
  4. `python3 tools/split_batches.py` splits each batch on its N−1 longest silences, trims, loudness-normalises and encodes mono 24 kHz 40 kbps MP3. It also writes the manifest.
- English pronunciation tweaks are in `voice.js` `norm()`: {T} → "ta'ala", {S} → "sallallahu alayhi wa sallam", {A} → "alayhis salaam", Allaah → Allah, Nabee → Nabi.
- For a new lesson, run steps 1–4 for the new texts only. Clips are keyed by text, so existing clips are reused.
