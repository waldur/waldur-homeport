import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { useTheme } from '@/theme/useTheme';

/**
 * The deployment's login logo for the current theme: LOGIN_LOGO_DARK in dark
 * mode when the deployment set one, LOGIN_LOGO otherwise. Language-specific
 * logos (`language`) are light ones, so they apply only to LOGIN_LOGO.
 */
export const useLoginLogoUrl = (language?: string) => {
  const { theme } = useTheme();
  return theme === 'dark' && ENV.plugins.WALDUR_CORE.LOGIN_LOGO_DARK
    ? getIconUrl('login_logo_dark')
    : getIconUrl('login_logo', language);
};
