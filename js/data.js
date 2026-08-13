/**
 * Hardcoded reference data. 
 * Overkill gumamit ng IndexedDB para sa 5 items lang, wag mo na pilitin. 
 * I-lookup nalang natin 'to ng diretso sa script.js para instant load, walang await bullshit.
 */

const AspergillusData = {
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