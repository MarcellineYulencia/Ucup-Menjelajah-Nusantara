import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const StatusContext = createContext();

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) throw new Error('useStatus must be used within a StatusProvider');
  return context;
};

const DEFAULT_INITIAL_STATUS = { meal: 50, sleep: 50, happiness: 50, hygiene: 50 };
const DEFAULT_INITIAL_GOLD = 10000;

export const StatusProvider = ({ children }) => {
  // Validasi status awal agar tidak error dari localStorage
  const [playerStatus, setPlayerStatus] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('playerStatus'));
      if (
        saved &&
        typeof saved === 'object' &&
        ['meal', 'sleep', 'happiness', 'hygiene'].every(
          key => typeof saved[key] === 'number' && saved[key] > 0
        )
      ) {
        return saved;
      }
      return DEFAULT_INITIAL_STATUS;
    } catch {
      return DEFAULT_INITIAL_STATUS;
    }
  });

  const [playerGold, setPlayerGold] = useState(() => {
    const savedGold = localStorage.getItem('playerGold');
    return savedGold !== null ? parseInt(savedGold, 10) : DEFAULT_INITIAL_GOLD;
  });

  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('inventory')) || {};
    } catch {
      return {};
    }
  });

  const [gameOver, setGameOver] = useState(false);
  const [visitedAreas, setVisitedAreas] = useState(new Set());
  const [activityLog, setActivityLog] = useState([]);

  const [definedItems] = useState({
    nasi: {
      description: 'Nasi hangat lezat. Menambah energi dan kebahagiaan.',
      effects: { meal: +15, happiness: +15 },
    },
    kelapa: {
      description: 'Air kelapa segar dari pantai.',
      effects: { meal: +5, happiness: +10 },
    },
    batu_emas: {
      description: 'Batu mengandung emas. Bisa dijual.',
      effects: {},
    },
    Potion: {
      description: 'Ramuan ajaib. Menambah semua status secara signifikan.',
      effects: { meal: +20, sleep: +20, happiness: +20, hygiene: +20 },
    },
  });

  // Load log kunjungan area
  useEffect(() => {
    try {
      const savedLog = JSON.parse(localStorage.getItem('log_aktivitas')) || [];
      const visited = new Set();
      const logList = [];

      savedLog.forEach(({ aktivitas, keterangan }) => {
        if (aktivitas === "Kunjungan" && keterangan?.startsWith("Area: ")) {
          visited.add(keterangan.replace("Area: ", "").trim());
        }
        logList.push(`${aktivitas}${keterangan ? ` - ${keterangan}` : ''}`);
      });

      setVisitedAreas(visited);
      setActivityLog(logList);
    } catch {
      setVisitedAreas(new Set());
      setActivityLog([]);
    }
  }, []);

  // Penurunan status otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerStatus(prev => ({
        meal: Math.max(0, prev.meal - 1),
        sleep: Math.max(0, prev.sleep - 1),
        happiness: Math.max(0, prev.happiness - 1),
        hygiene: Math.max(0, prev.hygiene - 1),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sinkronisasi localStorage
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('playerGold', playerGold.toString()), [playerGold]);

  useEffect(() => {
    localStorage.setItem('playerStatus', JSON.stringify(playerStatus));
    const anyZero = Object.values(playerStatus).some(
      v => typeof v !== 'number' || v <= 0
    );
    if (anyZero && !gameOver) setGameOver(true);
  }, [playerStatus, gameOver]);

  const updateStatus = useCallback((changes) => {
    setPlayerStatus(prev => {
      const updated = { ...prev };
      for (const key in changes) {
        updated[key] = Math.max(0, Math.min(100, (updated[key] || 0) + changes[key]));
      }
      return updated;
    });
  }, []);

  const updateGold = useCallback(amount => {
    setPlayerGold(prev => Math.max(0, prev + amount));
  }, []);

  const resetGame = useCallback(() => {
    setPlayerStatus(DEFAULT_INITIAL_STATUS);
    setPlayerGold(DEFAULT_INITIAL_GOLD);
    setInventory({});
    setGameOver(false);
    setVisitedAreas(new Set());
    setActivityLog([]);
    localStorage.setItem('playerStatus', JSON.stringify(DEFAULT_INITIAL_STATUS));
    localStorage.setItem('playerGold', DEFAULT_INITIAL_GOLD.toString());
    localStorage.removeItem('inventory');
    localStorage.removeItem('log_aktivitas');
  }, []);

  const addItemToInventory = useCallback((itemName, itemInfo) => {
    setInventory(prev => {
      const updated = {
        ...prev,
        [itemName]: {
          jumlah: (prev[itemName]?.jumlah || 0) + 1,
          info: itemInfo,
        },
      };
      return updated;
    });
  }, []);

  const handleUseItemFromInventory = useCallback((itemName) => {
    setInventory(prev => {
      const item = prev[itemName];
      if (!item) return prev;
      if (item.info?.effects) {
        updateStatus(item.info.effects);
        logActivity(`Menggunakan item: ${itemName}`);
      }

      const updated = { ...prev };
      if (item.jumlah > 1) {
        updated[itemName].jumlah -= 1;
      } else {
        delete updated[itemName];
      }

      return updated;
    });
  }, [updateStatus]);

  const logActivity = useCallback((entry) => {
    setActivityLog(prev => [...prev, entry]);
  }, []);

  const markAreaVisited = useCallback((area) => {
    setVisitedAreas(prev => new Set([...prev, area]));
  }, []);

  return (
    <StatusContext.Provider value={{
      playerStatus,
      playerGold,
      inventory,
      gameOver,
      updateStatus,
      updateGold,
      setGameOver,
      resetGame,
      addItemToInventory,
      handleUseItemFromInventory,
      definedItems,
      visitedAreas,
      markAreaVisited,
      activityLog,
      logActivity,
    }}>
      {children}
    </StatusContext.Provider>
  );
};
