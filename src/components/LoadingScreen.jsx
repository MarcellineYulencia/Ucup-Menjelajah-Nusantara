import React, { useState, useEffect } from 'react';

function LoadingScreen({ onStartGame }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 100) {
        setLoadingProgress(progress);
      } else {
        clearInterval(interval);
        setShowStartButton(true); // Tombol muncul setelah loading selesai
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleStartButtonClick = () => {
    setFadeOut(true); // Animasi keluar
    setTimeout(() => {
      onStartGame(); // Pindah stage
    }, 1000);
  };

  return (
    <div id="loadingScreen" className={fadeOut ? 'fade-out' : ''}>
      <video autoPlay muted loop className="fullscreen-video">
        <source src="assets/loadingscreen.mp4" type="video/mp4" />
      </video>

      <div className="loading-container">
        <img src="assets/logojjk.png" className="logo" alt="Game Logo" />
        <div className="loading-bar">
          <div className="progress" style={{ width: `${loadingProgress}%` }}></div>
        </div>

        {/* Tampilkan tombol hanya saat loading selesai */}
        <button
          id="startButton"
          className={`btn-start ${showStartButton ? 'show' : ''}`}
          onClick={handleStartButtonClick}
        >
          Mulai
        </button>
      </div>
    </div>
  );
}

export default LoadingScreen;
