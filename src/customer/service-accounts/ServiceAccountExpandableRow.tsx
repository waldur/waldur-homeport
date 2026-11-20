import type {
  CustomerServiceAccount,
  ProjectServiceAccount,
} from 'waldur-js-client';

import { SingleProperty } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const ServiceAccountExpandableRow = ({
  row,
}: {
  row: CustomerServiceAccount | ProjectServiceAccount;
}) => (
  <ExpandableContainer>
    <SingleProperty label={translate('Description')} value={row.description} />
  </ExpandableContainer>
);
