import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../contexts/StatusContext';
import { getInventory, removeFromInventory } from '../../utils/inventoryutils';
import InventoryModal from '../InventoryModal';
import '../../styles/AreaPasar.css';

// ✅ Tambahkan fungsi log lokal
const logActivity = (action, area = "Pasar") => {
  const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  logs.push({
    action,
    area,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("activityLogs", JSON.stringify(logs));
};

const markAreaVisited = (areaName = "Pasar") => {
  const visited = JSON.parse(localStorage.getItem("visitedAreas") || "[]");
  if (!visited.includes(areaName)) {
    visited.push(areaName);
    localStorage.setItem("visitedAreas", JSON.stringify(visited));
  }
};

function Pasar() {
  const navigate = useNavigate();
  const bgmRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const animCallbackRef = useRef(null);

  const { updateGold, gameOver } = useStatus();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SPEED = 10;

  const zones = {
    jual: { x: 290, y: 190, w: 80, h: 80 },
    keluar: { x: 0, y: 220, w: 60, h: 60 }
  };

  const jualableItems = [
    { id: 'kayu', name: 'Kayu', price: 500 },
    { id: 'kumbang', name: 'Kumbang Langka', price: 1000 },
    { id: 'diamond', name: 'Berlian', price: 7000 },
    { id: 'gold', name: 'Emas', price: 5000 },
    { id: 'iron', name: 'Besi', price: 1000 },
    { id: 'batu', name: 'Batu', price: 200 },
    { id: '1', name: 'Potion', price: 3000 }
  ];

  const [pos, setPos] = useState({ x: 10, y: 230 });
  const [statusOutput, setStatusOutput] = useState("Menunggu aksi...");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSrc, setAnimationSrc] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('default.png');
  const [showInventory, setShowInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [showSellList, setShowSellList] = useState(false);

  useEffect(() => {
    const sc = localStorage.getItem('playerAvatar') || localStorage.getItem('selectedCharacter');
    if (sc) setSelectedCharacter(sc);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem('spawnPoint-pasar');
    if (sp) setPos(JSON.parse(sp));
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
      bgmRef.current.play().catch(e => console.warn("Autoplay audio di Pasar diblokir:", e));
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
    }, 3000);
  };

  const skipAnimasi = () => {
    clearTimeout(animTimeoutRef.current);
    setShowAnimation(false);
    if (animCallbackRef.current) {
      animCallbackRef.current();
      animCallbackRef.current = null;
    }
  };

  const handleJual = () => {
    if (!isInZone(zones.jual) || gameOver) return alert("Pergi ke area jual beli di pasar!");
    const inv = getInventory();
    setInventory(inv);
    setStatusOutput("Menampilkan item yang bisa dijual...");
    setShowSellList(true);
    logActivity("membuka menu jual beli", "Pasar"); 
  };

  const jualItem = (itemId, price) => {
    const inv = getInventory();
    if (!inv[itemId] || inv[itemId] <= 0) return alert("Kamu tidak punya item ini!");
    tampilkanAnimasi('/assets/Market.webp', () => {
      removeFromInventory(itemId, 1);
      updateGold(price);
      const updatedInventory = getInventory();
      setInventory(updatedInventory);
      setStatusOutput(`Menjual ${itemId} seharga ${price} gold`);
      logActivity(`menjual ${itemId}`, "Pasar");
    });
  };

  const handleTutupJual = () => {
    setShowSellList(false);
    setStatusOutput("Menunggu aksi...");
  };

  const handleKeluar = () => {
    if (!isInZone(zones.keluar)) return alert("Pergi ke area keluar!");
    localStorage.setItem('spawnPoint-main-menu', JSON.stringify({ x: 400, y: 300 }));
    navigate('/main-menu');
  };

  return (
    <div className="pasar-area-wrapper">
      <audio id="bgm" loop ref={bgmRef}>
        <source src="/audio/Market.mp3" type="audio/mpeg" />
      </audio>

      <p style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        Posisi: x: {pos.x}, y: {pos.y}
      </p>

      {showAnimation ? (
        <div className="animation-overlay">
          <img src={animationSrc} alt="Aktivitas" />
          <button onClick={skipAnimasi}>Skip</button>
        </div>
      ) : (
        <div className="area-content">
          <div className="pasar-map" style={{ backgroundImage: `url('/assets/marketin.jpg')` }}>
            <img
              src={`/assets/${selectedCharacter}`}
              alt="Karakter"
              className="character"
              style={{ left: pos.x, top: pos.y }}
            />
          </div>

          <div className="pasar-buttons">
            <button onClick={handleJual}>🪙 Jual Barang</button>
            <button onClick={handleKeluar}>Keluar Pasar</button>
            <button onClick={() => setShowInventory(true)}>🎒 Inventory</button>
          </div>

          {showSellList && (
            <div className="jual-list">
              <button onClick={handleTutupJual}>❌ Tutup Menu Jual</button>
              {jualableItems.filter(item => inventory[item.id]?.jumlah > 0).length > 0 ? (
                jualableItems.map(item =>
                  inventory[item.id]?.jumlah > 0 && (
                    <button key={item.id} onClick={() => jualItem(item.id, item.price)}>
                      Jual {item.name} ({inventory[item.id].jumlah}) - 💰 {item.price}
                    </button>
                  )
                )
              ) : (
                <p>Kamu tidak punya item yang bisa dijual.</p>
              )}
            </div>
          )}

          <p>{statusOutput}</p>
        </div>
      )}

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
    </div>
  );
}

export default Pasar;
