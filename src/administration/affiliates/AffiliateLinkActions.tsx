import { FC } from 'react';
import { CustomerAffiliate } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AffiliateLinkDeleteAction } from './AffiliateLinkDeleteAction';
import { AffiliateLinkEditAction } from './AffiliateLinkEditAction';

interface AffiliateLinkActionsProps {
  row: CustomerAffiliate;
  refetch(): void;
}

export const AffiliateLinkActions: FC<AffiliateLinkActionsProps> = ({
  row,
  refetch,
}) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[AffiliateLinkEditAction, AffiliateLinkDeleteAction]}
  />
);
