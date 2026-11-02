import type {
  CustomerServiceAccount,
  ProjectServiceAccount,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const ServiceAccountExpandableRow = ({
  row,
}: {
  row: CustomerServiceAccount | ProjectServiceAccount;
}) => (
  <ExpandableContainer>
    <PropertyList variant="summary">
      <PropertyItem label={translate('Description')} value={row.description} />
    </PropertyList>
  </ExpandableContainer>
);
