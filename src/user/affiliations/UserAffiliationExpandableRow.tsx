import { FC } from 'react';
import { Permission } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: Permission;
}

export const UserAffiliationExpandableRow: FC<OwnProps> = ({ row }) => {
  const revokedBy =
    row.revoked_by_full_name || row.revoked_by_username || undefined;
  return (
    <ExpandableContainer>
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
