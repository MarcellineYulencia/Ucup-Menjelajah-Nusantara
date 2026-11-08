import React, { useState } from 'react';
import '../styles/CharacterSelection.css';

function CharacterSelection({ characters, onCharacterSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideOut, setSlideOut] = useState(false);

  const handleNextCharacter = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
  };

  const handlePrevCharacter = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - 1 + characters.length) % characters.length
    );
  };

  const handleNext = () => {
    localStorage.setItem("playerAvatar", characters[currentIndex].avatar);
    setSlideOut(true);
    setTimeout(() => {
      onCharacterSelect(characters[currentIndex]); 
    }, 500); 
  };

  return (
   <div id="characterSelection" className={`character-selection-wrapper ${slideOut ? 'slide-out' : ''}`}>
  <div className="character-selection-container">
    <h1 className="text-center">Choose Character</h1>

    <div className="character-container">
      <button id="prevCharacter" className="nav-arrow" onClick={handlePrevCharacter}>◀</button>
      <div className="avatar-container">
        <img
          id="selectedAvatar"
          src={`assets/${characters[currentIndex].avatar}`}
          className="avatar"
          alt={characters[currentIndex].name}
        />
      </div>
      <button id="nextCharacter" className="nav-arrow" onClick={handleNextCharacter}>▶</button>
    </div>

    <div className="button-container">
      <button id="nextButton" className="btn btn-primary" onClick={handleNext}>
        Next
      </button>
    </div>
  </div>
</div>

  );
}

export default CharacterSelection;