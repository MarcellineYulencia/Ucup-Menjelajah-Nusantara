// src/utils/inventoryUtils.js

export const addToInventory = (itemName, jumlah = 1, info = '') => {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || {};
  if (inventory[itemName]) {
    inventory[itemName].jumlah += jumlah;
  } else {
    inventory[itemName] = { jumlah, info };
  }
  localStorage.setItem('inventory', JSON.stringify(inventory));
};

export const removeFromInventory = (itemName, jumlah = 1) => {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || {};
  if (inventory[itemName]) {
    inventory[itemName].jumlah -= jumlah;
    if (inventory[itemName].jumlah <= 0) {
      delete inventory[itemName];
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }
};

export const getInventory = () => {
  return JSON.parse(localStorage.getItem('inventory')) || {};
};

export const clearInventory = () => {
  localStorage.removeItem('inventory');
};
