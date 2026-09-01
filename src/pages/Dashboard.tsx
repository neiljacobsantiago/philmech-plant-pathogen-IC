
import React from 'react';


import appLogo from '../assets/appLogo.png';
import userIcon from '../assets/userIcon.png';
import cameraIcon from '../assets/cameraIcon.svg';
import uploadIcon from '../assets/uploadIcon.svg';

export const Dashboard: React.FC = () => {
  return (
    <main className="app-wrapper p-20">
      
      <header className="scan-header">
        <img
          src={appLogo}
          alt="App Logo"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />

        <div className="scan-header-right">
          <div className="scan-user-info">
            <h2>WELCOME, USER!</h2>
            <p>Plant Pathogen Image Classification System</p>
          </div>
          <img src={userIcon} alt="User Avatar" className="profile-avatar-img" />
        </div>
      </header>

    
      <section className="camera-placeholder">
        <div className="bracket bracket-tl" />
        <div className="bracket bracket-tr" />
        <div className="bracket bracket-bl" />
        <div className="bracket bracket-br" />

        <svg
          className="placeholder-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="8" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <h3 className="placeholder-title">Place a sample to perform this action</h3>
        <p className="placeholder-subtitle">Use buttons below to begin</p>
      </section>

    
      <div className="bottom-controls mt-auto" style={{ width: '100%' }}>
 
        <div className="btn-stack">
          <button type="button" className="btn-action" id="dashCameraBtn">
            <img
              src={cameraIcon}
              alt="Camera"
              style={{ width: '24px', height: '24px', marginRight: '4px' }}
            />
            Use Camera
          </button>

          <button type="button" className="btn-action" id="dashUploadBtn">
            <img
              src={uploadIcon}
              alt="Upload"
              style={{ width: '24px', height: '24px', marginRight: '4px' }}
            />
            Upload File
          </button>
        </div>

       
        <input
          type="file"
          id="dashFileInput"
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          id="dashCameraInput"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
        />

      
        <footer className="version-tag">
          VERSION 0.1.4 | MODEL VERSION 2.0
        </footer>
      </div>
    </main>
  );
};

export default Dashboard;