// ======== TRUTH OR DARE GAME SCRIPT ========

// Arrays of truths and dares
const truths = [
  "What is your most embarrassing moment?",
  "What is a secret you’ve never told anyone?",
  "Who was your first crush?",
  "Have you ever lied to get out of trouble?",
  "What is your biggest fear?",
  "What’s something silly you’re afraid of?",
  "Have you ever cheated in a game?",
  "What’s your guilty pleasure TV show?",
  "What’s one thing you’d change about yourself?",
  "Who in this room do you trust the most?"
];

// Updated Dares — with creative replacements
const dares = [
  "Speak only in rhymes for the next minute.",
  "Sing a song loudly for 10 seconds.",
  "Do your best dance move!",
  "Let someone draw on your face with a washable marker.",
  "Talk in an accent for the next 2 minutes.",
  "Do an impression of someone famous.",
  "Act like a monkey for 10 seconds.",
  "Say a tongue twister 3 times fast.",
  "Post a funny selfie with your silliest face."
];

// ======== ELEMENTS ========
const truthCard = document.getElementById("truthCard");
const dareCard = document.getElementById("dareCard");
const truthText = document.getElementById("truthText");
const dareText = document.getElementById("dareText");
const resetBtn = document.getElementById("resetBtn");
const spinBtn = document.getElementById("spinBtn");

// Prevent multiple flips
let flipped = false;

// ======== FUNCTIONS ========
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function flipCard(card) {
  if (flipped) return; // only one card at a time
  card.classList.add("flipped");
  flipped = true;
}

function resetCards() {
  truthCard.classList.remove("flipped");
  dareCard.classList.remove("flipped");
  truthText.textContent = "Are you ready?";
  dareText.textContent = "Do something fun!";
  flipped = false;
  playSound("reset");
}

// ======== EVENT LISTENERS ========
truthCard.addEventListener("click", () => {
  if (flipped) return;
  flipCard(truthCard);
  playSound("flip");
  truthText.textContent = getRandomItem(truths);
});

dareCard.addEventListener("click", () => {
  if (flipped) return;
  flipCard(dareCard);
  playSound("flip");
  dareText.textContent = getRandomItem(dares);
});

resetBtn.addEventListener("click", resetCards);
spinBtn.addEventListener("click", () => {
  window.location.href = "spinpage.html"; // redirect to your spin page
});

// ======== BONUS: Keyboard Shortcuts ========
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "t") truthCard.click();
  if (e.key.toLowerCase() === "d") dareCard.click();
  if (e.key.toLowerCase() === "r") resetBtn.click();
});
