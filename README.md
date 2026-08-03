# PHilMech - Laboratory Services Division Pathogen Classifier

An offline-first Progressive Web App (PWA) designed as a low-cost alternative, serverless machine learning for *certain *Aspergillus* classification.

## System Architecture
* **Core Framework:** Vanilla Web Stack (HTML5, CSS with Grid and Flexbox, Vanilla JS)
* **Machine Learning:** TensorFlow.js (Offline model execution)
* **Local Storage:** IndexedDB (Secure, on-device ledger)

## UI/UX & Design System
* **Theme:** High-contrast, minimalist (Black, White, and `#006837` accent).
* **Primary Workflow:** Mobile-first, 4-5-click capture and analysis workflow.
* **Camera Integration:** Native smartphone camera integration with local device gallery fallback. 

## ISO Software Quality Compliance
* **Functional Suitability:** Mandatory 90% AI confidence threshold for positive identification.
* **Performance Efficiency:** Zero external server calls; fully localized WebGL processing.
* **Usability:** Designed for seamless laboratory technician workflows.
