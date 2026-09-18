import { PathogenRecord, PathogenScore } from './schema';

const DB_NAME = 'PICS_DB';
const STORE_NAME = 'pathogens';
const SESSION_STORE = 'session';
const DB_VERSION = 3; // bumped from 2 — clavatus removed, terreus added, all 5 characteristic sets refreshed from client's Fungal_ID_data.docx (PDA rows only). If v3 was already pushed to any device before this content refresh, bump to 4.

// Source: PhilMech LSD "Fungal_ID_data.docx", PDA rows only (MEA/CYA rows in the source are not used here).
// Where a species had multiple PDA trials in the source doc with no stated canonical run,
// the most complete trial was used as the primary value; alternates are noted per entry.
const InitialPathogenRecords: Record<string, Omit<PathogenRecord, 'id'>> = {
    "Aspergillus flavus": {
        // Primary: trial w/ clear exudates noted (31.94–63.00mm). Alternates in source doc:
        // (a) 32.29–58.71mm, green surface, brown/smooth reverse, white mycelium
        // (b) 33.47–62.14mm, white-to-green surface, white/smooth reverse, white mycelium
        growthRate: "Rapid (32–63 mm colony diam. on PDA)",
        surfaceColor: "Green to dark green",
        reverseColor: "Clear, smooth",
        myceliumTexture: "White, with clear exudates"
    },
    "Aspergillus terreus": {
        growthRate: "Rapid (29–65 mm colony diam. on PDA)",
        surfaceColor: "Brown",
        reverseColor: "Clear, slightly wrinkled",
        myceliumTexture: "White"
    },
    "Aspergillus fumigatus": {
        growthRate: "Rapid (33–64 mm colony diam. on PDA)",
        surfaceColor: "Pale green",
        reverseColor: "Brown, wrinkled",
        myceliumTexture: "White"
    },
    "Aspergillus tamarii": {
        // Primary: 29.96–54.82mm trial. Alternate in source doc:
        // 32.98–57.83mm, dark green surface, light brown/wrinkled reverse, green mycelium
        growthRate: "Moderately rapid (30–55 mm colony diam. on PDA)",
        surfaceColor: "Dark green",
        reverseColor: "Brown, slightly wrinkled",
        myceliumTexture: "White"
    },
    "Aspergillus niger": {
        growthRate: "Rapid (31–62 mm colony diam. on PDA)",
        surfaceColor: "Black",
        reverseColor: "Black, smooth",
        myceliumTexture: "White"
    }
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = (event.target as IDBOpenDBRequest).transaction!;

      const store = db.objectStoreNames.contains(STORE_NAME)
        ? tx.objectStore(STORE_NAME)
        : db.createObjectStore(STORE_NAME, { keyPath: 'id' });

      // Clear + reseed on every version bump so retired/changed species don't
      // linger on devices that already ran an older DB_VERSION.
      store.clear();
      Object.entries(InitialPathogenRecords).forEach(([key, value]) => {
        store.put({ id: key, ...value });
      });

      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getPathogenById = async (id: string): Promise<PathogenRecord | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// New: powers ReferenceSheet.tsx, so the reference lookup reads the same
// seeded IndexedDB records AnalysisResult.tsx cross-checks against,
// instead of a separately hardcoded copy of the same data.
export const getAllPathogens = async (): Promise<PathogenRecord[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const saveSession = async (imageFile: Blob, predictions: PathogenScore[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, 'readwrite');
    tx.objectStore(SESSION_STORE).put({ id: 'current', imageFile, predictions, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadSession = async (): Promise<{ imageFile: Blob; predictions: PathogenScore[] } | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, 'readonly');
    const request = tx.objectStore(SESSION_STORE).get('current');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};