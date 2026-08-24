### PHilMech - Laboratory Services Division Pathogen Classifier

An offline-first Progressive Web App (PWA) designed as a low-cost, serverless Edge AI tool for localized fungal classification.

**System Architecture**
*   **Core Framework:** A modern Single Page Application (SPA) operating natively within the client browser, currently transitioning into a fully component-based structure.
*   **Machine Learning:** Lightweight Edge AI executing image classification natively on-device, completely bypassing external server dependencies.
*   **Local Storage:** Native browser-based storage structured specifically for an air-gapped laboratory environment. It utilizes a strictly normalized database schema to manage biological hierarchies and physical traits without data duplication. No cloud retention or historical data logging is enabled in this build.

**UI/UX & Design System**
*   **Theme & Styling:** Utilizes a modern, responsive styling framework to create a fluid "liquid glass" layout, incorporating subtle borders, semi-glassmorphism blurs, and enhanced typography. The color palette relies on high-contrast minimalist tones paired with a distinct organizational accent color.
*   **Primary Workflow:** A mobile-optimized, minimal-click capture and analysis loop. Core navigation and actions remain persistently accessible via a fixed floating dock at the bottom of the screen.
*   **Data Visualization:** Analysis results are structured into modular interface components: a primary identification card, visual probability bars mapping the AI's confidence spread, and clean vertical lists for cross-referencing physical traits.
*   **Camera Integration:** Native smartphone camera hooks equipped with a local device gallery fallback.

**ISO/IEC 25010 Software Quality Compliance**
*   **Functional Suitability:** The system enforces a strict high-confidence threshold (90%) for automated positive identification. Scans falling below this baseline automatically trigger system warnings that mandate confirmatory manual validation. To assist the user, the architecture automatically retrieves and displays the corresponding pre-determined cultural characteristics alongside the AI output.
*   **Performance Efficiency:** Engineered for complete localized execution without internet latency. The optimized frontend environment and quantized AI model ensure that image processing, database queries, and inferences happen rapidly on standard client hardware without causing computational throttling or severe battery drain.
*   **Usability:** Structured specifically as a one-handed, mobile-first assistive tool for laboratory personnel working directly with biological samples[cite: 1]. By instantly translating raw diagnostic predictions into readable physical traits, the interface reduces physical workflow disruption and entirely bypasses the need for manual data entry[cite: 1].
