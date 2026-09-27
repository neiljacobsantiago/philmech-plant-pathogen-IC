import { PathogenRecord, PathogenScore } from "./schema";

const DB_NAME = "PICS_DB";
const STORE_NAME = "pathogens";
const SESSION_STORE = "session";

// Bumped from 2 -> 3: Aspergillus clavatus removed, A. terreus added, and all
// 5 characteristic sets refreshed from the client's Fungal_ID_data.docx (PDA
// rows only). If a future content-only refresh needs to reach devices that
// already ran v3, bump this again - the store is cleared and reseeded on
// every version change (see initDB's onupgradeneeded below).
const DB_VERSION = 3;

/**
 * Seed data for the "pathogens" store, keyed by species name.
 *
 * Source: PhilMech LSD "Fungal_ID_data.docx", PDA rows only (the source
 * doc's MEA/CYA rows are not used here). Where a species had multiple PDA
 * trials with no stated canonical run, the most complete trial was used as
 * the primary value; alternates are noted per entry below.
 */
const INITIAL_PATHOGEN_RECORDS: Record<string, Omit<PathogenRecord, "id">> = {
  "Aspergillus flavus": {
    // Primary: trial w/ clear exudates noted (31.94-63.00mm). Alternates in
    // the source doc:
    //   (a) 32.29-58.71mm, green surface, brown/smooth reverse, white mycelium
    //   (b) 33.47-62.14mm, white-to-green surface, white/smooth reverse, white mycelium
    growthRate: "Rapid (32-63 mm colony diam. on PDA)",
    surfaceColor: "Green to dark green",
    reverseColor: "Clear, smooth",
    myceliumTexture: "White, with clear exudates",
  },
  "Aspergillus terreus": {
    growthRate: "Rapid (29-65 mm colony diam. on PDA)",
    surfaceColor: "Brown",
    reverseColor: "Clear, slightly wrinkled",
    myceliumTexture: "White",
  },
  "Aspergillus fumigatus": {
    growthRate: "Rapid (33-64 mm colony diam. on PDA)",
    surfaceColor: "Pale green",
    reverseColor: "Brown, wrinkled",
    myceliumTexture: "White",
  },
  "Aspergillus tamarii": {
    // Primary: 29.96-54.82mm trial. Alternate in the source doc:
    //   32.98-57.83mm, dark green surface, light brown/wrinkled reverse, green mycelium
    growthRate: "Moderately rapid (30-55 mm colony diam. on PDA)",
    surfaceColor: "Dark green",
    reverseColor: "Brown, slightly wrinkled",
    myceliumTexture: "White",
  },
  "Aspergillus niger": {
    growthRate: "Rapid (31-62 mm colony diam. on PDA)",
    surfaceColor: "Black",
    reverseColor: "Black, smooth",
    myceliumTexture: "White",
  },
};

/** Session record persisted so an in-progress scan survives a page reload. */
interface SessionRecord {
  imageFile: Blob;
  predictions: PathogenScore[];
}

/**
 * Wraps a native IndexedDB request in a Promise, resolving with its result
 * or rejecting with its error. Centralizes the onsuccess/onerror plumbing
 * that every read in this module would otherwise repeat.
 */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cached so repeated calls to initDB() share one open connection instead of
// each reopening the database. Cleared on failure so a later call can retry.
let dbConnection: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (dbConnection) return dbConnection;

  dbConnection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const upgradeTransaction = (event.target as IDBOpenDBRequest).transaction!;

      const pathogenStore = db.objectStoreNames.contains(STORE_NAME)
        ? upgradeTransaction.objectStore(STORE_NAME)
        : db.createObjectStore(STORE_NAME, { keyPath: "id" });

      // Clear + reseed on every version bump so retired/changed species
      // don't linger on devices that already ran an older DB_VERSION.
      pathogenStore.clear();
      Object.entries(INITIAL_PATHOGEN_RECORDS).forEach(
        ([speciesName, characteristics]) => {
          pathogenStore.put({ id: speciesName, ...characteristics });
        },
      );

      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbConnection = null;
      reject(request.error);
    };
  });

  return dbConnection;
};

export const getPathogenById = async (
  id: string,
): Promise<PathogenRecord | null> => {
  const db = await initDB();
  const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
  const record = await promisifyRequest<PathogenRecord | undefined>(
    store.get(id),
  );
  return record ?? null;
};

// Powers ReferenceSheet.tsx, so the reference lookup reads the same seeded
// IndexedDB records that AnalysisResult.tsx cross-checks against, instead of
// a separately hardcoded copy of the same data.
export const getAllPathogens = async (): Promise<PathogenRecord[]> => {
  const db = await initDB();
  const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
  return promisifyRequest<PathogenRecord[]>(store.getAll());
};

export const saveSession = async (
  imageFile: Blob,
  predictions: PathogenScore[],
): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // Waits for the whole transaction to commit (not just this one request)
    // since this write backs the "resume session on reload" flow and must
    // be durable before the caller proceeds.
    const transaction = db.transaction(SESSION_STORE, "readwrite");
    transaction.objectStore(SESSION_STORE).put({
      id: "current",
      imageFile,
      predictions,
      timestamp: Date.now(),
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const loadSession = async (): Promise<SessionRecord | null> => {
  const db = await initDB();
  const store = db
    .transaction(SESSION_STORE, "readonly")
    .objectStore(SESSION_STORE);
  const session = await promisifyRequest<SessionRecord | undefined>(
    store.get("current"),
  );
  return session ?? null;
};
