import React, { useState } from 'react';
import { useStatus } from '../contexts/StatusContext';

const gridSize = 42;

const InventoryModal = ({ onClose }) => {
  const { inventory, handleUseItemFromInventory } = useStatus();
  const [hoverItem, setHoverItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const items = Object.entries(inventory);
  const filledSlots = items.map(([name, data]) => ({ name, ...data }));
  const emptySlots = Array(gridSize - filledSlots.length).fill(null);
  const allSlots = [...filledSlots, ...emptySlots];

  const handleUseItem = (item) => {
    if (!item) return;
    handleUseItemFromInventory(item.name);
  };

  const handleMouseEnter = (e, item) => {
    if (!item) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.right + 10, y: rect.top });
    setHoverItem(item);
  };

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Inventory</span>
          <span style={styles.close} onClick={onClose}>X</span>
        </div>

        <div style={styles.grid}>
          {allSlots.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.slot,
                backgroundColor: item ? '#444' : '#2f2f2f',
                cursor: item ? 'pointer' : 'default',
              }}
              onClick={() => item && handleUseItem(item)}
              onMouseEnter={(e) => item && handleMouseEnter(e, item)}
              onMouseLeave={() => setHoverItem(null)}
            >
              {item && (
                <div style={styles.itemContent}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={styles.itemQty}>x{item.jumlah}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {hoverItem && (
          <div style={{
            ...styles.tooltip,
            top: tooltipPosition.y,
            left: tooltipPosition.x
          }}>
            <strong>{hoverItem.name}</strong><br />
            {typeof hoverItem.info === 'string'
  ? hoverItem.info
  : hoverItem.info?.description || 'Tidak ada deskripsi'}
<br />
            {hoverItem.info?.effects &&
              <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                {Object.entries(hoverItem.info.effects).map(([key, value]) => (
                  <li key={key}>{key} +{value}</li>
                ))}
              </ul>
            }
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modal: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#555',
    padding: '20px',
    borderRadius: '12px',
    position: 'relative',
    width: '420px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  close: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    backgroundColor: '#777',
    padding: '4px',
  },
  slot: {
    width: '50px',
    height: '50px',
    backgroundColor: '#333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #888',
    position: 'relative',
  },
  itemContent: {
    textAlign: 'center',
    color: 'white',
    fontSize: '12px',
  },
  itemName: {
    display: 'block',
  },
  itemQty: {
    fontSize: '10px',
    color: '#ccc',
  },
  tooltip: {
    position: 'fixed',
    backgroundColor: '#222',
    color: 'white',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '12px',
    maxWidth: '200px',
    zIndex: 10000,
    pointerEvents: 'none',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
  },
};

export default InventoryModal;
