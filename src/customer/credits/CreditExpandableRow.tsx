import { startCase } from 'lodash';
import { CustomerCredit, ProjectCredit } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { BooleanField } from '@waldur/table/BooleanField';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const CreditExpandableRow = ({
  row,
}: {
  row: CustomerCredit | ProjectCredit;
}) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Minimal consumption logic')}
      value={startCase(row.minimal_consumption_logic)}
    />

    <Field
      label={translate('Minimal consumption')}
      value={defaultCurrency(row.minimal_consumption)}
    />

    <Field
      label={translate('Expected consumption')}
      value={defaultCurrency(row.expected_consumption)}
    />

    <Field
      label={translate('Grace coefficient')}
      value={row.grace_coefficient}
    />

    <Field
      label={translate('Apply as minimal consumption')}
      value={<BooleanField value={row.apply_as_minimal_consumption} />}
    />
  </ExpandableContainer>
);
