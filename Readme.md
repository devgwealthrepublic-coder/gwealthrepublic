# G-Wealth Republic Digital Infrastructure

Welcome to the central repository for **G-Wealth Republic** (operating officially as GWealth Properties). This project houses the complete digital estate infrastructure, spanning the WordPress frontend components, the custom Elementor widgets, and the secure MERN stack backend portals.

## About the Company
G-Wealth Republic is a premium physical real estate development company operating primarily in Aba, Asaba, and Port Harcourt, Nigeria. We operate with a strict **₦0.00 Agency and Documentation Fee** policy. 

**Critical Legal Context:** G-Wealth strictly sells physical land allocations. We do **not** operate daily contributions, micro-savings, or yield-bearing cooperative programs.

---

## Technical Architecture

This repository is uniquely structured as a hybrid decoupled architecture:

### 1. WordPress Frontend (Headless-Style Widgets)
Instead of relying on bloated WordPress themes, the frontend is built using isolated, scoped vanilla HTML/CSS/JS components injected into Elementor HTML widgets. This ensures maximum performance, strict brand control, and zero plugin conflicts.

### 2. Custom PHP Logic (`wordpress-scripts/`)
We utilize custom PHP snippets (deployed via WPCode or Child Theme `functions.php`) to handle:
- Automated Anti-Spam protection (XML-RPC blocking, strict link limits).
- Dynamic Hero Section injection for Single Blog Posts.
- WordPress Core cleanup.

### 3. MERN Backend & Portal (`mern-backend/` & `portal-frontend/`)
A fully independent Node.js/Express backend and React frontend that handles:
- Priority Queue Visitor logging via webhook/API handshakes.
- Partner/Realtor registration and offline commission tracking logic.
- Secure email dispatching via `emailService.js`.

---

## Secure Horizon Design System (Strict Guidelines)

All frontend components MUST adhere to the **Secure Horizon Design Map**.

### Typography
- **Headers (`h1` - `h6`)**: `Plus Jakarta Sans` (Weights: 600, 700, 800)
- **Body Copy**: `Lexend` (Weights: 400, 500, 600)

### Color Palette
- **Deep Blue (Primary):** `#27267d`
- **Action Crimson (Accent/Alerts):** `#bb001b`
- **Dark Slate Text:** `#1E1B4B`
- **Canvas Gray (Backgrounds):** `#FAFAFA`
- **Security Gold (Badges/Icons):** `#D4AF37`

### Shape & Border Rule
- **STRICT 4px LIMIT:** All border radii (`border-radius`) across buttons, cards, images, and containers must be exactly `4px` to maintain an institutional, trustworthy, and premium architectural feel. 

---

## Directory Structure

```text
/
├── wordpress-widgets/         # Core Elementor HTML widget components
│   ├── header-widget.html     # Global responsive navigation header
│   └── legal-pages/           # Strictly scoped Privacy Policy & Terms of Service
├── homepage files/            # Scoped components for the main landing page
├── blog-page files/           # Blog Grid, CTA sections, and single post styling
├── contact page files/        # Contact forms and priority booking logic
├── elementor-about-page/      # About Us sections (Guarantees, Protocol, etc.)
├── elementor-properties-page/ # Property Hub cards and estate grids
├── mern-backend/              # Express/Node API Server
├── portal-frontend/           # React App for Partner/Realtor Onboarding
└── Readme.md                  # This file
```

---

## Local Development Setup

### Running the Backend & Portal
To run the decoupled backend APIs and the Realtor/Partner portal locally:

1. **Start the Express API Server:**
   ```bash
   cd mern-backend
   npm install
   npm run dev
   ```

2. **Start the React Frontend Portal:**
   ```bash
   cd portal-frontend
   npm install
   npm run dev
   ```

### WordPress Integration Workflow
When modifying frontend code:
1. Edit the scoped `.html` files in this repository.
2. Copy the entire file content (HTML + Scoped `<style>` + Scoped `<script>`).
3. Paste directly into the respective Custom HTML widget inside Elementor on the WordPress live/staging site.

---

## Security & Compliance
- **Data Encapsulation:** Form submissions and visitor greeting data bypass WordPress entirely, posting directly to the `mern-backend` APIs (`/api/visitors/log`).
- **Anti-Cooperative Disclaimers:** Hardcoded into the `legal-pages` to protect the corporate identity.

---
*Maintained by the G-Wealth Republic Engineering Team. Developed by JuTeLabs LIMITED*
