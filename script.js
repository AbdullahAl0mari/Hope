// HOPE v1.2 — dashboard, profile, achievements and arcade

const games = [
  {name:"Number Hunter",description:"Guess the hidden number.",symbol:"?",art:"art-one",mode:"LOGIC / SOLO"},
  {name:"Memory Match",description:"Test your memory.",symbol:"▦",art:"art-two",mode:"MEMORY / SOLO"},
  {name:"Tic Tac Toe",description:"A classic challenge.",symbol:"✕",art:"art-three",mode:"STRATEGY / VS CPU"},
  {name:"Reaction Test",description:"How fast are your reflexes?",symbol:"⚡",art:"art-four",mode:"REFLEX / SOLO"},
  {name:"Quick Math",description:"Solve quick equations.",symbol:"∑",art:"art-custom",mode:"MATH / SOLO"},
  {name:"Word Scramble",description:"Untangle the letters.",symbol:"⌁",art:"art-word",mode:"WORD / SOLO"},
  {name:"Rock Paper Scissors",description:"A quick classic against the CPU.",symbol:"✊",art:"art-rps",mode:"CASUAL / VS CPU"},
  {name:"2048 Mini",description:"Combine tiles and reach 2048.",symbol:"2048",art:"art-2048",mode:"PUZZLE / SOLO"}
];

try {
  const savedCustomGames = JSON.parse(localStorage.getItem("hopeCustomGames") || "[]");
  savedCustomGames.forEach(item => {
    if (item && typeof item.name === "string" && item.name.trim()) {
      games.push({
        name: item.name.slice(0,36),
        description: (item.description || "Added to your personal collection.").slice(0,100),
        symbol: "✦", art: "art-custom", mode: (item.mode || "PERSONAL COLLECTION").slice(0,32),
        custom: true
      });
    }
  });
} catch (error) {
  localStorage.removeItem("hopeCustomGames");
}

let playedGames = Number(localStorage.getItem("playedGames")) || 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
let playerName = localStorage.getItem("playerName") || "Player One";
let completedGames = Number(localStorage.getItem("completedGames")) || 0;

function navigate(pageName) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(pageName).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(button => button.classList.remove("active"));
  const selected = document.querySelector(`[data-page="${pageName}"]`);
  if (selected) selected.classList.add("active");
  updateStats();
  if (pageName === "achievements") renderAchievements();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

function createGameCard(game) {
  const safeName = escapeHTML(game.name);
  const safeDescription = escapeHTML(game.description);
  const safeMode = escapeHTML(game.mode);
  const gameNumber = String(games.indexOf(game)+1).padStart(2,"0");
  return `<div class="game-card">
    <div class="game-art ${game.art}"><span>${game.custom ? "✦" : game.symbol}</span><small>${gameNumber}</small></div>
    <div class="game-info"><div class="game-category">${safeMode}</div>
      <h3>${safeName}</h3><p>${safeDescription}</p>
      ${game.custom ? '<span class="collection-saved">✓ IN YOUR COLLECTION</span>' : '<button class="play-btn" onclick="navigate(\'arcade\')">Explore →</button>'}
    </div>
  </div>`;
}

function loadGames() {
  document.getElementById("library-games").innerHTML = games.map(createGameCard).join("");
  document.getElementById("recent-games").innerHTML = games.slice(0,2).map(createGameCard).join("");
  document.getElementById("game-count").textContent = games.length;
  document.getElementById("library-count").textContent = `${games.length} GAMES`;
}

function updateStats() {
  document.getElementById("played-count").textContent = playedGames;
  document.getElementById("best-score").textContent = bestScore;
  document.getElementById("game-count").textContent = games.length;
  document.getElementById("greeting").textContent = `${getGreeting()}, ${playerName}.`;
  document.getElementById("profile-name").textContent = playerName;
  document.getElementById("profile-avatar").textContent = playerName.trim().charAt(0).toUpperCase() || "A";
  document.getElementById("profile-level").textContent = `Level ${String(Math.floor(playedGames / 3) + 1).padStart(2,"0")}`;
  renderAchievementSnapshot();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function updateClock() {
  document.getElementById("live-clock").textContent =
    new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
setInterval(updateClock, 1000);
updateClock();

function editProfile() {
  document.getElementById("name-input").value = playerName;
  document.getElementById("profile-modal").classList.add("show");
  document.getElementById("name-input").focus();
}
function closeProfile() {
  document.getElementById("profile-modal").classList.remove("show");
}
function saveProfile() {
  const value = document.getElementById("name-input").value.trim();
  if (!value) return;
  playerName = value.slice(0,20);
  localStorage.setItem("playerName", playerName);
  updateStats();
  closeProfile();
}

document.getElementById("library-search").addEventListener("input", event => {
  const query = event.target.value.toLowerCase().trim();
  const filtered = games.filter(game =>
    game.name.toLowerCase().includes(query) ||
    game.description.toLowerCase().includes(query) ||
    game.mode.toLowerCase().includes(query)
  );
  document.getElementById("library-games").innerHTML = filtered.map(createGameCard).join("");
  renderFavoriteButtons();
  document.getElementById("library-count").textContent = `${filtered.length} ${filtered.length === 1 ? "GAME" : "GAMES"}`;
  document.getElementById("empty-library").hidden = filtered.length !== 0;
});

const achievements = [
  {title:"First Steps",description:"Complete your first arcade game.",icon:"✦",test:() => completedGames >= 1},
  {title:"Getting Started",description:"Complete 3 arcade games.",icon:"⚡",test:() => completedGames >= 3},
  {title:"Arcade Regular",description:"Complete 5 arcade games.",icon:"♛",test:() => completedGames >= 5},
  {title:"High Scorer",description:"Reach a score of 80 or higher.",icon:"★",test:() => bestScore >= 80},
  {title:"Persistent Player",description:"Play 10 completed games.",icon:"◆",test:() => completedGames >= 10}
];

function renderAchievementSnapshot() {
  const target = document.getElementById("dashboard-achievements");
  if (!target) return;
  const unlocked = achievements.filter(item => item.test());
  target.innerHTML = (unlocked.length ? unlocked.slice(0,3) : achievements.slice(0,3)).map(item => `
    <div class="achievement-chip"><div class="achievement-icon">${item.icon}</div>
      <div><strong>${item.title}</strong><small>${item.test() ? "Unlocked" : item.description}</small></div>
    </div>`).join("");
}

function renderAchievements() {
  const unlocked = achievements.filter(item => item.test()).length;
  document.getElementById("achievement-count").textContent = `${unlocked} / ${achievements.length}`;
  document.getElementById("achievement-progress").style.width = `${unlocked / achievements.length * 100}%`;
  document.getElementById("achievement-list").innerHTML = achievements.map(item => `
    <div class="achievement-item ${item.test() ? "unlocked" : "locked"}">
      <div class="achievement-icon">${item.icon}</div>
      <div><strong>${item.title} ${item.test() ? "✓" : "🔒"}</strong><small>${item.description}</small></div>
    </div>`).join("");
}

function recordGamePlayed(score = 0) {
  playedGames++;
  completedGames++;
  bestScore = Math.max(bestScore, score);
  localStorage.setItem("playedGames", playedGames);
  localStorage.setItem("completedGames", completedGames);
  localStorage.setItem("bestScore", bestScore);
  updateStats();
  renderAchievements();
}

function openGame(game) {
  document.getElementById("game-modal").classList.add("show");
  document.getElementById("number-game").style.display = game === "number" ? "block" : "none";
  const other = document.getElementById("other-game");
  other.style.display = game === "number" ? "none" : "block";
  if (game === "memory") startMemoryGame();
  if (game === "tictactoe") startTicTacToe();
  if (game === "number") startNumberGame();
}
function closeGame() {
  document.getElementById("game-modal").classList.remove("show");
}

// Number Hunter
let targetNumber, attempts, numberFinished = false;
function startNumberGame() {
  targetNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  numberFinished = false;
  document.getElementById("attempts").textContent = attempts;
  document.getElementById("game-message").textContent = "Ready when you are.";
  document.getElementById("guess-input").value = "";
}
function checkGuess() {
  const input = document.getElementById("guess-input");
  const message = document.getElementById("game-message");
  const guess = Number(input.value);
  if (!input.value || !Number.isInteger(guess) || guess < 1 || guess > 100) {
    message.textContent = "Enter a number between 1 and 100.";
    return;
  }
  if (numberFinished) {
    message.textContent = "You already found it! Start a new number.";
    return;
  }
  attempts++;
  document.getElementById("attempts").textContent = attempts;
  if (guess === targetNumber) {
    numberFinished = true;
    const score = Math.max(0, 100 - (attempts - 1) * 10);
    message.textContent = `Correct! You found it in ${attempts} attempts! 🎉 Score: ${score}`;
    recordGamePlayed(score);
  } else {
    message.textContent = guess > targetNumber ? "Too high! Try lower. ↓" : "Too low! Try higher. ↑";
  }
}
document.getElementById("guess-input").addEventListener("keydown", event => {
  if (event.key === "Enter") checkGuess();
});

// Memory Match
let memoryCards = [], firstCard = null, locked = false, memoryMoves = 0, memoryMatches = 0;
function startMemoryGame() {
  const emojis = ["🎮","🚀","🎧","👾","🎮","🚀","🎧","👾"];
  memoryCards = emojis.sort(() => Math.random() - 0.5);
  firstCard = null; locked = false; memoryMoves = 0; memoryMatches = 0;
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 002</p><h2>Memory Match</h2>
    <p class="subtitle">Find all matching pairs.</p>
    <p class="arcade-message" id="memory-status">Find your first pair!</p>
    <div class="arcade-board" id="memory-board"></div>
    <p class="attempts">Moves: <span id="memory-moves">0</span></p>
    <button class="primary-btn game-action" onclick="startMemoryGame()">Restart Game</button>`;
  const board = document.getElementById("memory-board");
  memoryCards.forEach((emoji,index) => {
    const card = document.createElement("button");
    card.className = "memory-card"; card.textContent = "?";
    card.addEventListener("click", () => flipMemoryCard(card,emoji));
    board.appendChild(card);
  });
}
function flipMemoryCard(card,emoji) {
  if (locked || card.classList.contains("matched") || card.textContent !== "?") return;
  card.textContent = emoji;
  if (!firstCard) { firstCard = card; return; }
  memoryMoves++;
  document.getElementById("memory-moves").textContent = memoryMoves;
  if (firstCard.textContent === card.textContent) {
    firstCard.classList.add("matched"); card.classList.add("matched");
    firstCard = null; memoryMatches++;
    if (memoryMatches === 4) {
      document.getElementById("memory-status").textContent = "Amazing! You found every pair! 🎉";
      const score = Math.max(10, 100 - (memoryMoves - 4) * 5);
      recordGamePlayed(score);
    } else document.getElementById("memory-status").textContent = "Nice match! Find another pair.";
  } else {
    locked = true;
    const previousCard = firstCard; firstCard = null;
    document.getElementById("memory-status").textContent = "Not a match. Try again!";
    setTimeout(() => { previousCard.textContent = "?"; card.textContent = "?"; locked = false; }, 800);
  }
}

// Tic Tac Toe vs a simple computer opponent
let ticBoard = Array(9).fill(""), ticActive = true;
function startTicTacToe() {
  ticBoard = Array(9).fill(""); ticActive = true;
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 003</p><h2>Tic Tac Toe</h2>
    <p class="subtitle">You are X. The computer is O.</p>
    <p class="arcade-message" id="tic-status">Your turn!</p>
    <div class="tic-board" id="tic-board"></div>
    <button class="primary-btn game-action" onclick="startTicTacToe()">Play Again</button>`;
  renderTicBoard();
}
function renderTicBoard() {
  const board = document.getElementById("tic-board"); board.innerHTML = "";
  ticBoard.forEach((value,index) => {
    const cell = document.createElement("button");
    cell.className = "tic-cell"; cell.textContent = value;
    cell.addEventListener("click", () => playerMove(index));
    board.appendChild(cell);
  });
}
function checkWinner(board) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of wins) if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  return null;
}
function playerMove(index) {
  if (!ticActive || ticBoard[index] !== "") return;
  ticBoard[index] = "X"; renderTicBoard();
  if (finishTicGame()) return;
  document.getElementById("tic-status").textContent = "Computer is thinking...";
  setTimeout(computerMove, 400);
}
function computerMove() {
  if (!ticActive) return;
  let move = findWinningMove("O");
  if (move === -1) move = findWinningMove("X");
  if (move === -1) {
    const empty = ticBoard.map((v,i) => v === "" ? i : -1).filter(i => i !== -1);
    if (empty.length) move = empty[Math.floor(Math.random() * empty.length)];
  }
  if (move !== -1) ticBoard[move] = "O";
  renderTicBoard(); finishTicGame();
  if (ticActive) document.getElementById("tic-status").textContent = "Your turn!";
}
function findWinningMove(symbol) {
  for (let i=0;i<9;i++) if (ticBoard[i] === "") {
    const test = [...ticBoard]; test[i] = symbol;
    if (checkWinner(test) === symbol) return i;
  }
  return -1;
}
function finishTicGame() {
  const winner = checkWinner(ticBoard);
  const status = document.getElementById("tic-status");
  if (winner) {
    ticActive = false;
    if (winner === "X") { status.textContent = "You won! Congratulations! 🎉"; recordGamePlayed(100); }
    else status.textContent = "Computer wins! Try again.";
    return true;
  }
  if (!ticBoard.includes("")) { ticActive = false; status.textContent = "It's a draw! 🤝"; return true; }
  return false;
}

document.getElementById("game-modal").addEventListener("click", event => {
  if (event.target.id === "game-modal") closeGame();
});
document.getElementById("profile-modal").addEventListener("click", event => {
  if (event.target.id === "profile-modal") closeProfile();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeGame(); closeProfile(); }
});

loadGames();
updateStats();
renderAchievements();


// =================================
// HOPE v1.3 — FAVORITES & PLAYER XP
// =================================

let favorites = JSON.parse(localStorage.getItem("hopeFavorites") || "[]");
let playerXP = Number(localStorage.getItem("hopeXP")) || 0;
let soundEnabled = localStorage.getItem("hopeSound") !== "off";
let audioContext = null;

function playerLevel() {
  return Math.floor(playerXP / 100) + 1;
}
function xpIntoLevel() {
  return playerXP % 100;
}
function playSound(frequency = 520, duration = 0.07) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = audioContext || new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Audio is optional; the games remain playable if sound is unavailable.
  }
}

function refreshPlayerProgress() {
  const level = playerLevel();
  const xp = xpIntoLevel();
  const levelText = document.getElementById("profile-level");
  const fill = document.getElementById("xp-mini-fill");
  if (levelText) levelText.textContent = `Level ${String(level).padStart(2,"0")} · ${playerXP} XP`;
  if (fill) fill.style.width = `${xp}%`;
}
function awardXP(amount) {
  playerXP += amount;
  localStorage.setItem("hopeXP", playerXP);
  refreshPlayerProgress();
  playSound(760, 0.1);
  updateStats();
}

function toggleFavorite(gameName) {
  if (favorites.includes(gameName)) {
    favorites = favorites.filter(name => name !== gameName);
  } else {
    favorites.push(gameName);
  }
  localStorage.setItem("hopeFavorites", JSON.stringify(favorites));
  loadGames();
  const search = document.getElementById("library-search");
  if (search && search.value) search.dispatchEvent(new Event("input"));
  playSound(620);
}

function openSettings() {
  document.getElementById("settings-modal").classList.add("show");
  updateSoundButton();
}
function closeSettings() {
  document.getElementById("settings-modal").classList.remove("show");
}
function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("hopeSound", soundEnabled ? "on" : "off");
  updateSoundButton();
  playSound(540);
}
function updateSoundButton() {
  const button = document.getElementById("sound-toggle");
  if (!button) return;
  button.textContent = soundEnabled ? "ON" : "OFF";
  button.classList.toggle("off", !soundEnabled);
}
function resetProgress() {
  if (!confirm("Reset your HOPE scores, XP and completed games? Your player name and favorites will stay.")) return;
  playedGames = 0;
  bestScore = 0;
  completedGames = 0;
  playerXP = 0;
  ["playedGames","bestScore","completedGames","hopeXP","hopeActivity","hopeDailyClaimDate","hopeDailyClaims"].forEach(key => localStorage.removeItem(key));
  updateStats();
  renderAchievements();
  refreshPlayerProgress();
  if (typeof refreshDailyChallenge === "function") refreshDailyChallenge();
  if (typeof refreshStatistics === "function") refreshStatistics();
  closeSettings();
}

function renderFavoriteButtons() {
  document.querySelectorAll("#library-games .game-card, #recent-games .game-card").forEach(card => {
    const title = card.querySelector("h3")?.textContent;
    if (!title || card.querySelector(".favorite-btn")) return;
    const button = document.createElement("button");
    button.className = "favorite-btn" + (favorites.includes(title) ? " active" : "");
    button.textContent = favorites.includes(title) ? "♥" : "♡";
    button.title = favorites.includes(title) ? "Remove favorite" : "Add to favorites";
    button.setAttribute("aria-label", button.title);
    button.onclick = () => toggleFavorite(title);
    card.appendChild(button);
  });
}

// Wrap the original card loader so favorite controls refresh with the cards.
const originalLoadGames = loadGames;
loadGames = function() {
  originalLoadGames();
  renderFavoriteButtons();
};

// Award XP for completed games, in addition to the v1.2 score tracking.
const originalRecordGamePlayed = recordGamePlayed;
recordGamePlayed = function(score = 0) {
  const before = completedGames;
  originalRecordGamePlayed(score);
  if (completedGames > before) awardXP(25);
};

// Reaction Test
let reactionTimer = null;
let reactionStart = 0;
let reactionState = "idle";

function startReactionGame() {
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 004</p>
    <h2>Reaction Test</h2>
    <p class="subtitle">Wait for green, then click as fast as you can.</p>
    <button class="reaction-pad" id="reaction-pad" onclick="handleReactionClick()">Start test</button>
    <p class="reaction-result" id="reaction-result">Your best reaction time will be saved for this session.</p>
    <button class="text-btn game-action" onclick="startReactionGame()">Try again ↻</button>`;
  reactionState = "idle";
}
function handleReactionClick() {
  const pad = document.getElementById("reaction-pad");
  const result = document.getElementById("reaction-result");
  if (!pad || !result) return;
  if (reactionState === "idle" || reactionState === "done") {
    reactionState = "waiting";
    pad.className = "reaction-pad waiting";
    pad.textContent = "Wait for green...";
    result.textContent = "Don't click too early!";
    const delay = 1500 + Math.random() * 3000;
    reactionTimer = setTimeout(() => {
      reactionState = "ready";
      reactionStart = performance.now();
      pad.className = "reaction-pad ready";
      pad.textContent = "CLICK NOW!";
    }, delay);
  } else if (reactionState === "waiting") {
    clearTimeout(reactionTimer);
    reactionState = "done";
    pad.className = "reaction-pad";
    pad.textContent = "Too soon — try again";
    result.textContent = "False start! Wait until the button turns green.";
    playSound(220, 0.12);
  } else if (reactionState === "ready") {
    const elapsed = Math.round(performance.now() - reactionStart);
    reactionState = "done";
    pad.className = "reaction-pad";
    pad.textContent = "Try again";
    result.textContent = `Your reaction time: ${elapsed} ms`;
    recordGamePlayed(Math.max(0, 200 - Math.floor(elapsed / 3)));
    playSound(850, 0.1);
  }
}

// Extend the game launcher to include Reaction Test.
const originalOpenGame = openGame;
openGame = function(game) {
  if (game === "reaction") {
    document.getElementById("game-modal").classList.add("show");
    document.getElementById("number-game").style.display = "none";
    document.getElementById("other-game").style.display = "block";
    startReactionGame();
    return;
  }
  originalOpenGame(game);
};

// Keep the settings modal in sync with Escape and outside clicks.
document.getElementById("settings-modal").addEventListener("click", event => {
  if (event.target.id === "settings-modal") closeSettings();
});
const originalEscapeHandler = null;
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSettings();
});

// Add a subtle sound to successful navigation and initialize XP display.
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => playSound(440, 0.045));
});
refreshPlayerProgress();
updateSoundButton();


/* HOPE v1.4 — persistent color themes and profile overview */
const hopeThemes = {
  violet: "Violet",
  ocean: "Ocean",
  emerald: "Emerald",
  sunset: "Sunset",
  rose: "Rose",
  amber: "Amber"
};

function setTheme(themeName) {
  if (!Object.prototype.hasOwnProperty.call(hopeThemes, themeName)) return;
  document.body.dataset.theme = themeName;
  localStorage.setItem("hopeTheme", themeName);
  const label = document.getElementById("theme-current");
  if (label) label.textContent = hopeThemes[themeName];
  document.querySelectorAll(".theme-swatch").forEach(swatch => {
    const selected = swatch.dataset.themeChoice === themeName;
    swatch.classList.toggle("selected", selected);
    swatch.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("hopeTheme") || "violet";
  setTheme(savedTheme);
}

function refreshProfileOverview() {
  const modal = document.querySelector("#profile-modal .modal-content");
  if (!modal || modal.querySelector(".profile-overview")) return;
  const input = modal.querySelector("#name-input");
  if (!input) return;
  const overview = document.createElement("div");
  overview.className = "profile-overview";
  overview.innerHTML = `
    <div class="profile-stat"><strong id="profile-modal-level">${playerLevel()}</strong><small>LEVEL</small></div>
    <div class="profile-stat"><strong id="profile-modal-xp">${playerXP}</strong><small>TOTAL XP</small></div>
    <div class="profile-stat"><strong id="profile-modal-games">${completedGames}</strong><small>COMPLETED</small></div>`;
  input.insertAdjacentElement("beforebegin", overview);
}

const originalEditProfile = editProfile;
editProfile = function() {
  originalEditProfile();
  refreshProfileOverview();
  const level = document.getElementById("profile-modal-level");
  const xp = document.getElementById("profile-modal-xp");
  const gamesDone = document.getElementById("profile-modal-games");
  if (level) level.textContent = playerLevel();
  if (xp) xp.textContent = playerXP;
  if (gamesDone) gamesDone.textContent = completedGames;
};

const originalAwardXP = awardXP;
awardXP = function(amount) {
  originalAwardXP(amount);
  const xp = document.getElementById("profile-modal-xp");
  const level = document.getElementById("profile-modal-level");
  const gamesDone = document.getElementById("profile-modal-games");
  if (xp) xp.textContent = playerXP;
  if (level) level.textContent = playerLevel();
  if (gamesDone) gamesDone.textContent = completedGames;
};

// Re-render the cards once the favorite-button wrapper is installed.
loadGames();
initializeTheme();


/* =========================
   HOPE v1.5 — personal platform update
   ========================= */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

// Library filters and personal collection
let activeLibraryFilter = "all";
function setLibraryFilter(filter) {
  activeLibraryFilter = filter;
  document.querySelectorAll("[data-library-filter]").forEach(button =>
    button.classList.toggle("active", button.dataset.libraryFilter === filter)
  );
  renderLibrary();
}
function renderLibrary() {
  const query = (document.getElementById("library-search")?.value || "").toLowerCase().trim();
  let filtered = games.filter(game =>
    game.name.toLowerCase().includes(query) ||
    game.description.toLowerCase().includes(query) ||
    game.mode.toLowerCase().includes(query)
  );
  if (activeLibraryFilter === "favorites") filtered = filtered.filter(game => favorites.includes(game.name));
  if (activeLibraryFilter === "custom") filtered = filtered.filter(game => game.custom);
  const target = document.getElementById("library-games");
  if (!target) return;
  target.innerHTML = filtered.map(createGameCard).join("");
  renderFavoriteButtons();
  document.getElementById("library-count").textContent = `${filtered.length} ${filtered.length === 1 ? "GAME" : "GAMES"}`;
  document.getElementById("empty-library").hidden = filtered.length !== 0;
}
document.getElementById("library-search").addEventListener("input", renderLibrary);

function toggleAddGame(force) {
  const panel = document.getElementById("add-game-panel");
  const shouldOpen = typeof force === "boolean" ? force : panel.hidden;
  panel.hidden = !shouldOpen;
  if (shouldOpen) document.getElementById("custom-game-name").focus();
}
function addCustomGame() {
  const nameInput = document.getElementById("custom-game-name");
  const genreInput = document.getElementById("custom-game-genre");
  const noteInput = document.getElementById("custom-game-note");
  const message = document.getElementById("add-game-message");
  const name = nameInput.value.trim();
  if (!name) {
    message.textContent = "Please enter a game title first.";
    nameInput.focus();
    return;
  }
  if (games.some(game => game.name.toLowerCase() === name.toLowerCase())) {
    message.textContent = "That game is already in your library.";
    return;
  }
  const item = {
    name: name.slice(0,36),
    description: noteInput.value.trim().slice(0,100) || "Added to your personal collection.",
    mode: genreInput.value.trim().slice(0,32) || "PERSONAL COLLECTION"
  };
  const saved = JSON.parse(localStorage.getItem("hopeCustomGames") || "[]");
  saved.push(item);
  localStorage.setItem("hopeCustomGames", JSON.stringify(saved));
  games.push({...item, symbol:"✦", art:"art-custom", custom:true});
  nameInput.value = ""; genreInput.value = ""; noteInput.value = "";
  message.textContent = "Added to your collection!";
  loadGames();
  renderLibrary();
  updateStats();
  playSound(720, 0.09);
}
const originalToggleFavoriteV15 = toggleFavorite;
toggleFavorite = function(gameName) {
  originalToggleFavoriteV15(gameName);
  renderLibrary();
  refreshStatistics();
};

// Player profile: bio and avatar
let playerBio = localStorage.getItem("hopeBio") || "Your gaming space";
let playerAvatar = localStorage.getItem("hopeAvatar") || "🎮";
const originalEditProfileV15 = editProfile;
editProfile = function() {
  originalEditProfileV15();
  document.getElementById("bio-input").value = playerBio;
  document.getElementById("avatar-input").value = playerAvatar;
};
const originalSaveProfileV15 = saveProfile;
saveProfile = function() {
  originalSaveProfileV15();
  const bioValue = document.getElementById("bio-input").value.trim();
  const avatarValue = document.getElementById("avatar-input").value.trim();
  playerBio = bioValue.slice(0,70) || "Your gaming space";
  playerAvatar = avatarValue.slice(0,2) || "🎮";
  localStorage.setItem("hopeBio", playerBio);
  localStorage.setItem("hopeAvatar", playerAvatar);
  document.getElementById("profile-bio").textContent = playerBio;
  document.getElementById("profile-avatar").textContent = playerAvatar;
  refreshStatistics();
};
const originalUpdateStatsV15 = updateStats;
updateStats = function() {
  originalUpdateStatsV15();
  const avatar = document.getElementById("profile-avatar");
  const bio = document.getElementById("profile-bio");
  if (avatar) avatar.textContent = playerAvatar;
  if (bio) bio.textContent = playerBio;
  refreshStatistics();
};

// Expanded achievements
achievements.push(
  {title:"Collector",description:"Add your first personal game to the library.",icon:"✧",test:() => games.some(game => game.custom)},
  {title:"Daily Ritual",description:"Claim a daily reward.",icon:"☀",test:() => Number(localStorage.getItem("hopeDailyClaims") || 0) >= 1},
  {title:"Rising Star",description:"Reach player level 5.",icon:"⬆",test:() => playerLevel() >= 5},
  {title:"Well Rounded",description:"Save at least 3 games as favorites.",icon:"♥",test:() => favorites.length >= 3},
  {title:"Dedicated",description:"Complete 25 arcade games.",icon:"♜",test:() => completedGames >= 25}
);

// Seven-day activity history and daily progress
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth()+1).padStart(2,"0");
  const day = String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
}
function readActivity() {
  try { return JSON.parse(localStorage.getItem("hopeActivity") || "{}"); }
  catch (error) { return {}; }
}
function dailyPlays() {
  const data = readActivity();
  return Number(data[localDateKey()] || 0);
}
function recordActivity() {
  const data = readActivity();
  const key = localDateKey();
  data[key] = Number(data[key] || 0) + 1;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate()-60);
  Object.keys(data).forEach(date => { if (date < localDateKey(cutoff)) delete data[date]; });
  localStorage.setItem("hopeActivity", JSON.stringify(data));
}
const originalRecordGamePlayedV15 = recordGamePlayed;
recordGamePlayed = function(score = 0) {
  originalRecordGamePlayedV15(score);
  recordActivity();
  refreshDailyChallenge();
  refreshStatistics();
};

function refreshDailyChallenge() {
  const plays = dailyPlays();
  const claimed = localStorage.getItem("hopeDailyClaimDate") === localDateKey();
  const dateLabel = document.getElementById("daily-date");
  if (!dateLabel) return;
  dateLabel.textContent = new Date().toLocaleDateString([], {weekday:"long", month:"long", day:"numeric"}).toUpperCase();
  document.getElementById("daily-progress-label").textContent = `${Math.min(plays,1)} / 1`;
  document.getElementById("daily-progress-fill").style.width = plays > 0 ? "100%" : "0%";
  document.getElementById("daily-description").textContent = plays > 0
    ? "Challenge complete! You earned the chance to claim today's reward."
    : "Complete one arcade game today to unlock your daily bonus.";
  const claim = document.getElementById("daily-claim");
  claim.disabled = plays < 1 || claimed;
  claim.textContent = claimed ? "Reward claimed ✓" : "Claim daily reward";
  document.getElementById("daily-note").textContent = claimed
    ? "You're all set for today. Come back tomorrow for another little challenge."
    : plays > 0 ? "Nice work. Your reward is ready!" : "Play any arcade game to complete today's challenge.";
  document.getElementById("daily-streak-count").textContent = Number(localStorage.getItem("hopeDailyClaims") || 0);
}
function claimDailyReward() {
  if (dailyPlays() < 1 || localStorage.getItem("hopeDailyClaimDate") === localDateKey()) return;
  localStorage.setItem("hopeDailyClaimDate", localDateKey());
  localStorage.setItem("hopeDailyClaims", Number(localStorage.getItem("hopeDailyClaims") || 0) + 1);
  awardXP(30);
  refreshDailyChallenge();
  renderAchievements();
  refreshStatistics();
}
function refreshStatistics() {
  const ids = {
    "stats-xp": playerXP,
    "stats-level": playerLevel(),
    "stats-completed": completedGames,
    "stats-favorites": favorites.length,
    "stats-best": bestScore,
    "stats-library": games.length
  };
  Object.entries(ids).forEach(([id,value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
  const activity = readActivity();
  const chart = document.getElementById("activity-chart");
  if (chart) {
    const days = [];
    for (let offset=6; offset>=0; offset--) {
      const date = new Date();
      date.setDate(date.getDate()-offset);
      const key = localDateKey(date);
      days.push({label:date.toLocaleDateString([], {weekday:"short"}), count:Number(activity[key] || 0)});
    }
    const max = Math.max(1, ...days.map(day => day.count));
    chart.innerHTML = days.map(day => `
      <div class="activity-day">
        <div class="activity-bar-wrap"><div class="activity-bar" style="height:${Math.max(day.count ? 10 : 3, day.count/max*100)}%" title="${day.count} completed games"></div></div>
        <strong>${day.count}</strong><small>${day.label}</small>
      </div>`).join("");
  }
  const daysActive = Object.values(activity).filter(value => Number(value) > 0).length;
  const daysElement = document.getElementById("stats-days");
  if (daysElement) daysElement.textContent = daysActive;
}

// Color theme editor and dashboard wallpapers
const originalSetThemeV15 = setTheme;
setTheme = function(themeName) {
  if (!Object.prototype.hasOwnProperty.call(hopeThemes, themeName)) return;
  localStorage.removeItem("hopeCustomAccent");
  document.body.style.removeProperty("--purple");
  originalSetThemeV15(themeName);
  const picker = document.getElementById("custom-accent");
  if (picker) picker.value = getComputedStyle(document.body).getPropertyValue("--purple").trim();
};
function setCustomAccent(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return;
  document.body.style.setProperty("--purple", color);
  document.body.dataset.theme = "custom";
  localStorage.setItem("hopeCustomAccent", color);
  localStorage.setItem("hopeTheme", "custom");
  document.querySelectorAll(".theme-swatch").forEach(swatch => swatch.classList.remove("selected"));
  document.getElementById("theme-current").textContent = "Custom";
}
function initializeCustomAccent() {
  const saved = localStorage.getItem("hopeCustomAccent");
  if (saved && /^#[0-9a-f]{6}$/i.test(saved)) {
    document.body.style.setProperty("--purple", saved);
    document.body.dataset.theme = "custom";
    document.getElementById("custom-accent").value = saved;
    document.getElementById("theme-current").textContent = "Custom";
  }
}
function setWallpaper(name) {
  const allowed = ["midnight","aurora","nebula","grid"];
  if (!allowed.includes(name)) return;
  document.body.dataset.wallpaper = name;
  localStorage.setItem("hopeWallpaper", name);
  document.querySelectorAll(".wallpaper-option").forEach(button =>
    button.classList.toggle("selected", button.dataset.wallpaperChoice === name)
  );
}
function initializeWallpaper() {
  setWallpaper(localStorage.getItem("hopeWallpaper") || "midnight");
}

// Quick Math mini-game
function startMathGame() {
  const a = Math.floor(Math.random()*12)+1;
  const b = Math.floor(Math.random()*12)+1;
  const operations = ["+","−","×"];
  const operation = operations[Math.floor(Math.random()*operations.length)];
  const answer = operation === "+" ? a+b : operation === "−" ? a-b : a*b;
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 005</p><h2>Quick Math</h2>
    <p class="subtitle">Solve this equation to complete the round.</p>
    <div class="math-equation">${a} ${operation} ${b} = ?</div>
    <input type="number" id="math-answer" placeholder="Your answer..." autocomplete="off">
    <button class="primary-btn game-action" onclick="checkMathAnswer(${answer})">Check answer</button>
    <p class="arcade-message" id="math-message" aria-live="polite">You've got this.</p>
    <button class="text-btn game-action" onclick="startMathGame()">New equation ↻</button>`;
  document.getElementById("math-answer").focus();
}
function checkMathAnswer(answer) {
  const input = document.getElementById("math-answer");
  const message = document.getElementById("math-message");
  if (!input || !message) return;
  if (input.value === "") { message.textContent = "Enter your answer first."; return; }
  if (Number(input.value) === answer) {
    message.textContent = "Correct! Nice work. +25 XP";
    input.disabled = true;
    const checkButton = document.querySelector("#other-game .primary-btn");
    if (checkButton) checkButton.disabled = true;
    recordGamePlayed(100);
  } else {
    message.textContent = "Not quite. Try a new equation!";
  }
}

// Extend game launcher for the new game.
const originalOpenGameV15 = openGame;
openGame = function(game) {
  if (game === "math") {
    document.getElementById("game-modal").classList.add("show");
    document.getElementById("number-game").style.display = "none";
    document.getElementById("other-game").style.display = "block";
    startMathGame();
    return;
  }
  originalOpenGameV15(game);
};

// Keep daily page and stats fresh whenever the app is opened or navigated.
const originalNavigateV15 = navigate;
navigate = function(pageName) {
  originalNavigateV15(pageName);
  if (pageName === "statistics") refreshStatistics();
  if (pageName === "daily") refreshDailyChallenge();
  if (pageName === "achievements") renderAchievements();
};

// Restore profile, themes, wallpaper and collection on startup.
initializeTheme();
initializeCustomAccent();
initializeWallpaper();
loadGames();
renderLibrary();
document.getElementById("profile-bio").textContent = playerBio;
document.getElementById("profile-avatar").textContent = playerAvatar;
refreshDailyChallenge();
refreshStatistics();
renderAchievements();

const originalCloseGameV15 = closeGame;
closeGame = function() {
  tileGameActive = false;
  if (typeof reactionTimer !== "undefined" && reactionTimer) clearTimeout(reactionTimer);
  reactionState = "idle";
  originalCloseGameV15();
};


/* =========================
   HOPE v3.2 — anime character illustration studio
   ========================= */

// Custom avatar model. Old emoji-only profiles are migrated safely.
let avatarConfig = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem("hopeAvatarConfig") || "null");
    if (saved && typeof saved === "object") return {
      face: saved.face || playerAvatar || "🎮",
      color: /^#[0-9a-f]{6}$/i.test(saved.color || "") ? saved.color : "#a78bfa",
      frame: ["glow","solid","double","none"].includes(saved.frame) ? saved.frame : "glow",
      badge: ["","✦","⚡","♥","♛","☾"].includes(saved.badge) ? saved.badge : ""
    };
  } catch (e) {}
  return {face: playerAvatar || "🎮", color:"#a78bfa", frame:"glow", badge:""};
})();

function paintAvatar(element, config = avatarConfig) {
  if (!element) return;
  element.textContent = config.face;
  element.style.background = config.color;
  element.style.setProperty("--avatar-color", config.color);
  element.dataset.frame = config.frame;
  element.dataset.badge = config.badge;
}
function updateAvatarPreview() {
  const preview = document.getElementById("avatar-preview");
  if (preview) paintAvatar(preview, avatarConfig);
  document.querySelectorAll("[data-avatar-face]").forEach(button =>
    button.classList.toggle("selected", button.dataset.avatarFace === avatarConfig.face)
  );
  document.querySelectorAll("[data-avatar-color]").forEach(button =>
    button.classList.toggle("selected", button.dataset.avatarColor === avatarConfig.color)
  );
  const frame = document.getElementById("avatar-frame");
  const badge = document.getElementById("avatar-badge");
  const custom = document.getElementById("avatar-custom-color");
  if (frame) frame.value = avatarConfig.frame;
  if (badge) badge.value = avatarConfig.badge;
  if (custom) custom.value = avatarConfig.color;
}
document.querySelectorAll("[data-avatar-face]").forEach(button => {
  button.addEventListener("click", () => {
    avatarConfig.face = button.dataset.avatarFace;
    updateAvatarPreview();
    playSound(520,.035);
  });
});
document.querySelectorAll("[data-avatar-color]").forEach(button => {
  button.addEventListener("click", () => {
    avatarConfig.color = button.dataset.avatarColor;
    updateAvatarPreview();
  });
});
document.getElementById("avatar-custom-color")?.addEventListener("input", event => {
  avatarConfig.color = event.target.value;
  updateAvatarPreview();
});
document.getElementById("avatar-frame")?.addEventListener("change", event => {
  avatarConfig.frame = event.target.value;
  updateAvatarPreview();
});
document.getElementById("avatar-badge")?.addEventListener("change", event => {
  avatarConfig.badge = event.target.value;
  updateAvatarPreview();
});

const editProfileV16 = editProfile;
editProfile = function() {
  editProfileV16();
  updateAvatarPreview();
};
const saveProfileV16 = saveProfile;
saveProfile = function() {
  saveProfileV16();
  playerAvatar = avatarConfig.face;
  localStorage.setItem("hopeAvatar", playerAvatar);
  localStorage.setItem("hopeAvatarConfig", JSON.stringify(avatarConfig));
  paintAvatar(document.getElementById("profile-avatar"));
  renderPlayerCard();
};
const updateStatsV16 = updateStats;
updateStats = function() {
  updateStatsV16();
  paintAvatar(document.getElementById("profile-avatar"));
};

function renderPlayerCard() {
  const target = document.getElementById("player-card-panel");
  if (!target) return;
  const safeName = escapeHTML(playerName);
  const safeBio = escapeHTML(playerBio);
  target.innerHTML = `
    <div class="player-card-avatar" id="player-card-avatar"></div>
    <div class="player-card-copy"><strong>${safeName}</strong><small>${safeBio}</small>
      <div class="player-card-tags"><span>LEVEL ${playerLevel()}</span><span>${playerXP} XP</span><span>${completedGames} COMPLETED</span></div>
    </div>`;
  paintAvatar(document.getElementById("player-card-avatar"));
}

// Additional achievements
achievements.push(
  {title:"Wordsmith",description:"Solve a Word Scramble.",icon:"⌁",test:() => Number(localStorage.getItem("hopeWordWins") || 0) >= 1},
  {title:"Unbeatable?",description:"Win 5 rounds of Rock Paper Scissors.",icon:"✊",test:() => Number(localStorage.getItem("hopeRpsWins") || 0) >= 5},
  {title:"Tile Tactician",description:"Reach 128 in 2048 Mini.",icon:"▦",test:() => Number(localStorage.getItem("hope2048Best") || 0) >= 128}
);

// Word Scramble
const scrambleWords = ["GALAXY","DRAGON","SHADOW","LEGEND","CASTLE","ROCKET","PUZZLE","WIZARD","PHOENIX","MYSTIC"];
let activeScramble = null, scrambleSolved = false;
function startWordGame() {
  activeScramble = scrambleWords[Math.floor(Math.random()*scrambleWords.length)];
  let letters = activeScramble.split("");
  do { letters.sort(() => Math.random()-.5); } while (letters.join("") === activeScramble);
  scrambleSolved = false;
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 006</p><h2>Word Scramble</h2>
    <p class="subtitle">Put the letters back in the right order.</p>
    <div class="word-letters">${letters.map(letter=>`<span class="word-letter">${letter}</span>`).join("")}</div>
    <input id="word-answer" maxlength="12" placeholder="Type the word..." autocomplete="off" style="text-transform:uppercase">
    <button class="primary-btn game-action" onclick="checkWordAnswer()">Submit word</button>
    <p class="arcade-message" id="word-message" aria-live="polite">Hint: ${activeScramble.length} letters. Take your time.</p>
    <button class="text-btn game-action" onclick="startWordGame()">New word ↻</button>`;
  document.getElementById("word-answer").focus();
  document.getElementById("word-answer").addEventListener("keydown", e=>{if(e.key==="Enter")checkWordAnswer()});
}
function checkWordAnswer() {
  const input = document.getElementById("word-answer");
  const message = document.getElementById("word-message");
  if (!input || !message || scrambleSolved) return;
  if (input.value.trim().toUpperCase() === activeScramble) {
    scrambleSolved = true;
    message.textContent = `That's it! ${activeScramble} — brilliant! +25 XP`;
    input.disabled = true;
    localStorage.setItem("hopeWordWins", Number(localStorage.getItem("hopeWordWins")||0)+1);
    recordGamePlayed(100);
    renderAchievements();
  } else message.textContent = "Not quite. Rearrange the letters and try again.";
}

// Rock Paper Scissors
let rpsScore = {wins:0, losses:0, draws:0};
function startRPS() {
  rpsScore = {wins:0,losses:0,draws:0};
  document.getElementById("other-game").innerHTML = `
    <p class="eyebrow">HOPE ARCADE / 007</p><h2>Rock Paper Scissors</h2>
    <p class="subtitle">Choose your move. First to 3 wins takes the match.</p>
    <div class="rps-choices">
      <button class="rps-choice" onclick="playRPS('rock')" aria-label="Rock">✊</button>
      <button class="rps-choice" onclick="playRPS('paper')" aria-label="Paper">✋</button>
      <button class="rps-choice" onclick="playRPS('scissors')" aria-label="Scissors">✌️</button>
    </div>
    <p class="arcade-message" id="rps-message" aria-live="polite">Make your move!</p>
    <div class="rps-score"><span>You <strong id="rps-player">0</strong></span><span>CPU <strong id="rps-cpu">0</strong></span><span>Draws <strong id="rps-draws">0</strong></span></div>
    <button class="text-btn game-action" onclick="startRPS()">Restart match ↻</button>`;
}
function playRPS(choice) {
  if (rpsScore.wins>=3 || rpsScore.losses>=3) return;
  const options=["rock","paper","scissors"];
  const cpu=options[Math.floor(Math.random()*3)];
  const icons={rock:"✊",paper:"✋",scissors:"✌️"};
  let result="draw";
  if(choice!==cpu) result=({rock:"scissors",paper:"rock",scissors:"paper"}[choice]===cpu)?"win":"loss";
  if(result==="win")rpsScore.wins++; else if(result==="loss")rpsScore.losses++; else rpsScore.draws++;
  const message=document.getElementById("rps-message");
  if(message) message.textContent=`You ${icons[choice]} · CPU ${icons[cpu]} — ${result==="win"?"You win this round!":result==="loss"?"CPU wins this round.":"It's a draw!"}`;
  document.getElementById("rps-player").textContent=rpsScore.wins;
  document.getElementById("rps-cpu").textContent=rpsScore.losses;
  document.getElementById("rps-draws").textContent=rpsScore.draws;
  if(rpsScore.wins===3 || rpsScore.losses===3) {
    if(rpsScore.wins===3) {
      localStorage.setItem("hopeRpsWins",Number(localStorage.getItem("hopeRpsWins")||0)+1);
      recordGamePlayed(100);
      message.textContent="Match won! You're the champion. +25 XP";
    } else message.textContent="CPU takes the match. Run it back!";
    renderAchievements();
  }
}

// 2048 Mini
let tileBoard = [];
let tileGameActive = false;
function spawnTile() {
  const empty=[];
  tileBoard.forEach((value,index)=>{if(!value)empty.push(index)});
  if(!empty.length)return;
  const index=empty[Math.floor(Math.random()*empty.length)];
  tileBoard[index]=Math.random()<.9?2:4;
}
function draw2048() {
  const board=document.getElementById("tile-board");
  if(!board)return;
  board.innerHTML=tileBoard.map(value=>`<div class="tile-cell ${value?"filled":""}" data-value="${value||0}">${value||""}</div>`).join("");
}
function start2048() {
  tileGameActive = true;
  tileBoard=Array(16).fill(0);spawnTile();spawnTile();
  document.getElementById("other-game").innerHTML=`
    <p class="eyebrow">HOPE ARCADE / 008</p><h2>2048 Mini</h2>
    <p class="subtitle">Use arrow keys or swipe to combine matching tiles.</p>
    <div class="tile-board" id="tile-board" tabindex="0" aria-label="2048 game board"></div>
    <p class="arcade-message" id="tile-score">Best tile: 2</p>
    <p class="game-help">Desktop: arrow keys · Mobile: swipe the board</p>
    <button class="text-btn game-action" onclick="start2048()">New board ↻</button>`;
  draw2048();
  document.getElementById("tile-board").focus();
}
function move2048(direction) {
  if(!tileBoard.length)return;
  const old=tileBoard.slice();
  const lines=[];
  for(let i=0;i<4;i++){
    let indexes=[];
    for(let j=0;j<4;j++){
      const r=direction==="up"?j:direction==="down"?3-j:i;
      const c=direction==="left"?j:direction==="right"?3-j:i;
      indexes.push(r*4+c);
    }
    lines.push(indexes);
  }
  let merged=false;
  lines.forEach(indexes=>{
    const values=indexes.map(i=>tileBoard[i]).filter(Boolean);
    const next=[];
    for(let i=0;i<values.length;i++){
      if(values[i]===values[i+1]){next.push(values[i]*2);i++;merged=true}
      else next.push(values[i]);
    }
    while(next.length<4)next.push(0);
    indexes.forEach((index,i)=>tileBoard[index]=next[i]);
  });
  if(tileBoard.every((v,i)=>v===old[i]))return;
  spawnTile();
  const best=Math.max(...tileBoard);
  const previous=Number(localStorage.getItem("hope2048Best")||0);
  if(best>previous)localStorage.setItem("hope2048Best",best);
  draw2048();
  document.getElementById("tile-score").textContent=`Best tile: ${best}`;
  if(best>=2048 && previous<2048) {recordGamePlayed(100);document.getElementById("tile-score").textContent="2048! You made it! +25 XP";}
  else if(best>=128 && previous<128)renderAchievements();
}
document.addEventListener("keydown",event=>{
  if(!document.getElementById("game-modal").classList.contains("show") || !tileGameActive)return;
  const map={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
  if(map[event.key] && tileBoard.length){event.preventDefault();move2048(map[event.key]);}
});
let tileTouch=null;
document.addEventListener("touchstart",event=>{
  const board=event.target.closest("#tile-board");
  if(board)tileTouch={x:event.touches[0].clientX,y:event.touches[0].clientY};
},{passive:true});
document.addEventListener("touchend",event=>{
  if(!tileTouch)return;
  const dx=event.changedTouches[0].clientX-tileTouch.x,dy=event.changedTouches[0].clientY-tileTouch.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))>25)move2048(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up"));
  tileTouch=null;
},{passive:true});

// Route all added games through the existing game modal.
const openGameV16 = openGame;
openGame = function(game) {
  const starts={word:startWordGame,rps:startRPS,"2048":start2048};
  tileGameActive = game === "2048";
  if(starts[game]) {
    document.getElementById("game-modal").classList.add("show");
    document.getElementById("number-game").style.display="none";
    document.getElementById("other-game").style.display="block";
    starts[game]();
    return;
  }
  openGameV16(game);
};

// Small quality-of-life improvements: keyboard close, modal focus and live player card.
document.getElementById("profile-modal").addEventListener("click",event=>{
  if(event.target.id==="profile-modal")closeProfile();
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){closeProfile();closeGame();closeSettings();}
});
const oldRefreshStatsV16 = refreshStatistics;
refreshStatistics = function() {
  oldRefreshStatsV16();
  renderPlayerCard();
};
renderPlayerCard();
updateAvatarPreview();
paintAvatar(document.getElementById("profile-avatar"));


/* =========================
   HOPE v1.7 — Anime Character Creator
   Layered SVG character generator with saved customization.
   ========================= */
const characterDefaults = {
  name:"Your character", presentation:"feminine", skin:"#f2c6a5",
  height:1, build:1, hair:"long", hairColor:"#30243e", hairHighlight:"#b69aff",
  eyes:"#73c8e8", eyeStyle:"anime", expression:"smile",
  outfit:"academy", outfitColor:"#6652a0", outfitTrim:"#f2c6a5",
  accessory:"none", background:"violet"
};
let characterDesign = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem("hopeCharacter") || "null");
    return saved && typeof saved === "object" ? {...characterDefaults,...saved} : {...characterDefaults};
  } catch { return {...characterDefaults}; }
})();
let activeCharacterTab = "body";

const characterPalettes = {
  skin:["#f8dfc7","#f2c6a5","#d99d78","#b97855","#8c563f","#59392f"],
  hair:["#211a2b","#30243e","#68422f","#b77b48","#e8c77d","#f0e9dc","#d96b83","#8f78d8","#5d9cc8","#72b99a"],
  highlight:["#ffffff","#d7b5ff","#ffb6cc","#8edcf0","#f7d88a","#a5e2bd","#f1a06e","#8d8d9c"],
  eyes:["#4d7cdb","#73c8e8","#61b68d","#9a78d6","#8d594d","#c58a3c","#d96b91","#46506d"],
  outfit:["#252b49","#6652a0","#a84f70","#315f70","#49754f","#b46b3d","#d0a84f","#e6e2ed","#25252d","#b6a2d8"],
  trim:["#f2c6a5","#f5e6c8","#b69aff","#f18bb5","#71c9d9","#e9c46a","#343441","#ffffff"]
};
const characterOptionData = {
  hair:[
    ["long","Long flow","〰","Long layered hair"],["short","Short cut","✂","Clean and simple"],
    ["twin","Twin tails","♧","Playful twin tails"],["bob","Soft bob","◒","Rounded bob cut"],
    ["spiky","Spiky","⚡","Sharp anime spikes"],["ponytail","Ponytail","⌁","High ponytail"],
    ["wavy","Wavy","∿","Soft wavy hair"],["bun","Double buns","✿","Cute twin buns"]
  ],
  eyeStyle:[["anime","Classic anime","◉","Large expressive eyes"],["soft","Soft eyes","♡","Gentle rounded eyes"],["sharp","Sharp eyes","⌁","Focused narrow eyes"],["sparkle","Starry eyes","✦","Extra sparkle"]],
  expression:[["smile","Smile","☺","Warm and friendly"],["neutral","Neutral","•","Calm expression"],["confident","Confident","⌁","One-sided smirk"],["happy","Happy","✧","Bright cheerful look"]],
  outfit:[
    ["academy","Academy uniform","🎓","Blazer, shirt and tie"],
    ["white-shirt","White shirt","♧","Crisp shirt and dark trousers"],
    ["black-suit","Black suit","♜","Sharp formal anime look"],
    ["tie-shirt","Shirt & tie","⌁","Rolled sleeves and loose tie"],
    ["hoodie","Oversized hoodie","🧥","Relaxed street style"],
    ["street","Streetwear","🧢","Layered modern fit"],
    ["fantasy","Fantasy robe","✦","Mystic adventurer"],
    ["battle","Battle outfit","⚔","Anime action style"],
    ["dress","Elegant dress","✿","Flowing feminine look"],
    ["suit","Tailored suit","♜","Clean formal style"],
    ["sweater","Cozy sweater","☁","Soft everyday outfit"],
    ["kimono","Modern kimono","🌸","Traditional-inspired layers"],
    ["techwear","Techwear","⌁","Futuristic utility look"],
    ["sailor","Sailor uniform","⚓","Classic anime school style"],
    ["gothic","Gothic outfit","✦","Dark romantic details"],
    ["bomber","Bomber jacket","▣","Sporty layered jacket"],
    ["longcoat","Long coat","♜","Flowing tailored outerwear"],
    ["magical","Magical hero","✧","Fantasy-inspired hero look"]
  ],
  accessory:[
    ["none","None","○","Keep it clean"],["glasses","Glasses","◉","Round glasses"],
    ["headphones","Headphones","♫","Over-ear headphones"],["crown","Crown","♛","A little royalty"],
    ["hairclip","Hair clip","✦","Decorative hair clip"],["earrings","Earrings","◇","Small earrings"],
    ["scarf","Scarf","〰","Soft scarf detail"],["halo","Halo","☼","Floating halo"]
  ],
  background:[
    ["violet","Dream violet","✧","Soft purple glow"],["sakura","Sakura","🌸","Pink blossom mood"],
    ["ocean","Ocean blue","≈","Cool blue atmosphere"],["forest","Forest","❋","Calm green world"],
    ["sunset","Sunset","☼","Warm dusk colors"],["night","Midnight","☾","Deep night sky"],
    ["studio","Studio","▦","Clean graphic backdrop"]
  ]
};
const characterLabels = {
  height:["Petite","Average","Tall"], build:["Slim","Average","Broad"]
};
function characterSvg(d, mini=false) {
  const skin=d.skin||"#f2c6a5", hair=d.hairColor||"#30243e";
  const shine=d.hairHighlight||"#b69aff", eye=d.eyes||"#73c8e8";
  const main=d.outfitColor||"#6652a0", trim=d.outfitTrim||"#f2c6a5";
  const feminine=d.presentation==="feminine", masculine=d.presentation==="masculine";
  const eyeScale=[.84,1,1.18][Number(d.eyeSize??1)]||1;
  const faceShape=Number(d.faceShape??1);
  const faceW=[66,72,76][faceShape]||72;
  const jawW=[49,57,63][faceShape]||57;
  const hairStyle=d.hair||"long", outfit=d.outfit||"academy";
  const id="hope32"+Math.random().toString(36).slice(2,8);
  const ink="#302a31", inkSoft="#59444a";
  const shoulder=masculine?98:feminine?82:90;
  const waist=feminine?57:masculine?69:63;
  const hip=feminine?82:masculine?72:77;
  const legGap=masculine?12:9;
  const mouth=d.expression==="neutral"?"M171 218 Q180 219 190 218":
    d.expression==="confident"?"M170 215 Q184 224 199 210":
    d.expression==="happy"?"M168 211 Q184 240 201 211":"M170 214 Q184 230 199 214";
  const faceBottom=faceShape===0?255:faceShape===2?269:264;

  const hairBack={
    long:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 C281 211 269 284 258 355 Q251 379 236 361 L232 218 L128 218 L119 357 Q102 381 94 350 C82 274 91 206 119 151Z"/>`,
    short:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 L266 245 Q250 269 237 220 L128 220 L113 252Z"/>`,
    twin:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 L266 245 L237 220 L128 220 L113 252Z"/><path d="M116 133 Q72 149 78 275 Q80 348 104 365 Q126 344 128 258 L138 182Z M255 133 Q299 149 293 275 Q291 348 267 365 Q245 344 243 258 L232 182Z"/>`,
    bob:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 L267 259 Q249 286 232 219 L128 219 Q117 282 94 259Z"/>`,
    spiky:`<path d="M116 151 L98 84 L146 119 L136 47 L180 101 L220 37 L225 107 L282 72 L267 160 L252 224 L235 180 L128 180 L113 230Z"/>`,
    ponytail:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 L266 245 L237 220 L128 220 L113 252Z"/><path d="M252 120 Q321 135 312 267 Q309 341 275 373 Q282 290 247 208Z"/>`,
    wavy:`<path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 Q296 193 270 233 Q294 279 265 350 Q245 383 228 307 L232 219 L128 219 Q130 307 104 354 Q78 339 86 267 Q91 197 119 151Z"/>`,
    bun:`<circle cx="119" cy="76" r="33"/><circle cx="252" cy="76" r="33"/><path d="M119 151 C101 92 119 43 180 42 C244 40 272 83 274 147 L266 245 L237 220 L128 220 L113 252Z"/>`
  }[hairStyle]||"";

  const eyeY=176, irisY=177;
  const eyeMarkup=d.eyeStyle==="sharp"
    ? `<path d="M132 176 Q155 151 180 174 Q157 192 132 176Z M200 174 Q225 151 248 176 Q223 192 200 174Z" fill="#fffaf6" stroke="${ink}" stroke-width="2.8"/><ellipse cx="158" cy="175" rx="${8*eyeScale}" ry="${12*eyeScale}" fill="${eye}"/><ellipse cx="222" cy="175" rx="${8*eyeScale}" ry="${12*eyeScale}" fill="${eye}"/><ellipse cx="159" cy="177" rx="4" ry="8" fill="#211e28"/><ellipse cx="223" cy="177" rx="4" ry="8" fill="#211e28"/>`
    : `<path d="M132 176 Q155 150 180 176 Q156 199 132 176Z M200 176 Q225 150 248 176 Q224 199 200 176Z" fill="#fffaf6" stroke="${ink}" stroke-width="2.8"/><ellipse cx="158" cy="${irisY}" rx="${9*eyeScale}" ry="${13*eyeScale}" fill="${eye}"/><ellipse cx="222" cy="${irisY}" rx="${9*eyeScale}" ry="${13*eyeScale}" fill="${eye}"/><ellipse cx="159" cy="179" rx="${4.5*eyeScale}" ry="${8*eyeScale}" fill="#211e28"/><ellipse cx="223" cy="179" rx="${4.5*eyeScale}" ry="${8*eyeScale}" fill="#211e28"/><circle cx="162" cy="169" r="4.5" fill="#fff"/><circle cx="226" cy="169" r="4.5" fill="#fff"/><circle cx="153" cy="184" r="2.2" fill="#fff" opacity=".8"/><circle cx="217" cy="184" r="2.2" fill="#fff" opacity=".8"/>`;
  const brows=`<path d="M137 153 Q156 143 177 153 M203 153 Q225 143 244 153" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const fringe=hairStyle==="spiky"
    ? `<path d="M112 151 L104 89 L148 121 L138 65 L180 111 L216 48 L226 116 L270 83 L267 154 Q240 128 220 142 Q188 154 174 134 Q145 153 120 141Z" fill="url(#${id}hair)" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`
    : `<path d="M111 151 C109 85 134 52 181 49 C229 47 265 86 275 148 Q247 120 228 128 Q205 144 183 122 Q155 148 132 129Z" fill="url(#${id}hair)" stroke="${ink}" stroke-width="3"/>`;
  const hairStrands=`
    <path d="M129 111 Q149 68 174 65 M159 101 Q182 65 202 65 M203 102 Q225 70 239 93" fill="none" stroke="${shine}" stroke-width="5" opacity=".72" stroke-linecap="round"/>
    <path d="M118 153 Q112 203 119 259 M260 153 Q269 205 259 262" fill="none" stroke="${shine}" stroke-width="2.4" opacity=".38"/>`;

  const neck=`<path d="M166 244 L166 282 Q180 295 194 282 L194 244Z" fill="url(#${id}skin)" stroke="${ink}" stroke-width="2.4"/>`;
  const bodyBase=`<path d="M${180-shoulder+13} 286 Q180 270 ${180-shoulder+29} 274 L180 298 L${180+shoulder-29} 274 Q180 270 ${180+shoulder-13} 286 L${180+waist} 403 Q180 426 ${180-waist} 403Z" fill="url(#${id}cloth)" stroke="${ink}" stroke-width="3.4" stroke-linejoin="round"/>`;
  const arms=`
    <path d="M${180-shoulder+15} 291 Q${180-shoulder-3} 331 ${180-shoulder+1} 385" fill="none" stroke="${skin}" stroke-width="23" stroke-linecap="round"/>
    <path d="M${180+shoulder-15} 291 Q${180+shoulder+3} 331 ${180+shoulder-1} 385" fill="none" stroke="${skin}" stroke-width="23" stroke-linecap="round"/>
    <path d="M${180-shoulder+15} 291 Q${180-shoulder-3} 331 ${180-shoulder+1} 385 M${180+shoulder-15} 291 Q${180+shoulder+3} 331 ${180+shoulder-1} 385" fill="none" stroke="${ink}" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M${180-shoulder+1} 385 q-7 13 2 22 q10 3 13-8 M${180+shoulder-1} 385 q7 13-2 22 q-10 3-13-8" fill="${skin}" stroke="${ink}" stroke-width="2"/>`;
  const legs=`
    <path d="M${180-hip+5} 402 L180 402 L174 485 L136 485 L143 412Z" fill="#292831" stroke="${ink}" stroke-width="3"/>
    <path d="M180 402 L${180+hip-5} 402 L217 412 L224 485 L186 485Z" fill="#292831" stroke="${ink}" stroke-width="3"/>
    <path d="M136 480 L175 480 L175 503 L128 503 Q127 491 136 480Z M185 480 L224 480 Q233 491 232 503 L185 503Z" fill="#201f27" stroke="${ink}" stroke-width="3"/>
    <path d="M140 490 L169 490 M191 490 L220 490" stroke="#a59a9a" stroke-width="2"/>`;

  let outfitMarkup="";
  if(["academy","white-shirt","black-suit","tie-shirt","suit","sailor","gothic","bomber","longcoat","techwear","street","battle","magical"].includes(outfit)){
    const isJacket=["academy","black-suit","suit","gothic","bomber","longcoat","techwear","battle","magical"].includes(outfit);
    outfitMarkup=`
      ${bodyBase}
      <path d="M180 298 L157 329 L180 369 L203 329Z" fill="#f5f0e7" stroke="${ink}" stroke-width="2.4"/>
      ${isJacket?`<path d="M${180-shoulder+14} 286 L157 329 L180 369 L171 302Z M${180+shoulder-14} 286 L203 329 L180 369 L189 302Z" fill="url(#${id}cloth)" stroke="${ink}" stroke-width="3"/>`:""}
      ${["academy","tie-shirt","sailor"].includes(outfit)?`<path d="M174 309 L186 309 L183 358 L177 358Z" fill="${trim}" stroke="${ink}" stroke-width="1.5"/><path d="M180 309 L180 358" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>`:""}
      ${outfit==="sailor"?`<path d="M145 284 L180 318 L215 284 L205 310 L180 333 L155 310Z" fill="${trim}" stroke="${ink}" stroke-width="2"/>`:""}
      ${outfit==="bomber"?`<path d="M105 310 Q180 326 255 310" stroke="${trim}" stroke-width="7" fill="none"/><path d="M139 284 L145 400 M221 284 L215 400" stroke="${trim}" stroke-width="3"/>`:""}
      ${outfit==="longcoat"?`<path d="M135 300 L122 478 L159 464 L180 370 L201 464 L238 478 L225 300" fill="${main}" stroke="${ink}" stroke-width="3"/><path d="M180 370 L180 465" stroke="${trim}" stroke-width="4"/>`:""}
      ${outfit==="gothic"?`<path d="M144 290 L180 319 L216 290 L207 310 L180 337 L153 310Z" fill="${trim}" stroke="${ink}" stroke-width="2"/><path d="M145 386 Q180 402 215 386" stroke="${trim}" stroke-width="3" fill="none"/>`:""}
      <path d="M180 369 L180 404" stroke="${ink}" stroke-width="2"/>`;
  } else if(outfit==="dress"||outfit==="kimono"||outfit==="fantasy"||outfit==="magical"){
    outfitMarkup=`
      <path d="M${180-shoulder+12} 286 L180 300 L${180+shoulder-12} 286 L${180+hip+35} 466 Q180 481 ${180-hip-35} 466Z" fill="url(#${id}cloth)" stroke="${ink}" stroke-width="3.5"/>
      <path d="M180 301 L151 420 L180 466 L209 420Z" fill="${trim}" opacity=".94" stroke="${ink}" stroke-width="1.5"/>
      <path d="M143 386 Q180 403 217 386" stroke="${trim}" stroke-width="4" fill="none"/>
      ${outfit==="kimono"?`<path d="M140 291 L180 328 L220 291 L205 318 L180 347 L155 318Z" fill="${main}" stroke="${ink}" stroke-width="2.5"/>`:""}
      ${outfit==="fantasy"||outfit==="magical"?`<path d="M180 315 L188 335 L210 338 L193 352 L198 374 L180 362 L162 374 L167 352 L150 338 L172 335Z" fill="${trim}" stroke="${ink}" stroke-width="1.5"/>`:""}`;
  } else if(outfit==="hoodie"||outfit==="sweater"){
    outfitMarkup=`
      <path d="M${180-shoulder+12} 286 Q180 265 ${180-shoulder+30} 275 L180 302 L${180+shoulder-30} 275 Q180 265 ${180+shoulder-12} 286 L${180+hip} 411 L${180-hip} 411Z" fill="url(#${id}cloth)" stroke="${ink}" stroke-width="3.5"/>
      <path d="M145 286 Q180 324 215 286" fill="none" stroke="${trim}" stroke-width="6"/>
      <path d="M171 306 L169 354 M189 306 L191 354" stroke="${trim}" stroke-width="2.5"/>`;
  } else {
    outfitMarkup=bodyBase;
  }

  if(outfit==="dress"||outfit==="kimono"||outfit==="fantasy"||outfit==="magical"){
    // Dress silhouettes replace trousers with a clean flowing hem and visible shoes.
    outfitMarkup+=`<path d="M142 458 Q180 470 218 458 L213 485 L147 485Z" fill="#292831" stroke="${ink}" stroke-width="2.5"/><path d="M146 481 L175 481 L175 503 L128 503 Q128 490 146 481Z M185 481 L214 481 Q232 490 232 503 L185 503Z" fill="#201f27" stroke="${ink}" stroke-width="2.5"/>`;
  } else if(feminine&&outfit==="academy"){
    outfitMarkup+=`<path d="M${180-hip+7} 399 L${180+hip-7} 399 L${180+hip+20} 460 Q180 474 ${180-hip-20} 460Z" fill="url(#${id}cloth)" stroke="${ink}" stroke-width="3"/><path d="M143 433 L217 433 M140 445 L220 445" stroke="${trim}" stroke-width="2.2"/>`;
  } else {
    outfitMarkup+=legs;
  }

  let accessory="";
  if(d.accessory==="glasses")accessory=`<g fill="none" stroke="${ink}" stroke-width="3"><circle cx="158" cy="176" r="17"/><circle cx="222" cy="176" r="17"/><path d="M175 176 L205 176"/></g>`;
  if(d.accessory==="headphones")accessory=`<path d="M107 175 Q105 67 180 64 Q255 67 273 175" fill="none" stroke="${trim}" stroke-width="10"/><rect x="99" y="157" width="21" height="53" rx="8" fill="${main}" stroke="${ink}" stroke-width="3"/><rect x="260" y="157" width="21" height="53" rx="8" fill="${main}" stroke="${ink}" stroke-width="3"/>`;
  if(d.accessory==="crown")accessory=`<path d="M143 96 L135 58 L162 82 L180 45 L200 82 L226 58 L218 98Z" fill="#e9c46a" stroke="${ink}" stroke-width="3"/>`;
  if(d.accessory==="hairclip")accessory=`<path d="M229 118 L251 96" stroke="${trim}" stroke-width="8" stroke-linecap="round"/><circle cx="251" cy="96" r="6" fill="#fff"/>`;
  if(d.accessory==="earrings")accessory=`<path d="M114 207 L114 226 M266 207 L266 226" stroke="#d4ae68" stroke-width="3"/><circle cx="114" cy="229" r="4" fill="#d4ae68"/><circle cx="266" cy="229" r="4" fill="#d4ae68"/>`;
  if(d.accessory==="scarf")accessory=`<path d="M147 276 Q180 307 213 276 L203 315 Q180 330 157 315Z" fill="${trim}" stroke="${ink}" stroke-width="2"/>`;
  if(d.accessory==="halo")accessory=`<ellipse cx="180" cy="29" rx="48" ry="10" fill="none" stroke="#d5b86a" stroke-width="5"/>`;

  const hScale=[.95,1,1.05][Number(d.height)||1];
  const bodyScale=[.96,1,1.05][Number(d.build)||1];
  return `<svg viewBox="0 0 360 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Custom anime character" class="hope-anime-art">
    <defs>
      <linearGradient id="${id}hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shine}"/><stop offset=".34" stop-color="${hair}"/><stop offset="1" stop-color="#17151e"/></linearGradient>
      <linearGradient id="${id}skin" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff" stop-opacity=".2"/><stop offset=".48" stop-color="${skin}"/><stop offset="1" stop-color="#8d5d55" stop-opacity=".2"/></linearGradient>
      <linearGradient id="${id}cloth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".2"/><stop offset=".52" stop-color="${main}"/><stop offset="1" stop-color="#17151d" stop-opacity=".32"/></linearGradient>
      <filter id="${id}shadow" x="-30%" y="-20%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <ellipse cx="180" cy="514" rx="105" ry="8" fill="#443b39" opacity=".1"/>
    <g transform="translate(180 0) scale(${bodyScale} ${hScale}) translate(-180 0)">
      <g fill="url(#${id}hair)" stroke="${ink}" stroke-width="2.7" stroke-linejoin="round">${hairBack}</g>
      ${neck}
      <path d="M180 97 C${180-faceW} 97 ${180-faceW-5} 133 ${180-faceW-3} 179 C${180-faceW} 225 ${180-jawW} ${faceBottom-8} 180 ${faceBottom} C${180+jawW} ${faceBottom-8} ${180+faceW} 225 ${180+faceW+3} 179 C${180+faceW+5} 133 ${180+faceW} 97 180 97Z" fill="url(#${id}skin)" stroke="${ink}" stroke-width="3"/>
      <path d="M127 145 Q143 113 174 112" stroke="#fff" stroke-opacity=".22" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${brows}
      ${eyeMarkup}
      <path d="M180 190 Q176 203 178 207" stroke="#a56d62" stroke-width="2" opacity=".65" fill="none" stroke-linecap="round"/>
      <path d="M176 207 Q180 210 184 207" stroke="#9d675f" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="${mouth}" stroke="#914f59" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="139" cy="211" rx="14" ry="7" fill="#e58c96" opacity=".24"/><ellipse cx="221" cy="211" rx="14" ry="7" fill="#e58c96" opacity=".24"/>
      <path d="M119 159 Q111 196 120 244 M241 159 Q249 196 240 244" fill="none" stroke="#9d6c60" stroke-opacity=".2" stroke-width="2"/>
      <g fill="url(#${id}hair)" stroke="${ink}" stroke-width="2.8" stroke-linejoin="round">${fringe}</g>
      ${hairStrands}
      ${accessory}
      ${arms}
      ${outfitMarkup}
      <path d="M180 303 L180 405" stroke="#fff" stroke-opacity=".13" stroke-width="2"/>
    </g>
  </svg>`;
}

function renderCharacter() {
  const render = document.getElementById("character-render");
  const mini = document.getElementById("character-mini-render");
  const scene = document.getElementById("character-scene");
  const name = (characterDesign.name || "Your character").trim().slice(0,24);
  // The Character Studio now uses a fully local 2D anime illustration.
  if (render) render.innerHTML = characterSvg(characterDesign,false);
  if (mini) mini.innerHTML = characterSvg(characterDesign,true);
  if (scene) scene.dataset.background = characterDesign.background;
  const title = document.getElementById("character-preview-name");
  const style = document.getElementById("character-preview-style");
  if (title) title.textContent = name || "Your character";
  if (style) style.textContent = `${characterDesign.presentation.toUpperCase()} · ANIME AVATAR`;
  const nameInput = document.getElementById("character-name-input");
  if (nameInput && document.activeElement !== nameInput) nameInput.value = characterDesign.name;
  document.querySelectorAll("[data-char-field]").forEach(button => {
    button.classList.toggle("selected", characterDesign[button.dataset.charField] === button.dataset.charValue);
  });
  ["height","build"].forEach(field => {
    const slider = document.getElementById(`char-${field}`);
    const label = document.getElementById(`char-${field}-value`);
    if (slider && document.activeElement !== slider) slider.value = characterDesign[field];
    if (label) label.textContent = characterLabels[field][Number(characterDesign[field])];
  });
  renderCharacterProfileIcon();
  // 2D SVG renderer updates immediately; no external 3D engine is required.
}
function renderCharacterProfileIcon() {
  const icon = document.getElementById("profile-avatar");
  if (!icon) return;
  const mini = document.getElementById("character-mini-render");
  if (characterDesign && characterDesign.name) {
    icon.innerHTML = characterSvg(characterDesign,true);
    icon.classList.add("avatar-character");
  }
}
function renderSwatches(id, palette, field) {
  const target = document.getElementById(id);
  if (!target) return;
  target.innerHTML = characterPalettes[palette].map(color =>
    `<button class="character-swatch ${characterDesign[field]===color?"selected":""}" style="background:${color}" data-char-field="${field}" data-char-value="${color}" aria-label="${color}"></button>`
  ).join("");
}
function renderOptions(id, type, field) {
  const target = document.getElementById(id);
  if (!target) return;
  target.innerHTML = characterOptionData[type].map(([value,label,icon,description]) =>
    `<button class="character-option ${characterDesign[field]===value?"selected":""}" data-char-field="${field}" data-char-value="${value}"><span>${icon}</span><strong>${label}</strong><small>${description}</small></button>`
  ).join("");
}
function buildCharacterControls() {
  renderSwatches("skin-swatches","skin","skin");
  renderSwatches("hair-color-swatches","hair","hairColor");
  renderSwatches("hair-highlight-swatches","highlight","hairHighlight");
  renderSwatches("eye-color-swatches","eyes","eyes");
  renderSwatches("outfit-color-swatches","outfit","outfitColor");
  renderSwatches("outfit-trim-swatches","trim","outfitTrim");
  renderOptions("hair-style-options","hair","hair");
  renderOptions("eye-style-options","eyeStyle","eyeStyle");
  renderOptions("expression-options","expression","expression");
  renderOptions("outfit-options","outfit","outfit");
  renderOptions("accessory-options","accessory","accessory");
  renderOptions("background-options","background","background");
  renderCharacter();
}
function showCharacterTab(tab) {
  activeCharacterTab = tab;
  document.querySelectorAll(".character-tab").forEach(button => button.classList.toggle("active",button.dataset.characterTab===tab));
  document.querySelectorAll(".character-panel").forEach(panel => panel.classList.toggle("active",panel.id===`character-panel-${tab}`));
  const count = ["body","hair","face","outfit","extras"].indexOf(tab)+1;
  const countLabel = document.getElementById("character-control-count");
  if (countLabel) countLabel.textContent = `${String(count).padStart(2,"0")} — 05`;
}
document.addEventListener("click",event=>{
  const choice=event.target.closest("[data-char-field]");
  if(!choice)return;
  const field=choice.dataset.charField;
  if(!Object.prototype.hasOwnProperty.call(characterDefaults,field))return;
  characterDesign[field]=choice.dataset.charValue;
  setCharacterDirty();
  document.querySelectorAll(`[data-char-field="${field}"]`).forEach(button=>button.classList.toggle("selected",button===choice));
  renderCharacter();
});
["height","build"].forEach(field=>{
  document.getElementById(`char-${field}`)?.addEventListener("input",event=>{
    characterDesign[field]=Number(event.target.value);
    setCharacterDirty();
    renderCharacter();
  });
});
document.getElementById("character-name-input")?.addEventListener("input",event=>{
  characterDesign.name=event.target.value.slice(0,24);
  setCharacterDirty();
  renderCharacter();
});
function saveCharacter() {
  characterDesign.name=(document.getElementById("character-name-input")?.value||characterDesign.name||"Your character").trim().slice(0,24)||"Your character";
  localStorage.setItem("hopeCharacter",JSON.stringify(characterDesign));
  const note=document.getElementById("character-save-note");
  if(note)note.textContent="✓ Character saved! Your design will be here next time you open HOPE.";
  const status=document.querySelector(".mini-status"); if(status)status.textContent="SAVED";
  renderCharacter();
  playSound(660,.08);
}
function resetCharacter() {
  characterDesign={...characterDefaults};
  buildCharacterControls();
  const note=document.getElementById("character-save-note");
  if(note)note.textContent="Default character restored. Save it to keep this design.";
}
function randomizeCharacter() {
  const pick=(items)=>items[Math.floor(Math.random()*items.length)];
  characterDesign={
    ...characterDesign,
    presentation:pick(["feminine","masculine","androgynous"]),
    skin:pick(characterPalettes.skin),height:Math.floor(Math.random()*3),build:Math.floor(Math.random()*3),
    hair:pick(characterOptionData.hair.map(item=>item[0])),hairColor:pick(characterPalettes.hair),
    hairHighlight:pick(characterPalettes.highlight),eyes:pick(characterPalettes.eyes),
    eyeStyle:pick(characterOptionData.eyeStyle.map(item=>item[0])),expression:pick(characterOptionData.expression.map(item=>item[0])),
    outfit:pick(characterOptionData.outfit.map(item=>item[0])),outfitColor:pick(characterPalettes.outfit),
    outfitTrim:pick(characterPalettes.trim),accessory:pick(characterOptionData.accessory.map(item=>item[0])),
    background:pick(characterOptionData.background.map(item=>item[0]))
  };
  buildCharacterControls();
  const note=document.getElementById("character-save-note");
  if(note)note.textContent="A new look generated! Tweak it or save it.";
}
buildCharacterControls();
showCharacterTab("body");


const updateStatsV17 = updateStats;
updateStats = function() {
  updateStatsV17();
  renderCharacterProfileIcon();
};


// Keep the full character illustration visible in every player identity surface.
const renderPlayerCardV17 = renderPlayerCard;
renderPlayerCard = function() {
  renderPlayerCardV17();
  const avatar = document.getElementById("player-card-avatar");
  if (avatar) {
    avatar.innerHTML = characterSvg(characterDesign, true);
    avatar.classList.add("avatar-character");
  }
};
renderPlayerCard();

function exportCharacterPNG() {
  const svgMarkup = characterSvg(characterDesign);
  const blob = new Blob([svgMarkup], {type:"image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 720; canvas.height = 1020;
    const context = canvas.getContext("2d");
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob(png => {
      if (!png) return;
      const downloadUrl = URL.createObjectURL(png);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${(characterDesign.name || "hope-character").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "hope-character"}.png`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
    },"image/png");
  };
  image.onerror = () => { URL.revokeObjectURL(url); const note=document.getElementById("character-save-note"); if(note)note.textContent="Couldn't export this design in this browser."; };
  image.src = url;
}

function setCharacterDirty() {
  const note=document.getElementById("character-save-note");
  if(note)note.textContent="Unsaved changes · Save your character to keep this design.";
  const status=document.querySelector(".mini-status"); if(status)status.textContent="UNSAVED";
}
const saveCharacterV17 = saveCharacter;
saveCharacter = function() {
  saveCharacterV17();
  renderPlayerCard();
};

/* HOPE v2.0 — 3D character studio bridge */
window.getHopeCharacterDesign = () => ({...characterDesign});

/* HOPE v3.0 — facial proportion controls */
const faceControlLabels = {
  eyeSize:["Small","Classic","Large"],
  faceShape:["Soft","Balanced","Angular"],
  noseSize:["Subtle","Soft","Defined"]
};
["eyeSize","faceShape","noseSize"].forEach(field=>{
  const input=document.getElementById(`char-${field.replace(/[A-Z]/g,m=>"-"+m.toLowerCase())}`);
  const label=document.getElementById(`char-${field.replace(/[A-Z]/g,m=>"-"+m.toLowerCase())}-value`);
  if(input){
    input.value=characterDesign[field] ?? 1;
    if(label)label.textContent=faceControlLabels[field][Number(input.value)];
    input.addEventListener("input",()=>{
      characterDesign[field]=Number(input.value);
      if(label)label.textContent=faceControlLabels[field][Number(input.value)];
      renderCharacter();
      setCharacterDirty();
    });
  }
});


/* ============================================================
   HOPE v4.0 — PREMIUM GAMING UNIVERSE
   Library states, player profile, achievements, data backup.
   ============================================================ */

const hopeV4Storage = {
  statuses: "hopeGameStatuses",
  title: "hopePlayerTitle",
  banner: "hopeProfileBanner"
};
let hopeGameStatuses = {};
try { hopeGameStatuses = JSON.parse(localStorage.getItem(hopeV4Storage.statuses) || "{}") || {}; }
catch { hopeGameStatuses = {}; }
let hopePlayerTitle = localStorage.getItem(hopeV4Storage.title) || "The Wanderer";
let hopeProfileBanner = localStorage.getItem(hopeV4Storage.banner) || "#a78bfa";
let hopeLibraryFilter = "all";

function hopeStatus(name) { return hopeGameStatuses[name] || "backlog"; }
function hopeSetStatus(name, status) {
  if (!["backlog","playing","completed","wishlist"].includes(status)) return;
  hopeGameStatuses[name] = status;
  localStorage.setItem(hopeV4Storage.statuses, JSON.stringify(hopeGameStatuses));
  hopeLibraryFilter = status === "backlog" ? "all" : status;
  renderLibraryV4();
  renderHopeProfile();
  renderContinuePanel();
  renderAchievementSnapshot();
  if(document.getElementById("achievements")?.classList.contains("active"))renderAchievements();
  playSound(560,.05);
}
function hopeStatusLabel(status) {
  return ({backlog:"In collection",playing:"Currently playing",completed:"Completed",wishlist:"Wishlist"})[status] || "In collection";
}
function createGameCardV4(game) {
  const safeName=escapeHTML(game.name), safeDescription=escapeHTML(game.description), safeMode=escapeHTML(game.mode);
  const status=hopeStatus(game.name);
  const number=String(games.indexOf(game)+1).padStart(2,"0");
  const statusOptions=[["backlog","In collection"],["playing","Playing"],["completed","Completed"],["wishlist","Wishlist"]];
  return `<article class="game-card v4-game-card">
    <div class="game-art ${game.art}"><span>${game.custom?"✦":game.symbol}</span><small>${number}</small></div>
    <div class="game-info"><div class="game-category">${safeMode}</div><h3>${safeName}</h3><p>${safeDescription}</p>
      <div class="game-card-footer"><span class="status-pill status-${status}">${hopeStatusLabel(status)}</span>
      ${game.custom?'<span class="collection-saved">YOUR ADDITION</span>':'<button class="play-btn" onclick="navigateToArcade()">Explore →</button>'}</div>
      <label class="status-select-label">COLLECTION STATUS<select aria-label="Status for ${safeName}" data-game-name="${safeName}" onchange="hopeSetStatus(this.dataset.gameName,this.value)">${statusOptions.map(([v,l])=>`<option value="${v}" ${status===v?"selected":""}>${l}</option>`).join("")}</select></label>
    </div>
  </article>`;
}
function renderLibraryV4() {
  const query=(document.getElementById("library-search")?.value||"").toLowerCase().trim();
  let filtered=games.filter(game=>[game.name,game.description,game.mode].some(v=>String(v).toLowerCase().includes(query)));
  if(activeLibraryFilter==="favorites") filtered=filtered.filter(game=>favorites.includes(game.name));
  else if(activeLibraryFilter==="custom") filtered=filtered.filter(game=>game.custom);
  else if(["playing","completed","wishlist"].includes(activeLibraryFilter)) filtered=filtered.filter(game=>hopeStatus(game.name)===activeLibraryFilter);
  const target=document.getElementById("library-games");
  if(!target)return;
  target.innerHTML=filtered.map(createGameCardV4).join("");
  renderFavoriteButtons();
  document.getElementById("library-count").textContent=`${filtered.length} ${filtered.length===1?"GAME":"GAMES"}`;
  document.getElementById("empty-library").hidden=filtered.length!==0;
  document.querySelectorAll("[data-library-filter]").forEach(button=>button.classList.toggle("active",button.dataset.libraryFilter===activeLibraryFilter));
}
function setLibraryFilterV4(filter) {
  activeLibraryFilter=filter;
  renderLibraryV4();
}
setLibraryFilter=setLibraryFilterV4;
renderLibrary=renderLibraryV4;

function renderContinuePanel() {
  const target=document.getElementById("continue-panel");
  if(!target)return;
  const current=games.find(game=>hopeStatus(game.name)==="playing");
  const title=document.getElementById("continue-title");
  const desc=document.getElementById("continue-description");
  const action=document.getElementById("continue-action");
  if(current) {
    title.textContent=current.name;
    desc.textContent="Pick up where you left off. Your next session is waiting.";
    action.textContent="Open your arcade →";
    action.onclick=()=>navigate("arcade");
  } else {
    const wish=games.find(game=>hopeStatus(game.name)==="wishlist");
    title.textContent=wish?`On your wishlist: ${wish.name}`:"Your next adventure starts here.";
    desc.textContent=wish?"A game you've been thinking about. Move it to Playing when you're ready.":"Choose a game from your collection and make it yours.";
    action.textContent=wish?"Explore your wishlist →":"Explore your library →";
    action.onclick=()=>{activeLibraryFilter=wish?"wishlist":"all";navigate("library");renderLibraryV4();};
  }
}
function renderHopeProfile() {
  const page=document.getElementById("player");
  if(!page)return;
  const name=document.getElementById("profile-hero-name");
  const bio=document.getElementById("profile-hero-bio");
  const title=document.getElementById("profile-title-chip");
  const banner=document.getElementById("profile-banner");
  const avatar=document.getElementById("profile-hero-avatar");
  if(name)name.textContent=playerName;
  if(bio)bio.textContent=playerBio||"Your gaming space";
  if(title)title.textContent=hopePlayerTitle;
  if(banner)banner.style.setProperty("--profile-banner",hopeProfileBanner);
  if(avatar){avatar.textContent=playerAvatar||"🎮";avatar.style.setProperty("--avatar-accent",hopeProfileBanner);}
  const metric=document.getElementById("profile-metrics");
  if(metric)metric.innerHTML=[
    ["LEVEL",playerLevel()],["TOTAL XP",playerXP],["GAMES PLAYED",playedGames],["COLLECTION",games.length]
  ].map(([label,value])=>`<div class="profile-metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const achievementsTarget=document.getElementById("profile-achievements");
  if(achievementsTarget)achievementsTarget.innerHTML=achievements.filter(item=>item.test()).slice(0,4).map(item=>`<div class="achievement-chip"><div class="achievement-icon">${item.icon}</div><div><strong>${escapeHTML(item.title)}</strong><small>Unlocked</small></div></div>`).join("")||'<p class="empty-state">Your first milestone is waiting.</p>';
  const gamesTarget=document.getElementById("profile-games");
  if(gamesTarget) {
    const inProgress=games.filter(game=>hopeStatus(game.name)==="playing"||hopeStatus(game.name)==="wishlist").slice(0,3);
    gamesTarget.innerHTML=inProgress.map(createGameCardV4).join("")||'<p class="empty-state">Mark a game as Playing or Wishlist to feature it here.</p>';
    renderFavoriteButtons();
  }
}
function updateProfileUIV4() {
  const bannerInput=document.getElementById("profile-banner-color");
  if(bannerInput)bannerInput.value=hopeProfileBanner;
  const titleInput=document.getElementById("player-title");
  if(titleInput)titleInput.value=hopePlayerTitle;
  document.querySelectorAll("[data-banner-color]").forEach(button=>button.classList.toggle("selected",button.dataset.bannerColor===hopeProfileBanner));
  renderHopeProfile();
}
const editProfileV4=editProfile;
editProfile=function(){
  editProfileV4();
  const titleInput=document.getElementById("player-title");
  const bannerInput=document.getElementById("profile-banner-color");
  if(titleInput)titleInput.value=hopePlayerTitle;
  if(bannerInput)bannerInput.value=hopeProfileBanner;
  document.querySelectorAll("[data-banner-color]").forEach(button=>button.classList.toggle("selected",button.dataset.bannerColor===hopeProfileBanner));
};
const saveProfileV4=saveProfile;
saveProfile=function(){
  const titleInput=document.getElementById("player-title");
  const bannerInput=document.getElementById("profile-banner-color");
  const selectedTitle=titleInput?titleInput.value:hopePlayerTitle;
  const selectedBanner=bannerInput?bannerInput.value:hopeProfileBanner;
  saveProfileV4();
  hopePlayerTitle=selectedTitle;
  hopeProfileBanner=selectedBanner;
  localStorage.setItem(hopeV4Storage.title,hopePlayerTitle);
  localStorage.setItem(hopeV4Storage.banner,hopeProfileBanner);
  updateProfileUIV4();
};
document.querySelectorAll("[data-banner-color]").forEach(button=>button.addEventListener("click",()=>{
  hopeProfileBanner=button.dataset.bannerColor;
  const input=document.getElementById("profile-banner-color");
  if(input)input.value=hopeProfileBanner;
  document.querySelectorAll("[data-banner-color]").forEach(item=>item.classList.toggle("selected",item===button));
  const banner=document.getElementById("profile-banner");
  if(banner)banner.style.setProperty("--profile-banner",hopeProfileBanner);
}));
document.getElementById("profile-banner-color")?.addEventListener("input",event=>{
  hopeProfileBanner=event.target.value;
  document.getElementById("profile-banner")?.style.setProperty("--profile-banner",hopeProfileBanner);
});

const achievementsV4=[
  {title:"Collection Curator",description:"Favorite 3 games.",icon:"✧",test:()=>favorites.length>=3},
  {title:"Wishlist Dreamer",description:"Add 3 games to your wishlist.",icon:"♡",test:()=>games.filter(g=>hopeStatus(g.name)==="wishlist").length>=3},
  {title:"In the Zone",description:"Mark 3 games as currently playing.",icon:"◉",test:()=>games.filter(g=>hopeStatus(g.name)==="playing").length>=3},
  {title:"Completionist",description:"Mark 5 games as completed.",icon:"♛",test:()=>games.filter(g=>hopeStatus(g.name)==="completed").length>=5},
  {title:"Collector",description:"Build a library of 10 games.",icon:"▣",test:()=>games.length>=10},
  {title:"Dedicated",description:"Play 20 arcade sessions.",icon:"⚡",test:()=>playedGames>=20},
  {title:"XP Hunter",description:"Earn 250 XP.",icon:"◆",test:()=>playerXP>=250},
  {title:"Daily Regular",description:"Claim 5 daily rewards.",icon:"☀",test:()=>Number(localStorage.getItem("hopeDailyClaims")||0)>=5}
];
achievements.push(...achievementsV4);

const oldNavigateV4=navigate;
navigate=function(pageName){
  oldNavigateV4(pageName);
  if(pageName==="player")renderHopeProfile();
  if(pageName==="library")renderLibraryV4();
  if(pageName==="dashboard"){renderContinuePanel();renderLibraryV4();}
  if(pageName==="achievements")renderAchievements();
};
const oldUpdateStatsV4=updateStats;
updateStats=function(){
  oldUpdateStatsV4();
  renderContinuePanel();
  updateProfileUIV4();
};

function exportHopeBackup() {
  const payload={app:"HOPE",version:"4.0",exportedAt:new Date().toISOString(),data:{}};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key)payload.data[key]=localStorage.getItem(key);
  }
  payload.data[hopeV4Storage.statuses]=JSON.stringify(hopeGameStatuses);
  payload.data[hopeV4Storage.title]=hopePlayerTitle;
  payload.data[hopeV4Storage.banner]=hopeProfileBanner;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`hope-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
  const note=document.getElementById("backup-note");if(note)note.textContent="Backup exported successfully.";
}
function importHopeBackup(event) {
  const file=event.target.files?.[0];if(!file)return;
  const note=document.getElementById("backup-note");
  const reader=new FileReader();
  reader.onload=()=>{
    try {
      const payload=JSON.parse(reader.result);
      if(payload.app!=="HOPE"||!payload.data||typeof payload.data!=="object")throw new Error("Invalid backup");
      const allowed=/^(playerName|playedGames|bestScore|completedGames|hope[A-Za-z0-9]+|soundEnabled)$/;
      Object.entries(payload.data).forEach(([key,value])=>{
        if(allowed.test(key)&&typeof value==="string"&&value.length<2000000)localStorage.setItem(key,value);
      });
      if(note)note.textContent="Backup restored. Refreshing HOPE…";
      location.reload();
    } catch(error) {
      if(note)note.textContent="That backup file isn't valid. Your current data is unchanged.";
    }
    event.target.value="";
  };
  reader.onerror=()=>{if(note)note.textContent="Couldn't read that file.";};
  reader.readAsText(file);
}

// Rebuild game lists with persistent status controls after the original startup.
const originalAddCustomGameV4=addCustomGame;
addCustomGame=function(){
  originalAddCustomGameV4();
  renderLibraryV4();renderContinuePanel();renderHopeProfile();
};
const originalToggleFavoriteV4=toggleFavorite;
toggleFavorite=function(name){
  originalToggleFavoriteV4(name);
  renderLibraryV4();renderHopeProfile();
};
document.getElementById("library-search")?.addEventListener("input",renderLibraryV4);

// Premium profile display and player status.
document.getElementById("profile-avatar")?.addEventListener("click",()=>{});
updateProfileUIV4();
renderLibraryV4();
renderContinuePanel();
renderHopeProfile();
renderAchievements();

function navigateToArcade(){navigate("arcade");}
