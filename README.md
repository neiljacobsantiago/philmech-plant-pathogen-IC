# PHilMech Pathogen Classifier

This is a strictly offline Progressive Web App (PWA) built to classify fungal pathogens. It runs entirely on the edge. No servers, no API calls, no cloud data harvesting. It is engineered explicitly for air-gapped laboratory environments. 

## Architecture & Infrastructure
* **Frontend:** A modern SPA currently migrating to a strict, component-driven architecture. 
* **Edge AI:** Lightweight image classification executing natively on-device. It processes inference locally without relying on external network dependencies.
* **Storage:** Air-gapped, browser-native storage. The database schema is strictly normalized to map biological hierarchies without data duplication. We do not log historical scans or retain cloud backups.

## Interface & Workflow
* **Mobile-First UX:** Built for one-handed operation. Lab techs handle physical samples and petri dishes; they need a frictionless capture-and-analysis loop, not nested menus. Core actions are locked to a fixed bottom dock.
* **Styling:** High-contrast minimalist typography layered over a responsive "liquid glass" (glassmorphism) layout. Clean, readable, and gets out of the way.
* **Data Visualization:** Modular UI components break down the analysis. It outputs a primary ID card, raw probability bars for the AI's confidence spread, and clean lists for cross-referencing physical traits.
* **Hardware:** Native camera hooks with a local gallery fallback.

## ISO/IEC 25010 Compliance Guardrails
* **Functional Suitability:** The model enforces a hard 90% confidence threshold. Anything lower immediately triggers a manual validation warning. The system automatically fetches pre-determined cultural characteristics alongside the prediction to force human cross-checking.
* **Performance Efficiency:** Zero internet latency. The frontend and quantized AI model are optimized to process queries and inferences rapidly on standard client hardware without throttling the CPU or killing the battery.
* **Usability:** It instantly translates raw diagnostic predictions into readable physical traits. This kills the need for manual data entry and minimizes workflow disruption on the lab floor.
