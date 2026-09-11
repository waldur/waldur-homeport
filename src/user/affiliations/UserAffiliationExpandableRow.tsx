import { FC } from 'react';
import { Permission } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { GrantSourceIndicator } from './GrantSourceIndicator';

interface OwnProps {
  row: Permission;
}

export const UserAffiliationExpandableRow: FC<OwnProps> = ({ row }) => {
  const revokedBy =
    row.revoked_by_full_name || row.revoked_by_username || undefined;
  return (
    <ExpandableContainer>
      {/* Provenance answers "why do I have this role", and "why did it go away"
          when read next to the revocation fields below. That is a per-row
          question, so it lives here rather than taking a column in a table that
          is already wide. */}
      <Field
        label={translate('Granted by')}
        value={<GrantSourceIndicator source={row.source} uuid={row.uuid} />}
      />
      <Field
        label={translate('Start date')}
        value={row.created ? formatDate(row.created) : undefined}
      />
      <Field
        label={translate('End date')}
        value={
          row.expiration_time ? formatDate(row.expiration_time) : undefined
        }
      />
      {!row.is_active && (
        <>
          <Field label={translate('Revoked by')} value={revokedBy} />
          <Field
            label={translate('Revoke access reason')}
            value={row.revoke_reason || undefined}
          />
        </>
      )}
    </ExpandableContainer>
  );
};
