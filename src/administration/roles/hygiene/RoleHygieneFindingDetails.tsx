import { RoleHygieneFinding } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

// Each check fills `details` with whatever it likes, so only real numbers are
// shown as counts.
const count = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

export const RoleHygieneFindingDetails = ({
  row,
}: {
  row: RoleHygieneFinding;
}) => (
  <ExpandableContainer asTable>
    <PropertyItem label={translate('Explanation')} value={row.message} />
    <PropertyItem
      label={translate('Organizations holding it')}
      value={propVal.number(count(row.details?.organization_count))}
    />
    <PropertyItem
      label={translate('Active assignments')}
      value={propVal.number(count(row.details?.assignment_count))}
    />
  </ExpandableContainer>
);
