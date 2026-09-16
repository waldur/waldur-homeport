import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { SramFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

/** Read the public SRAM_INTEGRATION_ENABLED constance flag from configuration. */
const isSramIntegrationEnabled = (): boolean =>
  Boolean(ENV.plugins?.WALDUR_CORE?.SRAM_INTEGRATION_ENABLED);

/**
 * SRAM UI is shown only when the UI feature flag is on AND the backend
 * integration is enabled. The two switches are independent: the flag alone
 * leaves the UI calling a disabled backend, which answers 404 on every SRAM
 * endpoint.
 */
export const isSramUiEnabled = (): boolean =>
  isFeatureVisible(SramFeatures.integration) && isSramIntegrationEnabled();

/** Grant sources written by the SRAM integration (see UserRole.source). */
const SRAM_PLACEHOLDER_SOURCE_PREFIX = 'sram:';
const SRAM_RULE_SOURCE_PREFIX = 'sram-rule:';

export type SramGrantKind = 'placeholder' | 'rule';

/**
 * Which part of the SRAM integration created a grant, or null for a grant
 * created any other way. Placeholder grants mirror a collaboration or group
 * membership; rule grants are the project roles a staff-defined project rule
 * derives from them.
 */
export const getSramGrantKind = (
  source: string | null | undefined,
): SramGrantKind | null => {
  if (!source) return null;
  if (source.startsWith(SRAM_PLACEHOLDER_SOURCE_PREFIX)) return 'placeholder';
  if (source.startsWith(SRAM_RULE_SOURCE_PREFIX)) return 'rule';
  return null;
};

export const isSramGrant = (source: string | null | undefined): boolean =>
  getSramGrantKind(source) !== null;

export const getSramGrantTooltip = (kind: SramGrantKind): string =>
  kind === 'rule'
    ? translate(
        'Granted by an SRAM project rule. It is revoked automatically when the membership in SRAM ends.',
      )
    : translate(
        'Mirrors a membership in SURF Research Access Management (SRAM). Changes made here are overwritten by the next SRAM push.',
      );

/**
 * Placeholder roles are organization-scoped custom roles named
 * `CUSTOMER.<org-slug>.SRAM.<co>[.<group>]`; their description holds the SRAM
 * display name.
 */
const SRAM_PLACEHOLDER_ROLE_PATTERN = /^CUSTOMER\.[^.]+\.SRAM\.[^.]+/;

export const isSramPlaceholderRoleName = (
  roleName: string | null | undefined,
): boolean => Boolean(roleName && SRAM_PLACEHOLDER_ROLE_PATTERN.test(roleName));
