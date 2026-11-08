// src/components/areas/Rumah.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../contexts/StatusContext';
import InventoryModal from '../InventoryModal';
import '../../styles/AreaRumah.css';

function Rumah() {
  const navigate = useNavigate();
  const bgmRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const animCallbackRef = useRef(null);

  const { playerStatus, gameOver, updateStatus, addItemToInventory } = useStatus();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SPEED = 10;

  const zones = {
    makan: { x: 180, y: 310, w: 60, h: 60 },
    tidur: { x: 590, y: 50, w: 60, h: 60 },
    mandi: { x: 20, y: 60, w: 60, h: 60 },
    keluar: { x: 330, y: 30, w: 60, h: 60 }
  };

  const [pos, setPos] = useState({ x: 340, y: 50 });
  const [statusOutput, setStatusOutput] = useState('Menunggu aktivitas...');
  const [showInventory, setShowInventory] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSrc, setAnimationSrc] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('default.png');

  useEffect(() => {
    const sc = localStorage.getItem('playerAvatar') || localStorage.getItem('selectedCharacter');
    if (sc) setSelectedCharacter(sc);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem('spawnPoint-rumah');
    if (sp) setPos(JSON.parse(sp));
  }, []);

  useEffect(() => {
    const visited = JSON.parse(localStorage.getItem("visitedAreas") || "[]");
    if (!visited.includes("Rumah")) {
      visited.push("Rumah");
      localStorage.setItem("visitedAreas", JSON.stringify(visited));
    }
  }, []);

  const logActivity = (action, area = "Rumah") => {
    const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
    logs.push({
      action,
      area,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("activityLogs", JSON.stringify(logs));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      let nx = pos.x, ny = pos.y;
      if (['ArrowUp', 'w'].includes(e.key)) ny -= SPEED;
      if (['ArrowDown', 's'].includes(e.key)) ny += SPEED;
      if (['ArrowLeft', 'a'].includes(e.key)) nx -= SPEED;
      if (['ArrowRight', 'd'].includes(e.key)) nx += SPEED;
      nx = Math.max(0, Math.min(WIDTH - 50, nx));
      ny = Math.max(0, Math.min(HEIGHT - 50, ny));
      setPos({ x: nx, y: ny });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pos, gameOver]);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = 0.5;
      bgmRef.current.play().catch(e => console.warn('Autoplay audio di Rumah diblokir:', e));
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, []);

  const isInZone = zone =>
    pos.x >= zone.x && pos.x <= zone.x + zone.w &&
    pos.y >= zone.y && pos.y <= zone.y + zone.h;

  const tampilkanAnimasi = (src, callback) => {
    setAnimationSrc(src);
    setShowAnimation(true);
    animCallbackRef.current = callback;
    animTimeoutRef.current = setTimeout(() => {
      setShowAnimation(false);
      animCallbackRef.current = null;
      callback?.();
    }, 4000);
  };

  const skipAnimasi = () => {
    clearTimeout(animTimeoutRef.current);
    setShowAnimation(false);
    if (animCallbackRef.current) {
      animCallbackRef.current();
      animCallbackRef.current = null;
    }
  };

  const handleMakan = () => {
    if (!isInZone(zones.makan) || gameOver) return alert('Pergi ke area makan dulu!');
    setStatusOutput('Karakter sedang makan...');
    tampilkanAnimasi('/assets/eatanim.gif', () => {
      updateStatus({ meal: 15, happiness: 15 });
      addItemToInventory('nasi', {
        description: 'Makan nasi di rumah',
        effects: { happiness: 20, meal: 15 }
      });
      logActivity('makan nasi');
      setStatusOutput('Selesai makan! Meal dan happiness bertambah.');
    });
  };

  const handleTidur = () => {
    if (!isInZone(zones.tidur) || gameOver) return alert('Pergi ke area tidur dulu!');
    setStatusOutput('Karakter sedang tidur...');
    tampilkanAnimasi('/assets/sleepanim.gif', () => {
      updateStatus({ sleep: 10, happiness: 1 });
      logActivity('tidur');
      setStatusOutput('Bangun tidur! Sleep dan happiness bertambah.');
    });
  };

  const handleMandi = () => {
    if (!isInZone(zones.mandi) || gameOver) return alert('Pergi ke area mandi dulu!');
    setStatusOutput('Karakter sedang mandi...');
    tampilkanAnimasi('/assets/bathanim.gif', () => {
      updateStatus({ hygiene: 10, happiness: 1 });
      logActivity('mandi');
      setStatusOutput('Selesai mandi! Hygiene dan happiness bertambah.');
    });
  };

  const handleKeluar = () => {
    if (!isInZone(zones.keluar)) return alert('Pergi ke pintu keluar dulu!');
    localStorage.setItem("spawnPoint-main-menu", JSON.stringify({ x: 400, y: 300 }));
    navigate('/main-menu');
  };

  return (
    <div className="rumah-area-wrapper">
      <audio id="bgm" loop ref={bgmRef}>
        <source src="audio/House.mp3" type="audio/mpeg" />
      </audio>

      {showAnimation && (
        <div className="animation-overlay">
          <img src={animationSrc} alt="Aktivitas" />
          <button onClick={skipAnimasi}>Skip</button>
        </div>
      )}

      <div
        className="rumah-map"
        style={{
          width: WIDTH,
          height: HEIGHT,
          backgroundImage: `url('/assets/housein.png')`,
          backgroundSize: 'cover',
        }}
      >
        <img
          src={`/assets/${selectedCharacter}`}
          alt="Karakter"
          className="rumah-character"
          style={{ left: pos.x, top: pos.y }}
        />
      </div>

      <div className="rumah-controls">
        <button onClick={handleMakan} disabled={gameOver}>🍽️ Makan</button>
        <button onClick={handleTidur} disabled={gameOver}>🛌 Tidur</button>
        <button onClick={handleMandi} disabled={gameOver}>🚿 Mandi</button>
        <button onClick={handleKeluar}>Keluar Rumah</button>
        <button onClick={() => setShowInventory(true)}>🎒 Inventory</button>
      </div>

      <div className="rumah-status-output">
        <p><strong>Status:</strong></p>
        <p>{statusOutput}</p>
      </div>

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
    </div>
  );
}

export default Rumah;
