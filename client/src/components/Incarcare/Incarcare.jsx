import React from 'react';
import './Incarcare.css';

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">Datele se încarca...</p>
    </div>
  );
};

export default LoadingScreen;