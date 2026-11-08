import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../contexts/StatusContext';
import InventoryModal from '../InventoryModal';
import '../../styles/AreaTambang.css';

function Tambang() {
  const navigate = useNavigate();
  const bgmRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const animCallbackRef = useRef(null);

  const { updateStatus, gameOver, addItemToInventory, markAreaVisited, logActivity } = useStatus();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SPEED = 10;

  const zones = {
    mining: { x: 430, y: 170, w: 80, h: 80 },
    keluar: { x: 80, y: 130, w: 60, h: 60 },
    minigame: { x: 80, y: 300, w: 80, h: 80 }
  };

  const [pos, setPos] = useState({ x: 360, y: 250 });
  const [statusOutput, setStatusOutput] = useState("Menunggu aktivitas...");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSrc, setAnimationSrc] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('default.png');
  const [showInventory, setShowInventory] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);

  // minigame state
  const [goldLocation, setGoldLocation] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [revealed, setRevealed] = useState(Array(9).fill(false));
  const [minigameMessage, setMinigameMessage] = useState("");

  useEffect(() => {
    const sc = localStorage.getItem('playerAvatar') || localStorage.getItem('selectedCharacter');
    if (sc) setSelectedCharacter(sc);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem('spawnPoint-tambang');
    if (sp) setPos(JSON.parse(sp));
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver || showMinigame) return;
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
  }, [pos, gameOver, showMinigame]);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = 0.5;
      bgmRef.current.play().catch(e => console.warn("Autoplay audio di Tambang diblokir:", e));
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    markAreaVisited('tambang');
    logActivity("Kunjungan", "Area: Tambang");
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

  const hasilMenambang = () => {
    const chance = Math.random() * 100;
    if (chance < 5) return "diamond";
    if (chance < 20) return "gold";
    if (chance < 50) return "iron";
    return "batu";
  };

  const handleMining = () => {
    if (!isInZone(zones.mining) || gameOver) return alert("Pergi ke area menambang!");
    setStatusOutput("Menambang...");
    tampilkanAnimasi('/assets/mineanim.gif', () => {
      const hasil = hasilMenambang();
      addItemToInventory(hasil, {
        description: `Hasil menambang: ${hasil}`,
        effects: {}
      });
      updateStatus({ meal: -5, happiness: +3, sleep: -3 });
      setStatusOutput(`Kamu mendapatkan: ${hasil.toUpperCase()}!`);
      logActivity("Menambang", `Mendapatkan: ${hasil}`);
    });
  };

  const handleKeluar = () => {
    if (!isInZone(zones.keluar)) return alert("Pergi ke area keluar!");
    localStorage.setItem('spawnPoint-main-menu', JSON.stringify({ x: 500, y: 480 }));
    navigate('/main-menu');
  };

  const startMinigame = () => {
    if (!isInZone(zones.minigame)) return alert("Pergi ke area minigame!");
    setGoldLocation(Math.floor(Math.random() * 9));
    setAttemptsLeft(3);
    setRevealed(Array(9).fill(false));
    setMinigameMessage("Tebak lokasi emas! Kamu punya 3 kesempatan.");
    setShowMinigame(true);
  };

  const clickTile = (index) => {
    if (revealed[index] || attemptsLeft <= 0) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (index === goldLocation) {
      setMinigameMessage("🎉 Kamu menemukan emas!");
      addItemToInventory("gold", {
        description: "Dari minigame",
        effects: {}
      });
      updateStatus({ happiness: 5 });
      logActivity("Minigame", "Menang: Menemukan emas");
      setAttemptsLeft(0);
    } else {
      const sisa = attemptsLeft - 1;
      setAttemptsLeft(sisa);
      if (sisa === 0) {
        setMinigameMessage("💥 Gagal! Emas tersembunyi di tempat lain.");
        logActivity("Minigame", "Kalah: Gagal menemukan emas");
      } else {
        setMinigameMessage(`Bukan di sini! Sisa percobaan: ${sisa}`);
      }
    }
  };

  return (
    <div className="tambang-area-wrapper">
      <audio id="bgm" loop ref={bgmRef}>
        <source src="/audio/Cave.mp3" type="audio/mpeg" />
      </audio>

      {showAnimation ? (
        <div className="animation-overlay">
          <img src={animationSrc} alt="Aktivitas Tambang" />
          <button onClick={skipAnimasi}>Skip</button>
        </div>
      ) : showMinigame ? (
        <div className="minigame-overlay">
          <h2>Tebak Titik Emas</h2>
          <div className="grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <button
                key={i}
                onClick={() => clickTile(i)}
                disabled={revealed[i] || attemptsLeft === 0}
                style={{ width: 80, height: 80, margin: 4 }}
              >
                {revealed[i] ? (i === goldLocation ? "💰" : "❌") : "❓"}
              </button>
            ))}
          </div>
          <p>{minigameMessage}</p>
          {attemptsLeft === 0 && (
            <button onClick={() => setShowMinigame(false)}>Tutup Minigame</button>
          )}
        </div>
      ) : (
        <div className="area-content">
          <div className="tambang-map" style={{ backgroundImage: `url('/assets/mineinter.webp')` }}>
            <img
              src={`/assets/${selectedCharacter}`}
              alt="Karakter"
              className="character"
              style={{ left: pos.x, top: pos.y }}
            />
          </div>

          <div className="tambang-buttons">
            <button onClick={handleMining}>⛏️ Menambang</button>
            <button onClick={startMinigame}>🎮 Main Minigame</button>
            <button onClick={handleKeluar}>Keluar Tambang</button>
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

export default Tambang;
