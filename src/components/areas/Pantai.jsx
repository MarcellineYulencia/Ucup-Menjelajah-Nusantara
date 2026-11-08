// src/components/areas/Pantai.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../contexts/StatusContext';
import InventoryModal from '../InventoryModal';
import '../../styles/AreaPantai.css';

function Pantai() {
  const navigate = useNavigate();
  const bgmRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const animCallbackRef = useRef(null);

  const {
    playerStatus,
    playerGold,
    updateStatus,
    updateGold,
    gameOver,
    addItemToInventory,
    logActivity,
    markAreaVisited
  } = useStatus();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SPEED = 10;

  const zones = {
    kelapa: { x: 270, y: 150, w: 60, h: 60 },
    surfing: { x: 570, y: 320, w: 60, h: 60 },
    pasir: { x: 600, y: 240, w: 60, h: 60 },
    berenang: { x: 140, y: 260, w: 60, h: 60 },
    keluar: { x: 410, y: 70, w: 60, h: 60 }
  };

  const [pos, setPos] = useState({ x: 400, y: 60 });
  const [statusOutput, setStatusOutput] = useState("Menunggu aktivitas...");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSrc, setAnimationSrc] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('default.png');
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    const sc = localStorage.getItem('playerAvatar') || localStorage.getItem('selectedCharacter');
    if (sc) setSelectedCharacter(sc);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem('spawnPoint-pantai');
    if (sp) setPos(JSON.parse(sp));
    markAreaVisited('Pantai'); // ✅ update status context
  }, []);

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
      bgmRef.current.play().catch(e => console.warn("Autoplay audio di Pantai diblokir:", e));
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      alert("Game Over! Kamu akan diarahkan ulang.");
      navigate('/');
    }
  }, [gameOver, navigate]);

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

  const handleKelapa = () => {
    if (!isInZone(zones.kelapa) || gameOver) return alert("Pergi ke area minum kelapa!");
    if (playerGold >= 1000) {
      setStatusOutput("Minum kelapa...");
      tampilkanAnimasi('/assets/coconutanim.gif', () => {
        updateGold(-1000);
        updateStatus({ meal: +6, happiness: +4 });
        addItemToInventory("air kelapa", {
          description: "Minum kelapa di pantai",
          effects: { happiness: 10, meal: 6 }
        });
        logActivity("minum kelapa", "Pantai"); // ✅ pakai log context
        setStatusOutput("Selesai minum kelapa! Meal dan happiness bertambah.");
      });
    } else {
      alert("Gold kamu tidak cukup!");
    }
  };

  const handleSurfing = () => {
    if (!isInZone(zones.surfing) || gameOver) return alert("Pergi ke area seluncur!");
    setStatusOutput("Berseluncur...");
    tampilkanAnimasi('/assets/surfanim.gif', () => {
      updateStatus({ meal: -5, happiness: +6 });
      logActivity("berseluncur", "Pantai");
    });
  };

  const handlePasir = () => {
    if (!isInZone(zones.pasir) || gameOver) return alert("Pergi ke area pasir!");
    setStatusOutput("Main pasir...");
    tampilkanAnimasi('/assets/sandanim.gif', () => {
      updateStatus({ sleep: -5, hygiene: -5, happiness: +5 });
      logActivity("main pasir", "Pantai");
    });
  };

  const handleBerenang = () => {
    if (!isInZone(zones.berenang) || gameOver) return alert("Pergi ke area berenang!");
    setStatusOutput("Berenang...");
    tampilkanAnimasi('/assets/swimanim.gif', () => {
      updateStatus({ meal: -4, hygiene: -5, happiness: +6 });
      logActivity("berenang", "Pantai");
    });
  };

  const handleKeluar = () => {
    if (!isInZone(zones.keluar)) return alert("Pergi ke area keluar!");
    localStorage.setItem('spawnPoint-main-menu', JSON.stringify({ x: 200, y: 500 }));
    navigate('/main-menu');
  };

  return (
    <div className="pantai-area-wrapper">
      <audio id="bgm" loop ref={bgmRef}>
        <source src="/audio/Beach.mp3" type="audio/mpeg" />
      </audio>

      {showAnimation ? (
  <div className="pantai-animation-overlay">
    <button className="pantai-skip-button" onClick={skipAnimasi}>Skip</button>
    <img src={animationSrc} alt="Aktivitas" />
  </div>
) : (

        <div className="pantai-area-content">
          <div
            className="pantai-map"
            style={{ backgroundImage: "url('/assets/beachinter.png')" }}
          >
            <img
              src={`/assets/${selectedCharacter}`}
              alt="Karakter"
              className="pantai-character"
              style={{ left: pos.x, top: pos.y }}
            />
          </div>

          <div className="pantai-buttons">
            <button onClick={handleKelapa}>🥥 Minum Kelapa</button>
            <button onClick={handleSurfing}>🏄 Berseluncur</button>
            <button onClick={handlePasir}>🏖️ Main Pasir</button>
            <button onClick={handleBerenang}>🏊 Berenang</button>
            <button onClick={handleKeluar}>Keluar Pantai</button>
            <button onClick={() => setShowInventory(true)}>🎒 Inventory</button>
          </div>

          <p>{statusOutput}</p>
          <p><strong>Posisi:</strong> x: {pos.x}, y: {pos.y}</p>
        </div>
      )}

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
    </div>
  );
}

export default Pantai;
