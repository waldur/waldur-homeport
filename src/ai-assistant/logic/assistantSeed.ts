/**
 * One-shot composer seed for the assistant drawer.
 *
 * Entry points that carry context — "Ask about this service" on an offering
 * page — cannot pass a prop to the composer: the drawer is opened imperatively
 * through `openDrawer`, and the composer lives four levels below it inside the
 * assistant-ui runtime. The seed is parked here (module scope, like
 * `chatDrawerPreferences`) and consumed once when the composer mounts, so the
 * user sees an editable question instead of a message sent on their behalf.
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
