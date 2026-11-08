import React, { useEffect, useState, useCallback } from 'react';
import { useStatus } from '../contexts/StatusContext';
import '../styles/GlobalStatusBar.css';

const GlobalStatusBar = () => {
  const { playerStatus, playerGold, gameOver } = useStatus();
  const [playerName, setPlayerName] = useState('');
  const [clockTime, setClockTime] = useState('⏳ 06:00 AM');
  const [dayCount, setDayCount] = useState(() => parseInt(localStorage.getItem('dayCount')) || 1);
  const [gameHours, setGameHours] = useState(() => parseInt(localStorage.getItem('gameHours')) || 6);
  const [gameMinutes, setGameMinutes] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    if (name) setPlayerName(name);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameMinutes(prev => {
        let nextMin = prev + 10;
        if (nextMin >= 60) {
          nextMin = 0;
          setGameHours(prevHour => {
            const nextHour = (prevHour + 1) % 24;

            // Pisahkan update hari jika jam kembali ke 0
            if (nextHour === 0) {
              setDayCount(prevDay => {
                const newDay = prevDay + 1;
                localStorage.setItem('dayCount', newDay);
                return newDay;
              });
            }

            localStorage.setItem('gameHours', nextHour);
            return nextHour;
          });
        }
        return nextMin;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let period = gameHours < 12 ? 'AM' : 'PM';
    let displayHour = gameHours % 12 || 12;
    let displayMinute = String(gameMinutes).padStart(2, '0');
    setClockTime(`⏳ ${String(displayHour).padStart(2, '0')}:${displayMinute} ${period}`);
  }, [gameHours, gameMinutes]);

  // Reset jika Game Over
  useEffect(() => {
    if (gameOver) {
      setDayCount(1);
      setGameHours(6);
      setGameMinutes(0);
      localStorage.setItem('dayCount', '1');
      localStorage.setItem('gameHours', '6');
    }
  }, [gameOver]);

  const getGreeting = useCallback(() => {
    if (gameHours >= 5 && gameHours < 12) return `Good Morning, ${playerName || 'Adventurer'}!`;
    if (gameHours >= 12 && gameHours < 18) return `Good Afternoon, ${playerName || 'Adventurer'}!`;
    return `Good Evening, ${playerName || 'Adventurer'}!`;
  }, [gameHours, playerName]);

  return (
    <div className="global-status-bar">
      <div className="top-status-row">
        <div className="greeting">{getGreeting()}</div>
        <div className="clock">{clockTime}</div>
        <div className="day">📅 Day {dayCount}</div>
      </div>

      <div className="bottom-status-row">
        <div className="global-status-container">
          {Object.entries(playerStatus).map(([key, value]) => (
            <div key={key} className="status-item">
              <img className="status-icon" src={`assets/${key}.png`} alt={key} />
              <div className="status-bar">
                <div
                  className={`status-fill ${value < 20 ? 'blink' : ''}`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="global-gold-display">💰 {playerGold}</div>
      </div>
    </div>
  );
};

export default GlobalStatusBar;
