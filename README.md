# Uloom Quest: gamified syllabus for Ashraful Uloom Online

Playable, faceless, mobile-first HTML5 games built from the **Jamiatul Ulama SA Tas-heel series** and *Towards Reading the Qur'an Part 1*.
**Live:** https://suhailwadee.github.io/uloom-quest/class1/ (book hub; each book has its own link, see below) (the old `class1-lessons-4-5/` link redirects here).

## Class 1 v2: one section per book (25 Nov 2026)
Suhail asked for each book to be separate so it is clear which topic is being taught.
- **Hub:** `/class1/` shows one card per book. Each card has the book's short name, its exact title from the PDF cover, an icon and colour, the lesson and review count, and the stars and progress so far.
- **Per-book URLs** (shareable): `/class1/quran/`, `/class1/aqaaid/`, `/class1/fiqh/`, `/class1/akhlaaq/`, `/class1/hadeeth/`, `/class1/tareekh/`.
  - Each is a copy of `class1/index.html` with `<base href="../">` and `window.UQ_BOOK="<id>"`.
  - `#<id>` and `?book=<id>` also work.
  - `?level=<book>-<n>` opens a lesson directly. Old `?level=l4` / `r1` links map to `quran-4` / `quran-r1`.
  - In-app navigation keeps the address bar on the current book via `history.replaceState`. Audio and asset paths are absolute (computed from the page base) for this reason.
- **Books** are defined in `data.js` under `bookList` (id, short, title, publisher, say, icon, colour, reviews, parts, minRounds).

| id | Book (exact title) | Lessons | Reviews |
|---|---|---|---|
| quran | Towards Reading the Qur'an Part 1 (Lenasia Muslim Association) | 41 | 10 |
| aqaaid | Tas-heelul Aqaa-id 1 | 7 | 2 (1–4, 5–7) |
| fiqh | Tas-heelul Fiqh 1 | 31 | 4 (1–10, 11–16, 17–24, 25–31) |
| akhlaaq | Tas-heelul Akhlaaq 1 | 6 (L4 missing from the PDF) | 2 (1–3, 5–7) |
| hadeeth | Tas-heelul Ahaadeeth 1 | 10 | 2 (1–5, 6–10) |
| tareekh | Tas-heelut Taa-reekh 1 | 11 | 2 (1–6, 7–11) |

- **Levels** (`levels.js`): ids are `<book>-<n>`, where n is the lesson number in that book. Reviews are `<book>-r<k>` and belong to their book.
  - Short lessons get "revision of Lesson X" rounds from the same book's earlier lessons, up to `minRounds`. These reuse existing rounds and clips only.
  - Review pools draw only from that book.
- **Labels:** every round badge, the end screen, the certificate, the sticker labels and the certificate list read "<Book> – Lesson n", for example "Akhlaaq – Lesson 3". The full book title appears on the book map, the end screen and the certificate.
- **Voice:** the hub says "Assalamu alaikum! Choose a book.". A book map says its book name and then "Choose a lesson.". A lesson starts with the book name before the first question.
  - 8 new Emma clips (batch `c1books`, 255 credits).
  - Lesson numbers are not spoken, to avoid recording 41 number clips.
- **Storage migration:** this runs once and sets the `uq_migrated_v2` flag.
  - Old `uq_best_l<n>` / `uq_date_l<n>` are copied to every book's Lesson n.
  - Old `uq_best_r<k>` is copied to `quran-r<k>`, which has the same ranges.
  - Streak, name, sound and points keys are unchanged.
- **Stickers** are grouped per book: lesson stickers, golden stickers and review medals for each book, plus the special streak and star badges. Star moons now go up to 300 ★.
- **Test:** `test_game.py`, the per-book version (the old one is saved as `test_game_v0_lessons45.py.bak`). Run `python3 test_game.py [base_url] [all|ids,…] [desktop|phone|tablet]`. It checks:
  - the migration
  - the 6 hub cards
  - each book URL opening its own map
  - every level played through
  - stickers and the certificate
  - HTTP errors and `MISSING_CLIP`

## Class 1 full build (25 Nov 2026)
- `site/class1/` is the one game for all of Class 1.
  - `data.js` holds **all content** (41 lessons, page refs in `src`).
  - `levels.js` expands the data into 51 levels: 41 lessons plus 10 reviews (`r1`…`r10`).
  - `voice.js` handles clip ids and English pronunciation.
  - `game.js` is the engine, hub, rewards and certificate.
  - `style.css` and `audio/` (537 clips plus `manifest.js`) complete the folder.
- **Lesson map:** one level per lesson number, taken across all six books. For example, Lesson 7 is TRQ L7, Aqaa-id L7, Fiqh L7, Akhlaaq L7, Hadeeth H7 and Taa-reekh L7.
  - Units: 1–11 (all six books), 12–21, 22–31 (Qur'an and Fiqh) and 32–41 (Qur'an only).
  - A review level follows every 3–5 lessons.
  - All levels are open. The next unplayed one pulses.
- **Coverage:**
  - TRQ L1–41
  - Aqaa-id L1–7
  - Fiqh L1–31
  - Akhlaaq L1–3 and L5–7. **L4 "My speech" (book p12–13) is missing from the PDF.**
  - Hadeeth H1–H10
  - Taa-reekh L1–11
- **Bubble fix:**
  - On a correct pop, the motion stops, the other bubbles fade, and the right bubble grows in the centre with a gold ring, a "✓ letter" label, a star burst and its sound. Next appears after that.
  - On a wrong pop, the right bubble glows and slows down, and the voice says "Look, this one is …".
  - Every other round type also lights up the right answer after a wrong pick.
- **Rewards (localStorage only):** nothing is sent anywhere. There are no logins and no leaderboard. Keys are `uq_*`.
  - Stars: 10 for a first try, 5 after a mistake. Level stars are 3 at ≥85% first-try and 2 at ≥60%. The hub shows total stars.
  - Stickers (faceless SVGs):
    - one per lesson, which turns gold with 3 ★
    - a medal per review
    - lanterns for a 3/7/14/30-day streak
    - moons for 10/30/60/100/150 ★
  - The sticker page opens from the 🎖️ chip or with `?stickers`.
  - Daily streak 🏮: play on consecutive days.
  - Certificate per completed lesson: the child types a name (kept on the device), then downloads a PNG or prints it.
- **Voices:** Class 1 uses **Emma** for English (`oClOrzqamOXmtcB8iqTj`) and **Habibah** for Arabic (`w4LX7bK479eHGM1k15Em`) on `eleven_multilingual_v2`. **Riaz (`PZtJ1ekBnsKhMGPmdSUk`) is reserved for the higher classes.** Do not mix voices inside Class 1.
- **Voice pipeline (Class 1):**
  1. `node tools/build_voice_manifest_class1.js` writes the full clip list and the new-only list.
  2. `python3 tools/make_batches_class1.py` builds the batches with `<break time="1s"/>`.
  3. Generate each batch to `voice-raw/<name>.mp3`.
  4. `python3 tools/align_split.py <batch…>` splits the clips. It uses DP alignment on the silences, weighted by text length, and is more robust than `split_batches.py`. It also writes `audio/manifest.js`.
  - Breaks are billed as characters. "." separators are cheaper but do not split reliably, so do not use them.
- **Test:** `cd site && python3 -m http.server 8765 &` then `python3 test_class1.py [url] [level,ids]`.
  - It plays every level on desktop, phone and tablet, and screenshots the hub, bubble win, stickers and certificate into `screenshots-class1/`.
  - It reports `MISSING_CLIP`.

## Earlier notes (first build, lessons 4–5)
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
