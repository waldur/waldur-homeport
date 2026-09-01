import { FC, useMemo } from 'react';
import { RoleDetails } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

import { getPermissionDiff, getRolePermissions } from './permissionDiff';
import { PermissionDeltaCounters } from './RolePermissionDiff';

/**
 * How a role differs from the role it was cloned from, as counters shown beside
 * the role's own lineage in a table cell. Roles without a template have no
 * baseline to summarise against and render nothing; the full comparison lives
 * in the row actions.
 */
export const RolePermissionDelta: FC<{ row: RoleDetails }> = ({ row }) => {
  const template = row.template_uuid
    ? ENV.roles.find((item) => item.uuid === row.template_uuid)
    : undefined;
  const templatePermissions = template
    ? getRolePermissions(template)
    : undefined;
  const ownPermissions = getRolePermissions(row);
  const diff = useMemo(
    () =>
      templatePermissions && ownPermissions
        ? getPermissionDiff(templatePermissions, ownPermissions)
        : null,
    // The permission lists are read from a cache that is replaced wholesale on
    // every role mutation, so the diff is recomputed from their contents.
    [templatePermissions?.join(), ownPermissions?.join()],
  );

  if (!diff) {
    return null;
  }

  const templateLabel = template.description || template.name;
  return (
    <span title={translate('Compared with {name}', { name: templateLabel })}>
      <PermissionDeltaCounters diff={diff} />
    </span>
  );
};
