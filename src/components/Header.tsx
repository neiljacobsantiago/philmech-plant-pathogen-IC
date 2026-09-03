import React from 'react';
import appLogo from '../assets/appLogo.png';
import userIcon from '../assets/userIcon.png';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'WELCOME, USER!',
  subtitle = 'Plant Pathogen Image Classification System',
  showBack = false,
  onBack,
}) => {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-md transition active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : (
        <img src={appLogo} alt="PICS Logo" className="h-10 w-10 object-contain" />
      )}

      <div className="text-right">
        <h2 className="text-xs font-black tracking-wider text-slate-900 uppercase">{title}</h2>
        <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/80 overflow-hidden shadow-sm">
        <img src={userIcon} alt="Avatar" className="h-full w-full object-cover" />
      </div>
    </header>
  );
};