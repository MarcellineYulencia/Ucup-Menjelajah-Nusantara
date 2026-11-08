import React, { useState, useEffect, useRef } from 'react';
import '../styles/CharacterSelection.css'; // Atau buat file NameEntry.css jika ingin terpisah

function NameEntry({ selectedCharacter, onNameEnter }) {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });
  const nameInputRef = useRef(null);
  const [fadeActive, setFadeActive] = useState(false);

  useEffect(() => {
    if (nameInputRef.current) {
      if (!playerName && selectedCharacter?.name) {
        setPlayerName(selectedCharacter.name);
      }
      nameInputRef.current.readOnly = true;
      setFadeActive(true);
    }
  }, [playerName, selectedCharacter]);

  const handleEditName = () => {
    if (nameInputRef.current) {
      nameInputRef.current.readOnly = false;
      nameInputRef.current.focus();
    }
  };

  const handleStartAdventure = () => {
    if (!playerName.trim()) {
      alert('Nama tidak boleh kosong!');
      return;
    }
    localStorage.setItem('playerName', playerName.trim());
    onNameEnter(playerName.trim());
  };

  return (
    <div id="nameEntry" className={`name-entry-wrapper ${fadeActive ? 'active' : ''}`}>
      <div className="name-entry-container">
        {/* Kolom kiri: Input Nama */}
        <div className="text-center">
          <h2>Enter Your Name</h2>
          <div className="name-input-container">
            <input
              type="text"
              id="playerName"
              className="form-control"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              ref={nameInputRef}
              readOnly
            />
            <img
              src="assets/pencil.png"
              id="editName"
              className="edit-icon"
              onClick={handleEditName}
              alt="Edit Name"
            />
          </div>
          <button id="startGame" className="btn btn-success mt-3" onClick={handleStartAdventure}>
            Start Adventure
          </button>
        </div>

        {/* Kolom kanan: Gambar karakter */}
        {selectedCharacter?.fullBody && (
          <img
            id="fullBodyCharacter"
            src={`assets/${selectedCharacter.fullBody}`}
            className={`full-body-img ${fadeActive ? 'fade-in' : ''}`}
            alt={selectedCharacter?.name || 'Character'}
          />
        )}
      </div>
    </div>
  );
}

export default NameEntry;
