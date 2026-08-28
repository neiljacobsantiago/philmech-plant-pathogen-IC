type Prediction = {
  scientific_name: string;
  probability: number;
};

export default function AnalysisResult() {
  const predictions: Prediction[] = [
    { scientific_name: "Fusarium oxysporum", probability: 91.3 },
    { scientific_name: "Rhizoctonia solani", probability: 5.8 },
    { scientific_name: "Alternaria alternata", probability: 1.7 },
    { scientific_name: "Colletotrichum gloeosporioides", probability: 0.8 },
    { scientific_name: "Pythium spp.", probability: 0.4 },
  ];

  const topMatch = predictions[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto max-w-4xl px-5 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            id="backToDashBtn"
            type="button"
            onClick={() => window.history.back()}
            className="text-sm font-medium text-slate-700 transition hover:text-emerald-700"
          >
            ← Back
          </button>

          <span className="text-xs font-bold tracking-[0.2em] text-slate-500">
            ANALYSIS RESULT
          </span>

          <div className="w-10" />
        </div>

        {/* Image Preview */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-lg backdrop-blur-md">
          <img
            id="scannedImageDisplay"
            src="https://placehold.co/1200x400"
            alt="Analyzed Specimen"
            className="block max-h-[220px] w-full object-cover"
          />

          <span className="absolute right-3 top-3 rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold uppercase text-white shadow">
            ✓ Analyzed
          </span>
        </div>

        {/* Top Match Card */}
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/60 p-6 shadow-xl backdrop-blur-md">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Top Match • Species Name
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">

            <div>
              <h1
                id="speciesName"
                className="text-3xl font-bold italic text-slate-900"
              >
                {topMatch.scientific_name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Confidence Score:{" "}
                <strong
                  id="confidenceText"
                  className="text-slate-700"
                >
                  {topMatch.probability}%
                </strong>
              </p>
            </div>

            <span
              id="topScoreBadge"
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow"
            >
              {topMatch.probability}%
            </span>

          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-slate-200" />

        {/* Probability Matrix */}
        <div className="mb-6">

          <p className="mb-4 text-xs uppercase tracking-wider text-slate-500">
            Pathogen Probability Matrix
          </p>

          <div id="matrixRows" className="space-y-4">

            {predictions.map((prediction) => (
              <div
                key={prediction.scientific_name}
                className="rounded-xl border border-white/50 bg-white/50 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className="mb-2 flex justify-between text-sm italic">
                  <span>{prediction.scientific_name}</span>
                  <span>{prediction.probability}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                    style={{
                      width: `${prediction.probability}%`,
                    }}
                  />
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-slate-200" />

        {/* Macroscopic Characteristics */}
        <div className="rounded-2xl border border-white/50 bg-white/60 p-5 shadow-md backdrop-blur-md">

          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
            Macroscopic Characteristics (Expected PDA Colony)
          </h4>

          <div className="space-y-3 text-sm">

            <div className="border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-700">
                Growth Rate:
              </span>{" "}
              <span id="charGrowthRate">
                Fast Growing
              </span>
            </div>

            <div className="border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-700">
                Surface Color:
              </span>{" "}
              <span id="charSurfaceColor">
                White to Pink
              </span>
            </div>

            <div className="border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-700">
                Reverse Color:
              </span>{" "}
              <span id="charReverseColor">
                Purple
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700">
                Mycelium Texture:
              </span>{" "}
              <span id="charMycelium">
                Cottony
              </span>
            </div>

          </div>
        </div>

        {/* Button */}
        <button
          id="classifyAnotherBtn"
          type="button"
          className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-800"
        >
          Classify Another Sample
        </button>

        {/* Limitation */}
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">

          <strong>LIMITATION:</strong> Accuracy is affected by
          lighting and image quality. Model restricted to 5 target
          pathogens. This tool accelerates preliminary classification
          and does not replace standard laboratory processes.

        </div>

        {/* Footer */}
        <footer className="mt-5 text-center text-xs text-slate-400">
          VERSION 0.1.6  | MODEL VERSION 2.0
        </footer>

      </div>
    </main>
  );
}