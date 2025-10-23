
  // index.js
  // - Manages player list (add/remove/render)
  // - Persists players to sessionStorage under key 'tod_players'
  // - Enables Start button when there are >= 2 players
  // - Navigates to spinpage.html on Start
  // - Keeps floating character placement and drifting animations


document.addEventListener("DOMContentLoaded", () => {
  
  const floating = document.querySelectorAll(".char, .floating");

  function placeFloating() {
    floating.forEach((el) => {
      const randomX = Math.random() * (window.innerWidth - 120);
      const randomY = Math.random() * (window.innerHeight - 120);
      el.style.left = `${randomX}px`;
      el.style.top = `${randomY}px`;
      el.style.animationDelay = `${Math.random() * 5}s`;
    });
  }

  placeFloating();
  setInterval(() => {
    placeFloating();
    floating.forEach((el) => {
      el.style.transition = "top 5s ease, left 5s ease";
    });
  }, 10000);

  // --- Player management ---
  const PLAYER_KEY = 'tod_players'; // sessionStorage key

  const playerNameInput = document.getElementById('playerName');
  const addBtn = document.getElementById('addBtn');
  const listEl = document.getElementById('list');
  const startBtn = document.getElementById('startBtn');

  let players = [];

  function loadPlayers() {
    try {
      const raw = sessionStorage.getItem(PLAYER_KEY);
      players = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse players from sessionStorage', e);
      players = [];
    }
  }

  function savePlayers() {
    sessionStorage.setItem(PLAYER_KEY, JSON.stringify(players));
  }

  function renderPlayers() {
    listEl.innerHTML = '';
    players.forEach((p, idx) => {
      const li = document.createElement('li');
      li.textContent = p;

      // remove button
      const rem = document.createElement('button');
      rem.textContent = '✕';
      rem.setAttribute('aria-label', `Remove ${p}`);
      rem.style.float = 'right';
      rem.style.background = 'transparent';
      rem.style.border = 'none';
      rem.style.color = 'inherit';
      rem.style.cursor = 'pointer';
      rem.style.fontWeight = '700';
      rem.addEventListener('click', () => {
        players.splice(idx, 1);
        savePlayers();
        renderPlayers();
      });

      li.appendChild(rem);
      listEl.appendChild(li);
    });

    // Enable start when at least 2 players
    startBtn.disabled = players.length < 2;
    startBtn.style.opacity = players.length < 2 ? '0.6' : '1';
  }

  function addPlayerFromInput() {
    const name = (playerNameInput.value || '').trim();
    if (!name) return;

    players.push(name);
    playerNameInput.value = '';
    savePlayers();
    renderPlayers();
    playerNameInput.focus();
  }

  // Load em
  loadPlayers();
  renderPlayers();

  // Add b
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addPlayerFromInput();
  });

  // Allow Enter key to add player
  playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayerFromInput();
    }
  });

  // Start button navigates to spinpage and keeps players in sessionStorage
  startBtn.addEventListener('click', () => {
    if (players.length < 2) {
      alert('Please add at least two players to start the game.');
      return;
    }
    // players already saved to sessionStorage
    window.location.href = 'spinpage.html';
  });

  //  helper 
  window._tod = {
    get players() { return players.slice(); },
    clear() { players = []; savePlayers(); renderPlayers(); }
  };
});

