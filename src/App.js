// App.jsx
import React, { useState } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';

import MainMenu from './components/MainMenu';
import LoadingScreen from './components/LoadingScreen';
import NameEntry from './components/NameEntry';
import CharacterSelection from './components/CharacterSelection';
import GlobalStatusBar from './components/GlobalStatusBar';

import Rumah from './components/areas/Rumah';
import Pantai from './components/areas/Pantai';
import Hutan from './components/areas/Hutan';
import Tambang from './components/areas/Tambang';
import Pasar from './components/areas/Pasar';

import { StatusProvider, useStatus } from './contexts/StatusContext';

import './index.css';
import './App.css';

const GlobalGameOverScreen = () => {
  const { gameOver, resetGame, playerStatus, inventory, visitedAreas, activityLog } = useStatus();
  const navigate = useNavigate();

  const calculateScore = () => {
    let score = 0;

    for (const key of ['meal', 'sleep', 'happiness', 'hygiene']) {
      score += Math.max(0, playerStatus[key]);
    }

    const itemCount = Object.values(inventory).reduce((total, item) => total + (item.quantity || 1), 0);
    score += itemCount * 5;

    score += visitedAreas?.size * 20;

    score += activityLog?.length * 10;

    return score;
  };

  const finalScore = calculateScore();

  const handleStartAgain = () => {
    resetGame();
    navigate('/');
  };

  if (!gameOver) return null;

  return (
    <div id="gameOverScreen">
      <h2>GAME OVER</h2>
      <p>Status kamu habis!</p>
      <p><strong>Life Satisfaction Score:</strong> {finalScore}</p>
      <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: '300px' }}>
        <li>Status total: {playerStatus.meal + playerStatus.sleep + playerStatus.happiness + playerStatus.hygiene}</li>
        <li>Item dikumpulkan: {Object.keys(inventory).length}</li>
      </ul>
      <button onClick={handleStartAgain} className="start-again-btn">🔁 Start Again</button>
    </div>
  );
};

const BaseLayout = ({ playerName, characterImage }) => (
  <>
    <GlobalStatusBar />
    <GlobalGameOverScreen />
    <Outlet context={{ playerName, characterImage }} />
  </>
);

function App() {
  const [stage, setStage] = useState('loading');
  const [playerName, setPlayerName] = useState('');
  const [characterImage, setCharacterImage] = useState('character_default.png');
  const navigate = useNavigate(); // ✅ Tambahkan ini

  const handleStartGame = () => setStage('character');
  const handleCharacterSelect = (character) => {
    setCharacterImage(character.avatar);
    setStage('name');
  };
  const handleNameEnter = (name) => {
    setPlayerName(name);
    setStage('main');
    navigate('/'); // ✅ Navigasi ke MainMenu
  };

  const characterOptions = [
    { name: 'Gojo', avatar: 'gojotes-unscreen.gif' },
    { name: 'Yuji', avatar: 'yujites-unscreen.gif' },
    { name: 'Nobara', avatar: 'megumites.gif' },
  ];

  return (
    <StatusProvider>
      <div className="App">
        <div id="fade" className="fade-screen"></div>

        {stage === 'loading' && <LoadingScreen onStartGame={handleStartGame} />}
        {stage === 'character' && <CharacterSelection characters={characterOptions} onCharacterSelect={handleCharacterSelect} />}
        {stage === 'name' && <NameEntry onNameEnter={handleNameEnter} />}
        {stage === 'main' && (
          <Routes>
            <Route element={<BaseLayout playerName={playerName} characterImage={characterImage} />}>
              <Route path="/" element={<MainMenu playerName={playerName} characterImage={characterImage} />} />
              <Route path="/main-menu" element={<MainMenu playerName={playerName} characterImage={characterImage} />} />
              <Route path="/rumah" element={<Rumah />} />
              <Route path="/pantai" element={<Pantai />} />
              <Route path="/hutan" element={<Hutan />} />
              <Route path="/tambang" element={<Tambang />} />
              <Route path="/pasar" element={<Pasar />} />
            </Route>
          </Routes>
        )}
      </div>
    </StatusProvider>
  );
}

export default App;
