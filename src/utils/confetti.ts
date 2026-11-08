import confetti from 'canvas-confetti';

export function fireTaskCompletionConfetti() {
  try {
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.75 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
    });
  } catch (e) {
    // Graceful fallback if window or canvas not accessible
    console.debug('Confetti animation skipped', e);
  }
}
