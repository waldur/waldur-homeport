import { ENV } from '@/core/config';
import { RootState } from '@/store/reducers';
import { isStaff } from '@/workspace/selectors';

/**
 * Whether the deployment lets staff load demo presets. The backend reads it
 * from the environment only; nobody can switch it on from the portal.
 */
export const isDemoPresetsEnabled = (): boolean =>
  Boolean(ENV.plugins?.WALDUR_CORE?.DEMO_PRESETS_ENABLED);

/** UI-Router `data.permissions` guard of the demo presets page. */
export const canManageDemoPresets = (state: RootState): boolean =>
  isDemoPresetsEnabled() && Boolean(isStaff(state));
