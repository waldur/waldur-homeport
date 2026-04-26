export const toGb = (mb: number): number => Math.round((mb / 1024) * 10) / 10;

export const formatMemory = (mb: number): string => {
  if (mb >= 1024 * 1024) {
    return `${(mb / (1024 * 1024)).toFixed(1)}TB`;
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)}GB`;
  }
  return `${mb}MB`;
};

interface UsageStats {
  available: number;
  overcommitted: number;
  isOvercommitted: boolean;
  isEmpty: boolean;
}

export const computeUsage = (used: number, total: number): UsageStats => ({
  available: Math.max(0, total - used),
  overcommitted: Math.max(0, used - total),
  isOvercommitted: used > total,
  isEmpty: total === 0,
});
