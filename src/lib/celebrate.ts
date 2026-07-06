// Confetti burst in the house palette. Dynamically imported so the canvas
// library never runs during server rendering.
export async function celebrate() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 32,
    origin: { y: 0.65 },
    colors: ["#e85d1f", "#f5a623", "#2e9e44", "#fcede4"],
    disableForReducedMotion: true,
  });
}
