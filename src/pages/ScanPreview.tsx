import React from 'react';


import appLogo from '../assets/appLogo.png';
import userIcon from '../assets/userIcon.png';
import analyzeIcon from '../assets/analyzeIcon.svg';
import cameraIcon from '../assets/cameraIcon.svg';
import uploadIcon from '../assets/uploadIcon.svg';

export const ScanPreview: React.FC = () => {
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

    
      <section className="specimen-card" id="specimenCard">
        <img id="imagePreview" src="" alt="Specimen Preview" style={{ display: 'none' }} />
        <button
          type="button"
          className="btn-close-preview"
          id="clearBtn"
          style={{ display: 'none' }}
          aria-label="Clear image"
        >
          &times;
        </button>
      </section>
      <p className="status-text" id="statusText">
        No image selected
      </p>

    
      <div className="btn-stack mt-auto" style={{ width: '100%' }}>
        <button
          type="button"
          className="btn-action btn-primary"
          id="scanAnalyzeBtn"
          style={{ backgroundColor: '#006b3f', color: 'white', marginBottom: '10px' }}
        >
          <img
            src={analyzeIcon}
            alt="Analyze"
            style={{ width: '24px', height: '24px', marginRight: '8px', filter: 'brightness(0) invert(1)' }}
          />
          Analyze Image
        </button>

        <button type="button" className="btn-action" id="scanCameraBtn">
          <img
            src={cameraIcon}
            alt="Camera"
            style={{ width: '24px', height: '24px', marginRight: '8px' }}
          />
          Use Camera
        </button>

        <button type="button" className="btn-action" id="scanUploadBtn">
          <img
            src={uploadIcon}
            alt="Upload"
            style={{ width: '24px', height: '24px', marginRight: '8px' }}
          />
          Upload File
        </button>
      </div>

    
      <input type="file" id="fileInput" accept="image/*" style={{ display: 'none' }} />
      <input type="file" id="cameraInput" accept="image/*" capture="environment" style={{ display: 'none' }} />

     
      <footer className="version-tag mt-auto">
        VERSION 0.1.6 | MODEL VERSION 2.0
      </footer>
    </main>
  );
};

export default ScanPreview;