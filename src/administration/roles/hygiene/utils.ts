import {
  RoleHygieneFinding,
  RoleHygieneFindingSeverityEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export const getCheckLabel = (check: string): string =>
  ({
    'name-not-a-code': translate('Name is not a code'),
    'system-name-unknown': translate('Unknown system role'),
    'system-scope-mismatch': translate('System role on the wrong scope'),
    'clone-name-drift': translate('Copy name out of sync'),
    'template-without-scope': translate('Copy without organization'),
    'multi-org-binding': translate('Bound to several organizations'),
    'org-role-unmanaged': translate('Organization role without a template'),
    'global-custom-role': translate('Custom role offered everywhere'),
    'scope-prefix-mismatch': translate('Name claims the wrong scope'),
    'cross-scope-permission': translate('Permissions that never apply'),
    'label-missing': translate('No description'),
    'label-equals-name': translate('Description repeats the code'),
  })[check] || check;

const matchesQuery = (finding: RoleHygieneFinding, query: string) =>
  [
    finding.role_name,
    finding.role_description,
    finding.check,
    getCheckLabel(finding.check),
    finding.message,
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);

export const filterFindings = (
  findings: RoleHygieneFinding[],
  {
    severity,
    query,
  }: { severity?: RoleHygieneFindingSeverityEnum; query?: string } = {},
) => {
  const needle = (query || '').trim().toLowerCase();
  return findings.filter(
    (finding) =>
      (!severity || finding.severity === severity) &&
      (!needle || matchesQuery(finding, needle)),
  );
};
