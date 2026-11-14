import { ManagedProject, ProjectTemplate } from 'waldur-js-client';

import { translate } from '@/i18n';

const embargoedUntil = (row: ManagedProject): string | null => {
  const earliest = row.details?.earliest_approve;
  if (earliest && new Date(earliest) > new Date()) {
    return earliest;
  }
  return null;
};

export const isEmbargoed = (row: ManagedProject): boolean =>
  embargoedUntil(row) !== null;

/**
 * What a member's role on the awarding portal becomes in this portal.
 *
 * Read from role_mapping_data, which holds the resolved local role. The raw
 * role_mapping may hold just the local role's name or UUID as a string, which
 * has no description or name to show. Matched case-insensitively.
 */
export const memberRoleLabel = (
  role: string | null | undefined,
  template: Pick<ProjectTemplate, 'role_mapping_data'> | null | undefined,
): string => {
  if (!role) {
    return translate('No role assigned');
  }
  const mapping = template?.role_mapping_data;
  if (!mapping || Object.keys(mapping).length === 0) {
    return translate('Will not be added to project');
  }
  const mapped =
    mapping[role] ??
    Object.entries(mapping).find(
      ([key]) => key.toLowerCase() === role.toLowerCase(),
    )?.[1];
  if (!mapped) {
    return translate('{role} has no mapping - will not be added to project', {
      role,
    });
  }
  return (
    mapped.description || mapped.name || mapped.uuid || translate('Not set')
  );
};
