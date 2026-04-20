export function isThreadLoading(
  loadingThreadId: string | null,
  currentThreadId: string,
  threads: ReadonlyMap<string, unknown>,
): boolean {
  return loadingThreadId === currentThreadId && !threads.has(currentThreadId);
}
