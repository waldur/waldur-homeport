import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { PermissionDiff, isEmptyDiff } from './permissionDiff';

/**
 * How many permissions a role adds and drops relative to another, as compact
 * counters for a table cell, beside the role's own type badge.
 */
export const PermissionDeltaCounters: FC<{ diff: PermissionDiff }> = ({
  diff,
}) =>
  isEmptyDiff(diff) ? (
    <Badge variant="secondary" shape="pill" tone="outline">
      {translate('Identical')}
    </Badge>
  ) : (
    <>
      {diff.added.length > 0 && (
        <Badge
          variant="success"
          shape="pill"
          tone="outline"
          tooltip={translate('{count} permissions this role adds', {
            count: diff.added.length,
          })}
        >
          {'+' + diff.added.length}
        </Badge>
      )}
      {diff.added.length > 0 && diff.removed.length > 0 && ' '}
      {diff.removed.length > 0 && (
        <Badge
          variant="danger"
          shape="pill"
          tone="outline"
          tooltip={translate('{count} permissions this role drops', {
            count: diff.removed.length,
          })}
        >
          {'−' + diff.removed.length}
        </Badge>
      )}
    </>
  );
