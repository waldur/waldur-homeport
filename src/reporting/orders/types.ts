import { getChartThemeColors } from '@/dashboard/chartColors';

// Re-export types from SDK
export type { DailyOrderStats } from 'waldur-js-client';

// Order states from the API
export const ORDER_STATES: Record<string, string> = {
  'pending-consumer': 'Pending (Consumer)',
  'pending-provider': 'Pending (Provider)',
  executing: 'Executing',
  done: 'Done',
  erred: 'Erred',
  canceled: 'Canceled',
  rejected: 'Rejected',
};

export const ORDER_TYPES: Record<string, string> = {
  Create: 'Create',
  Update: 'Update',
  Terminate: 'Terminate',
};

// State colours for charts, from the chart roles.
export const getStateColors = (): Record<string, string> => {
  const tc = getChartThemeColors();
  return {
    done: tc.success,
    'pending-consumer': tc.notice,
    'pending-provider': tc.warning,
    executing: tc.progress,
    erred: tc.danger,
    canceled: tc.muted,
    rejected: tc.danger,
  };
};

// Type colours for charts, from the chart roles.
export const getTypeColors = (): Record<string, string> => {
  const tc = getChartThemeColors();
  return {
    Create: tc.success,
    Update: tc.progress,
    Terminate: tc.danger,
  };
};
