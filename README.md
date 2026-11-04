# Windows 95: The Sorry Computer — Personal Edition

An authentic, fully interactive Windows 95 desktop simulation created exclusively as a heartfelt, personalized apology computer for my girlfriend.

Built with React 19, TypeScript, styled-components, and official Google Gemini Nano Banana image generation.

---

## 🌟 The Five Apology Applications

The desktop features five fully functional, standalone applications dedicated to saying sorry:

1. **Sorry Hotline (`sorry-hotline`)**:
   - Interactive vintage telephone hardware with 12-key DTMF tone dialer (Web Audio API).
   - Dynamic LCD screen with dialed numbers, call duration timer, and status.
   - Multi-tier IVR automated telephone directory (Extensions 101–104, 000).
   - Cassette voice player with progress scrubber and Web Speech API fallback.

2. **The Court of Her Name (`court-of-her-name`)**:
   - Preside as the sole and supreme Judge of the relationship.
   - Interactive courtroom gavel with wood-strike sound and physical swing animation.
   - Full case docket, four formal charges, prosecution evidence exhibits, and sworn confession.
   - Verdict selection (Guilty, Dismissed with Conditions, Recess / Need Time), customizable penances, and official downloadable Judicial Decree certificate.

3. **Sorry Vending Machine (`sorry-vending-machine`)**:
   - Vintage 1995 Japanese/American automat with illuminated display shelves.
   - Interactive coin insertion slot with mechanical audio feedback.
   - Alphanumeric keypad selection and physical dropping item animation.
   - Flashing collection tray door, keepsake cards with redemption coupon codes, and printed receipts.

4. **Boss Fight: My Ego (`boss-fight-ego`)**:
   - 60 FPS HTML5 Canvas arcade action game loop.
   - Deflate the boyfriend's stubborn Ego Boss monster using kindness and truth attacks.
   - AI-generated character sprites for both the Player Heroine and the Ego Boss.
   - Multi-phase boss dialogue, floating combat damage, particle bursts, and touch controls for mobile.

5. **Sorry Is Out for Delivery (`sorry-delivery`)**:
   - Live 7-stage package tracking system with progress bar and timestamped logistics checkpoints.
   - Manual and auto-simulated transit modes.
   - Arrival doorbell chime ("Ding-Dong"), unboxing parcel ceremony, formal apology letter, and digital signature acceptance.

---

## 💻 Operating System Environment

- **Authentic Windows 95 Desktop**: Custom high-resolution wallpaper, desktop shortcuts, beveled retro styling (`98.css` / `react95`).
- **Window Management System**: Window dragging, resizing, active window z-index layering, minimize, maximize, restore, and close.
- **Start Menu & Taskbar**: Full Programs menu, running application switching buttons, system tray volume mute toggle, and real-time clock.
- **Classic Utilities**: My Computer (drive browser), Recycle Bin, Minesweeper, and Cyber Portal.
- **Pure Web Audio Synthesizer**: Zero external audio dependencies; procedural DTMF sine waves, phone ringback, busy signals, gavel thuds, coin clinks, and doorbell chimes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm

### Installation & Local Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests
```bash
# TypeScript verification
npm run typecheck

# Code quality linting
npm run lint

# Run Playwright test suites
npx playwright test
```

### Building for Production
```bash
npm run build
npm run preview
```
