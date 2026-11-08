# 🗺 Ucup Menjelajah Nusantara - Game Petualangan React

*Ucup Menjelajah Nusantara* adalah game petualangan edukatif berbasis web yang dibuat menggunakan *React.js*. Pemain mengendalikan karakter bernama Ucup untuk menjelajah berbagai wilayah Indonesia seperti rumah, pasar, pantai, hutan, dan tambang. Game ini menggabungkan eksplorasi, manajemen status, minigame, dan sistem inventory dalam satu pengalaman petualangan seru.

---

## 🎮 Fitur Utama

- *Loading Screen, Pilih Karakter & Nama Pemain*  
  Game dimulai dari layar loading, pemilihan karakter, dan input nama pemain sebelum masuk ke overworld.

- *Overworld (Map Menu)*  
  Karakter dapat digerakkan bebas menggunakan keyboard atau tombol UI. Masuk ke area hanya jika mencapai koordinat tertentu.

- *Sistem Area Modular*
  - *Rumah*: Bisa makan, mandi, dan tidur di lokasi tertentu.
  - *Pantai*: Bisa minum air kelapa, bermain pasir, berseluncur, dan berenang
  - *Pasar*: Berinteraksi dengan cara menjual item yang ada di inventory kita
  - *Hutan*: Menyusuri rimba dan aktivitas alami.
  - *Tambang: Minigame **Tebak Titik Emas*. Dan aktivitas menambang yang bisa mendapat random mineral

- *Status Karakter*  
  Empat status utama: makan, tidur, kebahagiaan, dan kebersihan. Turun saat bergerak, meningkat melalui aktivitas.

- *Sistem Game Over*  
  Jika satu status turun ke 0, muncul layar Game Over dengan penilaian akhir (Life Satisfaction Score).

- *Inventory Global*  
  Semua loot, seperti ikan dan emas, tersimpan di inventory dan dapat digunakan kapan saja.

- *Musik Latar & Toggle Audio*  
  BGM yang dinamis dan opsi untuk mengatur suara.

- *Day-Night Cycle & Waktu*  
  Siklus siang malam dan waktu berjalan sesuai logika real-time game.

- *Spawn Point*  
  Karakter akan muncul di dekat pintu masuk saat keluar dari area.

---

## 🧠 Teknologi yang Digunakan

- ⚛ *React.js* (SPA dengan React Router)
- 🎮 *HTML5 + CSS3* (termasuk animasi GIF dan video background)
- 🔊 *Audio API HTML5* untuk efek suara dan BGM
- 💾 *localStorage* untuk menyimpan data status, inventory, dan progres pemain

Code Game
https://exquisite-kelpie-3497d8.netlify.app/