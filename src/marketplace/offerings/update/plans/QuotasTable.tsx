import { FC } from 'react';
import { Field, useField } from 'react-final-form';
import {
  OfferingComponent,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import {
  BillingTypeBadge,
  formatComponentCharge,
} from '@/marketplace/common/billingTypes';
import {
  validateNonNegative,
  parseIntField,
  formatIntField,
  parseFloatOrNull,
} from '@/marketplace/common/utils';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface QuotasTableProps {
  components: OfferingComponent[];
  plan: Plan;
}

const QuotaRow: FC<{ component: OfferingComponent; plan: Plan }> = ({
  component,
  plan,
}) => {
  const price = parseFloatOrNull(plan.prices?.[component.type]);
  // Same `format` as the <Field> below, so the input and the charge line can
  // never disagree about a component the plan has no quota for: RFF's default
  // format hands back '' where formatIntField renders 0, which read as
  // "Amount 0 ... Charge —" on the same row.
  const { input } = useField(`quotas.${component.type}`, {
    subscription: { value: true },
    format: formatIntField,
  });
  const amount = parseFloatOrNull(input.value);
  const charge = formatComponentCharge(component, amount, price, plan.unit);

  return (
    <TableRow divided={false}>
      <TableCell>{component.name}</TableCell>
      <TableCell>
        <BillingTypeBadge component={component} />
      </TableCell>
      <TableCell>
        <Field
          name={`quotas.${component.type}`}
          type="number"
          validate={validateNonNegative}
          parse={parseIntField}
          format={formatIntField}
        >
          {({ input }) => (
            <BaseInputField {...input} min={0} inputMode="numeric" />
          )}
        </Field>
      </TableCell>
      <TableCell>{price === null ? DASH_ESCAPE_CODE : price}</TableCell>
      <TableCell>{charge || DASH_ESCAPE_CODE}</TableCell>
      <TableCell>{component.measured_unit}</TableCell>
    </TableRow>
  );
};

export const QuotasTable: FC<QuotasTableProps> = (props) => (
  <Table>
    <TableHeader>
      <TableRow divided={false}>
        <TableHead>{translate('Name')}</TableHead>
        <TableHead>{translate('Billing type')}</TableHead>
        <TableHead>{translate('Amount')}</TableHead>
        <TableHead>{translate('Unit price')}</TableHead>
        <TableHead>{translate('Charge')}</TableHead>
        <TableHead>{translate('Units')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {props.components.map((component) => (
        <QuotaRow
          key={component.type}
          component={component}
          plan={props.plan}
        />
      ))}
    </TableBody>
  </Table>
);
