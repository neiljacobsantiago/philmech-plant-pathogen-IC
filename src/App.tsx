import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AnalysisResult from './pages/AnalysisResult';
import appLogo from './assets/appLogo.png';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 animate-ping rounded-full bg-[#006837]/20"></div>
          <img src={appLogo} alt="PathoScan Logo" className="relative z-10 h-24 w-24 drop-shadow-xl" />
        </div>
        <h1 className="mt-8 text-4xl font-black tracking-tight text-[#006837] dark:text-emerald-500">PathoScan</h1>
        <p className="mt-3 animate-pulse text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Initializing Engine...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/result" element={<AnalysisResult />} />
      </Routes>
    </BrowserRouter>
  );
}