import { RoleHygieneFinding } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
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
    <Field label={translate('Explanation')} value={row.message} />
    <Field
      label={translate('Organizations holding it')}
      value={count(row.details?.organization_count)}
    />
    <Field
      label={translate('Active assignments')}
      value={count(row.details?.assignment_count)}
    />
  </ExpandableContainer>
);
