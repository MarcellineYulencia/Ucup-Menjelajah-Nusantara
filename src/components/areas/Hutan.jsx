// src/components/area/Hutan.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../contexts/StatusContext';
import InventoryModal from '../InventoryModal';
import '../../styles/AreaHutan.css';

function Hutan() {
  const navigate = useNavigate();
  const bgmRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const animCallbackRef = useRef(null);

  const {
    playerStatus,
    playerGold,
    gameOver,
    updateStatus,
    updateGold,
    addItemToInventory,
  } = useStatus();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SPEED = 10;

  const zones = {
    tebang: { x: 100, y: 100, w: 60, h: 60 },
    berburu: { x: 300, y: 100, w: 60, h: 60 },
    npc: { x: 500, y: 100, w: 60, h: 60 },
  };

  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [statusOutput, setStatusOutput] = useState("Menunggu aktivitas...");
  const [showInventory, setShowInventory] = useState(false);
  const [questActive, setQuestActive] = useState(false);
  const [kayuTerkumpul, setKayuTerkumpul] = useState(0);
  const [showNpcDialog, setShowNpcDialog] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSrc, setAnimationSrc] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState('default.png');

  const logActivity = (aktivitas, detail) => {
    const log = JSON.parse(localStorage.getItem('aktivitasLog') || '[]');
    log.push({
      area: 'Hutan',
      aktivitas,
      detail,
      waktu: new Date().toLocaleString()
    });
    localStorage.setItem('aktivitasLog', JSON.stringify(log));
  };

  const markAreaVisited = (area) => {
    const visited = JSON.parse(localStorage.getItem('areaVisited') || '[]');
    if (!visited.includes(area)) {
      visited.push(area);
      localStorage.setItem('areaVisited', JSON.stringify(visited));
    }
  };

  useEffect(() => {
    const sc = localStorage.getItem("playerAvatar") || localStorage.getItem("selectedCharacter");
    if (sc) setSelectedCharacter(sc);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem("spawnPoint-hutan");
    if (sp) setPos(JSON.parse(sp));
  }, []);

  useEffect(() => {
    const handleKey = e => {
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
      bgmRef.current.play().catch(e => console.warn('Autoplay diblokir:', e));
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

  const nebang = () => {
    if (!isInZone(zones.tebang) || gameOver) return alert('Pergi ke area tebang dulu!');
    setStatusOutput('Menebang pohon...');
    tampilkanAnimasi('/assets/cutanim.gif', () => {
      updateStatus({ meal: -5, hygiene: -5, happiness: +3 });
      addItemToInventory('kayu', {
        description: 'Kayu hasil tebang pohon',
        effects: {}
      });
      logActivity('Menebang Pohon', 'Mendapat kayu +1');
      markAreaVisited('hutan');

      if (questActive) {
        setKayuTerkumpul(p => {
          const next = p + 1;
          if (next >= 3) {
            alert('Quest selesai! Kamu dapat 500 gold!');
            updateGold(500);
            logActivity('Selesaikan Quest', 'Mendapat 500 gold dari NPC');
            setQuestActive(false);
            return 0;
          }
          return next;
        });
      }
    });
  };

  const hunt = () => {
    if (!isInZone(zones.berburu) || gameOver) return alert('Pergi ke area berburu dulu!');
    setStatusOutput('Berburu...');
    tampilkanAnimasi('/assets/huntanim.gif', () => {
      updateStatus({ meal: -7, hygiene: -5, happiness: +2 });
      addItemToInventory('kumbang', {
        description: 'Kumbang langka',
        effects: {}
      });
      logActivity('Berburu', 'Mendapat kumbang langka');
      markAreaVisited('hutan');
    });
  };

  const keluar = () => {
    localStorage.setItem('spawnPoint-overworld', JSON.stringify({ x: 600, y: 400 }));
    navigate('/main-menu');
  };

  useEffect(() => {
    if (gameOver) {
      alert('Game Over! Kamu akan dikembalikan ke menu utama.');
      navigate('/main-menu');
    }
  }, [gameOver, navigate]);

  return (
    <div className="hutan-area-wrapper">
      <audio id="bgm" loop ref={bgmRef}>
        <source src="/audio/Forest.mp3" type="audio/mpeg" />
      </audio>

      <div
        className="hutan-map"
        style={{ width: WIDTH, height: HEIGHT, backgroundImage: "url('/assets/forestinside.jpg')" }}
      >
        <img
          src={`/assets/${selectedCharacter}`}
          alt="Karakter"
          className="hutan-karakter"
          style={{ left: pos.x, top: pos.y }}
        />
        <div className="hutan-zone" style={{ left: zones.tebang.x, top: zones.tebang.y }}>🌲</div>
        <div className="hutan-zone" style={{ left: zones.berburu.x, top: zones.berburu.y }}>🐗</div>
      </div>

      <div className="hutan-actions">
        <button onClick={nebang}>Tebang</button>
        <button onClick={hunt}>Berburu</button>
        <button onClick={() => setShowInventory(true)}>📦 Inventory</button>
        <button onClick={keluar}>Keluar</button>
      </div>


      {showAnimation && (
        <div className="hutan-fullscreen-animation">
          <img src={animationSrc} alt="Animasi" />
          <button className="hutan-skip-button" onClick={skipAnimasi}>Lewati</button>
        </div>
      )}

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
    </div>
  );
}

export default Hutan;
