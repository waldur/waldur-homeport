/**
 * One-shot composer seed. The drawer opens imperatively and the composer lives
 * inside the assistant-ui runtime, so a context-carrying entry point cannot
 * pass it a prop; it parks the question here (module scope, like
 * `chatDrawerPreferences`) and the composer consumes it on mount.
 */
let pendingSeed: string | null = null;

export const setPendingAssistantSeed = (prompt: string): void => {
  pendingSeed = prompt;
};

/** Read and clear the pending seed. Returns null when nothing is parked. */
export const consumePendingAssistantSeed = (): string | null => {
  const seed = pendingSeed;
  pendingSeed = null;
  return seed;
};
