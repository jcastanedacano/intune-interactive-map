# Microsoft Intune – Interactive Concept Map

Interactive visual map of the Microsoft Intune service ecosystem: Device Management, App Management, Endpoint Security, Provisioning & Updates, the Intune Suite add-ons, and the surrounding Entra + Defender platforms.

Views:
- **Graph** — force-directed map of components and their relationships
- **Grid** — heatmap of platform coverage (Windows / iOS / Android / macOS / Linux / Cloud PC)
- **Mindmap** — hierarchical "Intune components" and "Admin Center nav" presets
- **Story** — guided, scene-by-scene narratives (NIST CSF 2.0, ISO 27001, CIS, BYOD, Autopilot, Ransomware, Zero Trust, Copilot…)
- **Scenarios** — overlay popular compliance / use-case / deployment templates onto the graph

## Stack

React 18 + Vite 5 + Tailwind 3 + D3 7 + lucide-react.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

## Deploy

Deployed to Azure Static Web Apps via GitHub Actions (see `.github/workflows/azure-static-web-apps.yml`).
The `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret is the only thing required — the workflow builds with Vite and uploads `dist/`.

## Sibling maps

| Domain | Repo |
| --- | --- |
| Microsoft Purview | https://github.com/jcastanedacano/purview-interactive-map |
| Microsoft Defender | https://github.com/jcastanedacano/defender-interactive-map |
| Microsoft Entra ID | https://github.com/jcastanedacano/entra-id-interactive-map |
| Azure Security | https://github.com/jcastanedacano/azure-security-interactive-map |
| **Microsoft Intune** | **this repo** |

## Data model

All content lives under `src/data/`:

- `components.js` — the 34 Intune components, categories, prerequisites, Microsoft Learn URLs
- `edges.js` — relationships (data / signal / policy / escalation flows)
- `subtopics.js` — per-component sub-capability breakdowns shown in the detail panel
- `workloads.js` — platform coverage matrix (Windows / iOS / Android / macOS / Linux / Cloud PC)
- `scenarios.js` — overlay templates (frameworks, use cases, deployment models)
- `mindmaps.js` — hierarchical presets
- `storyData.js` + `stories/*.js` — story-mode narratives
