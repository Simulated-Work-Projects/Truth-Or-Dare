document.addEventListener("DOMContentLoaded", () => {
  const monsters = document.querySelectorAll(".floating");

  monsters.forEach((monster) => {
    // Place randomly in viewport (avoid edges)
    const randomX = Math.random() * (window.innerWidth - 120);
    const randomY = Math.random() * (window.innerHeight - 120);

    monster.style.left = `${randomX}px`;
    monster.style.top = `${randomY}px`;

    // Add random animation timing for natural movement
    monster.style.animationDelay = `${Math.random() * 5}s`;
  });

  // Optional: make monsters drift to new random positions every 10s
  setInterval(() => {
    monsters.forEach((monster) => {
      const newX = Math.random() * (window.innerWidth - 120);
      const newY = Math.random() * (window.innerHeight - 120);
      monster.style.transition = "top 5s ease, left 5s ease";
      monster.style.left = `${newX}px`;
      monster.style.top = `${newY}px`;
    });
  }, 10000);
});
