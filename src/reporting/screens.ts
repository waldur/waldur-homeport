import { ENV } from '@/core/config';

// Kept apart from ./utils on purpose: that module pulls in echarts, and these
// two flags are read by the route table and the sidebar on every start.
export const isReportingScreenEnabled = (screen: string) => {
  const enabledScreens = ENV.plugins.WALDUR_CORE?.ENABLED_REPORTING_SCREENS;
  return Array.isArray(enabledScreens) ? enabledScreens.includes(screen) : true;
};

export const hasAnyReportingEnabled = () => {
  const enabledScreens = ENV.plugins.WALDUR_CORE?.ENABLED_REPORTING_SCREENS;
  return Array.isArray(enabledScreens) ? enabledScreens.length > 0 : true;
};
