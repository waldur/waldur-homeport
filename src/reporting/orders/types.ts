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

// State colors for charts
export const STATE_COLORS: Record<string, string> = {
  done: '#50cd89', // success/green
  'pending-consumer': '#ffc700', // warning/yellow
  'pending-provider': '#ffa800', // warning/orange
  executing: '#009ef7', // primary/blue
  erred: '#f1416c', // danger/red
  canceled: '#7e8299', // gray
  rejected: '#f1416c', // danger/red
};

// Type colors for charts
export const TYPE_COLORS: Record<string, string> = {
  Create: '#50cd89', // success/green
  Update: '#009ef7', // primary/blue
  Terminate: '#f1416c', // danger/red
};
