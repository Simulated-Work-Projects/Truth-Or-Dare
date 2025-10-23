// spinpage.js
document.addEventListener("DOMContentLoaded", () => {
  const PLAYER_KEY = "tod_players";
  const SELECTED_KEY = "tod_selected_player";

  const wrapper = document.querySelector(".spinner-wrapper");
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const stopper = document.querySelector(".stopper");

  // --- load players ---
  let players = [];
  try {
    const raw = sessionStorage.getItem(PLAYER_KEY);
    players = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading players:", e);
  }

  if (!Array.isArray(players) || players.length < 2) {
    alert("Please add at least two players from the main screen.");
    window.location.href = "index.html";
    return;
  }

  // set data-players for CSS sizing
  wrapper.dataset.players = players.length.toString();

  // --- Hi-DPI canvas setup (keeps sizes consistent) ---
  function resizeCanvasToDisplaySize() {
    const cssWidth = parseInt(getComputedStyle(wrapper).getPropertyValue("--wheel-size")) || canvas.clientWidth || 400;
    const cssHeight = cssWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale context to account for DPR
  }
  resizeCanvasToDisplaySize();
  window.addEventListener("resize", () => { resizeCanvasToDisplaySize(); drawWheel(); });

  // --- palette generation that avoids adjacent duplicate colors ---
  const baseColors = [
    "#efe6d6","#eadfc9","#e1d4b8","#d9caa5","#cfb995",
    "#c2a67f","#b08967","#9a7553","#866047","#724d39","#a68a55"
  ];
  function generateColors(n) {
    const palette = [];
    // pick first n colors from baseColors cycling if needed but ensure no adjacent equals
    for (let i = 0; i < n; i++) {
      let candidate = baseColors[i % baseColors.length];
      // if equals previous, try next candidate
      if (i > 0 && candidate === palette[i - 1]) candidate = baseColors[(i + 1) % baseColors.length];
      palette.push(candidate);
    }
    // ensure last != first
    if (palette.length > 1 && palette[0] === palette[palette.length - 1]) {
      palette[palette.length - 1] = baseColors[(palette.length + 2) % baseColors.length];
    }
    return palette;
  }
  const colors = generateColors(players.length);

  // --- geometry & state ---
  let startAngle = 0; // rotation applied to wheel (radians)
  const SEG_COUNT = players.length;
  const arc = (2 * Math.PI) / SEG_COUNT;
  let spinning = false;

  // convenience: center & radius derived after canvas size set
  function getCenter() {
    const rect = canvas.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2, r: Math.min(rect.width, rect.height) / 2 };
  }

  // --- draw wheel (rotate canvas by startAngle, then draw equal segments starting at 0) ---
  function drawWheel(highlightIndex = -1) {
    const { x: cx, y: cy, r } = getCenter();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle); // rotate whole wheel

    for (let i = 0; i < SEG_COUNT; i++) {
      const segStart = i * arc;
      // draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, segStart, segStart + arc);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // optional thin stroke between segments
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, segStart, segStart + arc);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = "rgba(59,47,42,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // draw label rotated along middle of segment
      ctx.save();
      const midAngle = segStart + arc / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#3b2f2a";
      // use CSS variable for label size if present
      const computed = getComputedStyle(document.documentElement).getPropertyValue("--label-size").trim();
      const labelSize = computed ? computed : "14px";
      ctx.font = `600 ${labelSize} Poppins, sans-serif`;
      // draw name near outer rim
      ctx.fillText(players[i], r - 18, 0);
      ctx.restore();
    }

    ctx.restore();

    // draw outer circle (subtle)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(59,47,42,0.06)";
    ctx.stroke();
  }

  drawWheel();

  // --- easing ---
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // --- spin to target index: animation rotates the wheel so that target segment's mid-angle lands under pointer (-PI/2) ---
  function spinToIndex(targetIndex, durationMs = 4200) {
    if (spinning) return;
    spinning = true;
    wrapper.classList.add("spinning");

    // compute target: we want (startAngle_final + midAngleOfTarget) ≡ -PI/2  (mod 2PI)
    const targetMidAngle = targetIndex * arc + arc / 2; // angle (in wheel-local coords) of target center
    // choose random extra rotations to make it feel natural
    const extraRotations = 4 + Math.floor(Math.random() * 4); // 4..7
    // final startAngle that satisfies equation:
    // startAngleFinal = -PI/2 - targetMidAngle + extraRotations * 2PI
    const finalStartAngle = -Math.PI / 2 - targetMidAngle + extraRotations * 2 * Math.PI;
    const initialAngle = startAngle;
    const delta = finalStartAngle - initialAngle;
    const t0 = performance.now();

    function frame(now) {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      startAngle = initialAngle + delta * eased;
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // normalize startAngle to [0, 2PI)
        startAngle = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        spinning = false;
        wrapper.classList.remove("spinning");
        // small stopper tap animation
        if (stopper) {
          stopper.classList.add("tap");
          setTimeout(() => stopper.classList.remove("tap"), 360);
        }
        // announce winner (pop-up) using exact same formula to avoid mismatch
        announceWinnerFromAngle();
      }
    }
    requestAnimationFrame(frame);
  }

  // --- compute winner consistent with drawWheel rotation ---
  function computeWinnerIndexFromCurrentStartAngle() {
    // We used the invariant:
    // absolute angle of center of segment i (in canvas coordinates) = startAngle + (i + 0.5)*arc
    // pointer location (top) is -PI/2.
    // Solve for i such that startAngle + (i+0.5)*arc ≡ -PI/2  (mod 2PI)
    // => i = ( (-PI/2 - startAngle) / arc ) - 0.5
    const raw = (-Math.PI / 2 - startAngle) % (2 * Math.PI);
    const normalized = (raw + 2 * Math.PI) % (2 * Math.PI); // 0..2PI
    const index = Math.floor(normalized / arc);
    // ensure integer in [0, SEG_COUNT-1]
    return ((index % SEG_COUNT) + SEG_COUNT) % SEG_COUNT;
  }

  // --- announce winner (popup) ---
  function announceWinnerFromAngle() {
    const index = computeWinnerIndexFromCurrentStartAngle();
    const winner = players[index];
    drawWheel(index);

    // --- Popup creation ---
    const popup = document.createElement("div");
    popup.className = "winner-popup";
    popup.innerHTML = `
    <div class="popup-content" role="dialog" aria-modal="true">
      <h2>🎯 ${escapeHtml(winner)} got selected!</h2>
      <p style="margin:8px 0 16px 0;color:var(--muted)">
        What would you like to do next?
      </p>
      <div class="popup-buttons">
        <button id="spinAgainBtn" class="secondary">Spin Again</button>
        <button id="continueBtn">Continue</button>
      </div>
    </div>
  `;
    document.body.appendChild(popup);

    popup.querySelector("#spinAgainBtn").addEventListener("click", () => {
      popup.remove();
    });

    // --- Button behavior ---
    popup.querySelector("#continueBtn").addEventListener("click", () => {
      sessionStorage.setItem("tod_selected_player", winner);
      popup.remove();
      window.location.href = "truthdare.html";
    });
  }


  // small safe html escape for names
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  // --- click handler: picks random index and spins to it ---
  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    const target = Math.floor(Math.random() * SEG_COUNT);
    spinToIndex(target, 4200 + Math.random() * 800);
  });

  // make canvas clickable by Enter for accessibility
  spinBtn.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") spinBtn.click(); });

});
