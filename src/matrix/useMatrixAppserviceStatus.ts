import { useQuery } from '@tanstack/react-query';
import {
  adminMatrixAppserviceStatusRetrieve,
  ConstanceSettings,
} from 'waldur-js-client';

// The dashboard and the Setup dialog read the same status, so one response
// serves both.
export const useMatrixAppserviceStatus = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ['matrixAppserviceStatus'],
    queryFn: () => adminMatrixAppserviceStatusRetrieve().then((r) => r.data),
    enabled,
  });

// Any value counts, as it does for the backend's Setup endpoint, which
// refuses to rotate tokens while MATRIX_TOKENS_MANAGED_BY is set.
export const isManagedByDeployment = (marker: string | undefined) =>
  Boolean(marker);

// What the Helm chart and Docker Compose pass to init_matrix_settings on every
// deploy, whatever else is switched on. A change made here is overwritten at
// the next deploy, and a changed token breaks chat until then. MATRIX_ENABLED
// is not among them: it is switched on only at the first seeding, so staff can
// turn chat off here and it stays off.
export const DEPLOYMENT_KEYS = [
  'MATRIX_HOMESERVER_URL',
  'MATRIX_HOMESERVER_PUBLIC_URL',
  'MATRIX_HOMESERVER_DOMAIN',
  'MATRIX_APPSERVICE_AS_TOKEN',
  'MATRIX_APPSERVICE_HS_TOKEN',
  'MATRIX_APPSERVICE_SENDER_LOCALPART',
  'MATRIX_USER_REGISTRATION_SECRET',
];

// Passed only while the deployment's homeserver single sign-on is on, and then
// always with the login method "oidc". Without SSO neither is passed, so an
// administrator's own choice of login method stands and stays editable.
export const SSO_DEPLOYMENT_KEYS = [
  'MATRIX_EXTERNAL_LOGIN_METHOD',
  'MATRIX_SSO_REGISTRATION_METHOD',
];

// Passed only while the deployment's calls are on, always all four together.
// Without calls they are not passed, and whatever is stored stays editable.
export const LIVEKIT_DEPLOYMENT_KEYS = [
  'MATRIX_LIVEKIT_PUBLIC_URL',
  'MATRIX_LIVEKIT_URL',
  'MATRIX_LIVEKIT_KEY',
  'MATRIX_LIVEKIT_SECRET',
];

/**
 * The settings this page locks because the deployment writes them back on
 * every deploy. Only this page: the backend refuses Setup while the marker is
 * set, but not an edit of these settings.
 *
 * Settings the deployment passes only with SSO or calls on are locked only when
 * the stored values look written by it: the login method "oidc" for SSO, and a
 * LiveKit URL for calls. The settings do not record who wrote a value, and
 * locking them on every managed install would take away the choice the
 * packagers deliberately leave to administrators when the feature is off.
 */
export const getDeploymentLockedKeys = (
  settings: Pick<
    ConstanceSettings,
    | 'MATRIX_TOKENS_MANAGED_BY'
    | 'MATRIX_EXTERNAL_LOGIN_METHOD'
    | 'MATRIX_LIVEKIT_URL'
    | 'MATRIX_LIVEKIT_PUBLIC_URL'
  >,
): string[] => {
  if (!isManagedByDeployment(settings.MATRIX_TOKENS_MANAGED_BY)) return [];
  const keys = [...DEPLOYMENT_KEYS];
  if (settings.MATRIX_EXTERNAL_LOGIN_METHOD === 'oidc') {
    keys.push(...SSO_DEPLOYMENT_KEYS);
  }
  if (settings.MATRIX_LIVEKIT_URL || settings.MATRIX_LIVEKIT_PUBLIC_URL) {
    keys.push(...LIVEKIT_DEPLOYMENT_KEYS);
  }
  return keys;
};
