// src/components/MainMenu.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Menu.css';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../contexts/StatusContext';
import InventoryModal from './InventoryModal';

function MainMenu({ playerName, characterImage }) {
  const audioRef = useRef(null);
  const characterRef = useRef(null);
  const gameContainerRef = useRef(null);
  const navigate = useNavigate();

  const { status, gold, gameOver, changeStatus, setGold, resetGame, updateGold } = useStatus();

  const [isSoundOn, setIsSoundOn] = useState(() => {
    const savedSound = localStorage.getItem('isSoundOn');
    return savedSound ? JSON.parse(savedSound) : true;
  });

  const [characterPosition, setCharacterPosition] = useState({ x: 100, y: 100 });
  const [showInventory, setShowInventory] = useState(false);
  const [gameHours, setGameHours] = useState(6);
  const speed = 20;

  const toggleSound = () => setIsSoundOn(prev => !prev);
  const toggleInventory = () => setShowInventory(prev => !prev);

  useEffect(() => {
    const fadeEl = document.getElementById('fade');
    if (fadeEl) {
      fadeEl.classList.remove('active');
      fadeEl.style.opacity = '0';
      fadeEl.style.pointerEvents = 'none';
      fadeEl.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (isSoundOn) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
    localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
  }, [isSoundOn]);

  useEffect(() => {
    const playAudioOnInteraction = () => {
      if (audioRef.current && isSoundOn && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
      }
      document.removeEventListener("click", playAudioOnInteraction);
      document.removeEventListener("touchstart", playAudioOnInteraction);
    };
    if (isSoundOn) {
      document.addEventListener("click", playAudioOnInteraction);
      document.addEventListener("touchstart", playAudioOnInteraction);
    }
    return () => {
      document.removeEventListener("click", playAudioOnInteraction);
      document.removeEventListener("touchstart", playAudioOnInteraction);
    };
  }, [isSoundOn]);

  const blockingZones = [
    { xMin: 200, xMax: 240, yMin: 120, yMax: 180 },
    { xMin: 480, xMax: 520, yMin: 120, yMax: 300 },
    { xMin: 760, xMax: 840, yMin: 100, yMax: 360 },
  ];

  const isBlocked = (x, y) => blockingZones.some(zone =>
    x >= zone.xMin && x <= zone.xMax &&
    y >= zone.yMin && y <= zone.yMax
  );

  const moveCharacter = useCallback((dx, dy) => {
    if (!characterRef.current) return;
    const characterWidth = characterRef.current.clientWidth;
    const characterHeight = characterRef.current.clientHeight;

    setCharacterPosition(prev => {
      const mapWidth = 2000;
      const mapHeight = 1200;

      const newX = Math.max(0, Math.min(mapWidth - characterWidth, prev.x + dx));
      const newY = Math.max(0, Math.min(mapHeight - characterHeight, prev.y + dy));

      if (isBlocked(newX, newY)) return prev;
      return { x: newX, y: newY };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = e => {
      const key = e.key.toLowerCase();
      if (key === "arrowleft" || key === "a") moveCharacter(-speed, 0);
      else if (key === "arrowright" || key === "d") moveCharacter(speed, 0);
      else if (key === "arrowup" || key === "w") moveCharacter(0, -speed);
      else if (key === "arrowdown" || key === "s") moveCharacter(0, speed);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moveCharacter]);

  useEffect(() => {
    if (gameContainerRef.current) {
      const container = gameContainerRef.current;
      const scrollX = characterPosition.x - window.innerWidth / 2;
      const scrollY = characterPosition.y - window.innerHeight / 2;
      container.scrollLeft = Math.max(0, scrollX);
      container.scrollTop = Math.max(0, scrollY);
    }
  }, [characterPosition]);

  const lastArea = useRef(null);

  const checkArea = useCallback(() => {
    if (gameOver || !characterRef.current) return;
    const { x, y } = characterPosition;
    const areas = [
      { xMin: 800, xMax: 820, yMin: 460, yMax: 520, path: '/rumah' },
      { xMin: 0, xMax: 0, yMin: 760, yMax: 780, path: '/pantai' },
      { xMin: 0, xMax: 0, yMin: 20, yMax: 80, path: '/tambang' },
      { xMin: 1100, xMax: 1140, yMin: 720, yMax: 800, path: '/hutan' },
      { xMin: 1360, xMax: 1380, yMin: 0, yMax: 180, path: '/pasar' },
    ];
    for (const area of areas) {
      const isIn = x >= area.xMin && x <= area.xMax && y >= area.yMin && y <= area.yMax;
      if (isIn && lastArea.current !== area.path) {
        lastArea.current = area.path;
        const fadeEl = document.getElementById('fade');
        if (fadeEl) fadeEl.classList.add('active');
        setTimeout(() => {
          navigate(area.path);
          fadeEl?.classList.remove('active');
        }, 1000);
        break;
      }
    }
  }, [characterPosition, gameOver, navigate]);

  useEffect(() => {
    const interval = setInterval(checkArea, 300);
    return () => clearInterval(interval);
  }, [checkArea]);

  const getRandomItem = () => ({
    id: Date.now(),
    name: 'Sebongkah Gold',
    x: Math.floor(Math.random() * 1800),
    y: Math.floor(Math.random() * 1000),
  });

  const [randomItem, setRandomItem] = useState(getRandomItem());

  const spawnRandomItem = () => setRandomItem(getRandomItem());

  useEffect(() => {
    const checkCollision = () => {
      if (!characterRef.current) return;

      const charX = characterPosition.x;
      const charY = characterPosition.y;
      const charSize = 64;
      const itemSize = 32;

      const isColliding =
        charX < randomItem.x + itemSize &&
        charX + charSize > randomItem.x &&
        charY < randomItem.y + itemSize &&
        charY + charSize > randomItem.y;

      if (isColliding) {
        updateGold(5000);
        spawnRandomItem();
      }
    };

    const interval = setInterval(checkCollision, 300);
    return () => clearInterval(interval);
  }, [characterPosition, randomItem, updateGold]);

  useEffect(() => {
    const interval = setInterval(spawnRandomItem, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const hours = parseInt(localStorage.getItem('gameHours')) || 6;
      setGameHours(hours);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isNight = gameHours < 6 || gameHours > 18;

  return (
    <>
      <audio id="background-music" loop ref={audioRef}>
        <source src="audio/backsound.mp3" type="audio/mp3" />
      </audio>

      <div id="sound-toggle">
        <button className="btn btn-sm btn-warning" onClick={toggleSound}>
          {isSoundOn ? '🔈 Sound: ON' : '🔇 Sound: OFF'}
        </button>
      </div>

      <div id="main-content" ref={gameContainerRef}>
        <div id="game-container">
          <div
            style={{
              position: 'absolute',
              left: `${randomItem.x}px`,
              top: `${randomItem.y}px`,
              width: '32px',
              height: '32px',
              fontSize: '24px',
              zIndex: 5,
            }}
          >
            💰
          </div>

          <img
            id="character"
            src={`assets/${characterImage}`}
            alt="Character"
            ref={characterRef}
            style={{
              position: 'absolute',
              left: `${characterPosition.x}px`,
              top: `${characterPosition.y}px`,
            }}
          />

          <video autoPlay muted loop id="bg-video">
            <source src="assets/map.mp4" type="video/mp4" />
          </video>

          {isNight && <div className="night-overlay" />}
        </div>
      </div>

      <div id="navigation-buttons">
        <button onClick={() => moveCharacter(0, -speed)}>↑</button>
        <button onClick={() => moveCharacter(-speed, 0)}>←</button>
        <div className="spacer"></div>
        <button onClick={() => moveCharacter(speed, 0)}>→</button>
        <button onClick={() => moveCharacter(0, speed)}>↓</button>
      </div>

      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 9999,
      }}>
        Posisi: X={characterPosition.x}, Y={characterPosition.y}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10000,
      }}>
        <button onClick={toggleInventory} className="btn btn-info">🎒 Inventory</button>
      </div>

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
    </>
  );
}

export default MainMenu;
