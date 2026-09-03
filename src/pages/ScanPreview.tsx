import { set } from 'idb-keyval';
import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import appLogo from '../assets/appLogo.png';
import userIcon from '../assets/userIcon.png';
import analyzeIcon from '../assets/analyzeIcon.svg';
import cameraIcon from '../assets/cameraIcon.svg';
import uploadIcon from '../assets/uploadIcon.svg';

export default function ScanPreview() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Added state for the raw file

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save the raw file for IndexedDB
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleClear = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setSelectedFile(null); // Clear the raw file
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // New function to save to database before navigating
  const executeAnalysis = async () => {
    if (selectedFile) {
      await set('current_scan', selectedFile);
      navigate('/result');
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-white p-5 shadow-lg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 pb-4">
        <img src={appLogo} alt="App Logo" className="h-9 w-9 object-contain" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Welcome, Neil Jacob!</h2>
            <p className="text-[10px] text-slate-500">Plant Pathogen Classification</p>
          </div>
          <img src={userIcon} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
        </div>
      </header>

      {/* Preview Container */}
      <section className="my-auto flex flex-col items-center justify-center">
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          {selectedImage ? (
            <>
              <img src={selectedImage} alt="Specimen Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white transition hover:bg-black"
                aria-label="Clear image"
              >
                &times;
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p className="text-sm font-medium">No image selected</p>
              <p className="text-xs">Take a photo or upload an image below</p>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">
          {selectedImage ? 'Image ready to analyze' : 'Awaiting input'}
        </p>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {selectedImage && (
          <button
            type="button"
            onClick={executeAnalysis} // Triggers the IndexedDB save instead of direct navigation
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800"
          >
            <img src={analyzeIcon} alt="Analyze" className="h-5 w-5 brightness-0 invert" />
            Analyze Image
          </button>
        )}

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <img src={cameraIcon} alt="Camera" className="h-5 w-5" />
          Use Camera
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <img src={uploadIcon} alt="Upload" className="h-5 w-5" />
          Upload File
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageChange}
      />

      <footer className="mt-4 text-center text-[10px] text-slate-400">
        VERSION 0.1.6 | MODEL VERSION 2.0
      </footer>
    </main>
  );
}