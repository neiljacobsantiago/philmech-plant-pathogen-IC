import { PathogenRecord } from './schema';

const DB_NAME = 'PICS_DB';
const STORE_NAME = 'pathogens';
const DB_VERSION = 1;

// Embedded reference seed data so no external data.js is required
const InitialPathogenRecords: Record<string, Omit<PathogenRecord, 'id'>> = {
    "Aspergillus flavus": {
        growthRate: "Rapid (3-5 days)",
        surfaceColor: "Yellowish-green to olive green",
        reverseColor: "Pale yellow to gold",
        myceliumTexture: "Velvety to floccose, distinct white margin"
    },
    "Aspergillus clavatus": {
        growthRate: "Moderate to Rapid (4-6 days)",
        surfaceColor: "Blue-green to slate green",
        reverseColor: "White to pale tan",
        myceliumTexture: "Dense, felty, white marginal zone"
    },
    "Aspergillus fumigatus": {
        growthRate: "Rapid (2-4 days)",
        surfaceColor: "Smoky green to dark grey-green",
        reverseColor: "White to yellowish-tan",
        myceliumTexture: "Velvety to powdery"
    },
    "Aspergillus tamarii": {
        growthRate: "Rapid (3-5 days)",
        surfaceColor: "Yellowish-brown to deep olive-brown",
        reverseColor: "Colorless to pale brown",
        myceliumTexture: "Loose, cottony to granular"
    },
    "Aspergillus niger": {
        growthRate: "Very Rapid (2-4 days)",
        surfaceColor: "Dense black to dark brown",
        reverseColor: "Pale yellow to white",
        myceliumTexture: "Carbonaceous, submerged white hyphae"
    }
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Seed the database directly from internal records
        Object.entries(InitialPathogenRecords).forEach(([key, value]) => {
          store.put({ id: key, ...value });
        });
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