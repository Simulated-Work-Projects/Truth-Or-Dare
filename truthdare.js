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

// ======== HELPERS ========
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function setCardTextSafely(card, textElement, newText) {
  // If card is currently flipped (showing front/back), we want to wait until it visually unflips
  // before changing the text so the user doesn't see the new text appear before flip animation.
  if (!card.classList.contains("flipped")) {
    // not flipped: safe to change immediately
    textElement.textContent = newText;
    return;
  }

  // card is flipped: remove flip and wait for transitionend (or timeout) to set text
  const onTransitionEnd = (ev) => {
    // make sure it's the transform/flip transition (some CSS might use multiple properties)
    // if you know the property name, you can check ev.propertyName
    card.removeEventListener("transitionend", onTransitionEnd);
    textElement.textContent = newText;
  };

  // remove flipped state to trigger unflip animation
  card.classList.remove("flipped");

  // wait for transitionend (fallback to timeout)
  let transitionFired = false;
  card.addEventListener("transitionend", (ev) => {
    transitionFired = true;
  }, { once: true });

  // Attach a short delay to set the text after the animation finishes:
  // Prefer transitionend — but fallback after 350ms if it doesn't fire.
  card.addEventListener("transitionend", onTransitionEnd, { once: true });
  setTimeout(() => {
    if (!transitionFired) {
      // fallback after 350ms
      card.removeEventListener("transitionend", onTransitionEnd);
      textElement.textContent = newText;
    }
  }, 350);
}

// Flip card normally (click to reveal)
function flipCard(card) {
  if (flipped) return; // only one card at a time
  card.classList.add("flipped");
  flipped = true;
}

// Reset but set new random statements *after* unflip so text change isn't visible prematurely
function resetCards() {
  // If neither card is flipped just set new text immediately
  if (!truthCard.classList.contains("flipped") && !dareCard.classList.contains("flipped")) {
    truthText.textContent = getRandomItem(truths);
    dareText.textContent = getRandomItem(dares);
    flipped = false;
    playSound?.("reset");
    return;
  }

  // If any card is flipped, unflip them and set new text after unflip animation
  truthCard.classList.remove("flipped");
  dareCard.classList.remove("flipped");

  // Wait for both to finish transition (simple approach: setTimeout fallback)
  let settled = false;
  const setBothTexts = () => {
    if (settled) return;
    settled = true;
    truthText.textContent = getRandomItem(truths);
    dareText.textContent = getRandomItem(dares);
    flipped = false;
    playSound?.("reset");
  };

  // Try to listen for transitionend on one of them; fallback timeout
  let fired = 0;
  const handler = () => {
    fired += 1;
    // wait for at least one transition event or use timeout — this prevents waiting forever
    if (fired >= 1) setBothTexts();
  };

  truthCard.addEventListener("transitionend", handler, { once: true });
  dareCard.addEventListener("transitionend", handler, { once: true });
  // fallback in case transitionend doesn't fire
  setTimeout(setBothTexts, 350);
}

// ======== INITIAL RANDOM DISPLAY ========
window.addEventListener("DOMContentLoaded", () => {
  truthText.textContent = getRandomItem(truths);
  dareText.textContent = getRandomItem(dares);
});

// ======== EVENT LISTENERS ========
truthCard.addEventListener("click", () => {
  if (flipped) return;
  flipCard(truthCard);
  playSound?.("flip");
  // set random truth only when revealing (safe because we just flipped)
  truthText.textContent = getRandomItem(truths);
});

dareCard.addEventListener("click", () => {
  if (flipped) return;
  flipCard(dareCard);
  playSound?.("flip");
  dareText.textContent = getRandomItem(dares);
});

resetBtn.addEventListener("click", () => {
  // Use safer setter in case one card is still flipped.
  // This ensures text change happens after unflip.
  resetCards();
});

spinBtn.addEventListener("click", () => {
  window.location.href = "spinpage.html"; // redirect to your spin page
});

// ======== BONUS: Keyboard Shortcuts ========
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "t") truthCard.click();
  if (e.key.toLowerCase() === "d") dareCard.click();
  if (e.key.toLowerCase() === "r") resetBtn.click();
});
