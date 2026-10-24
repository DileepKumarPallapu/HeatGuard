# HeatGuard Online Simulation

A standalone HTML/CSS/JavaScript dashboard for the atomQUEST 2026 Track 3 mixer-grinder concept.

## Important honesty / safety note
- All temperatures are generated in the browser; no physical sensor or mixer grinder is connected.
- This is a software simulation, not evidence of a completed hardware prototype.
- Thresholds are illustrative demo values, not validated safety limits for any real appliance.
- The system does not control or shut down a real appliance.
- The dashboard uses Chart.js from a CDN and Google Fonts; internet access is needed for those assets. The core interface and controls run locally in a modern browser.

## Run locally
1. Download and extract `HeatGuard_Online_Simulation.zip`.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. Click **Start simulation**.
4. Choose a scenario:
   - Normal operation
   - Gradual temperature rise
   - Rapid rise / warning test
   - Cooling down
   - Manual temperature
5. Adjust thresholds to explore the demo states.
6. Click **Export log** to download a CSV of generated events.

No package installation or build step is required.

## Deploy on GitHub Pages
1. Create a GitHub repository, for example `heatguard-online`.
2. Upload `index.html`, `styles.css`, `app.js`, and this README to the repository root.
3. Open the repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/(root)`, then save.
6. Wait for GitHub Pages to publish. The URL appears in Settings → Pages.

## Deploy on Vercel
1. Create a repository on GitHub and upload the same files to its root.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import your GitHub repository.
4. Choose **Other** as framework preset if prompted.
5. Leave Build Command and Output Directory empty/default; this is a static site.
6. Deploy. Vercel will provide a public URL.

## Team
- Pallapu Dileep Kumar — Team Leader
- Shaik Baji Babu
- Botchu Sumanth
- Kaja Yeshwanth
- Meesaragandla Naga Sahithi Kiran

Institution: Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology, Avadi, Chennai, Tamil Nadu.

Team name shown: GrindSense Innovators (proposed; confirm the official registered team name before submission).
