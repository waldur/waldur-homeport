import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { OfferingComponent } from 'waldur-js-client';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { parseIntField } from '@/marketplace/common/utils';

interface DiscountsTableProps {
  components: OfferingComponent[];
}

export const DiscountsTable: FunctionComponent<DiscountsTableProps> = ({
  components,
}) => (
  <Table bordered>
    <thead>
      <tr>
        <th>{translate('Component')}</th>
        <th>{translate('Discount threshold')}</th>
        <th>{translate('Discount rate (%)')}</th>
      </tr>
    </thead>
    <tbody>
      {components.map((component) => (
        <tr key={component.type}>
          <td>
            <p>
              <strong>{component.name}</strong>
            </p>
            <p className="text-muted">{component.measured_unit}</p>
          </td>
          <td>
            <Field
              name={`discounts.${component.type}.discount_threshold`}
              parse={parseIntField}
            >
              {({ input, meta }) => (
                <InputField
                  input={input}
                  meta={meta}
                  type="number"
                  placeholder={translate('e.g. 100')}
                  min={0}
                />
              )}
            </Field>
          </td>
          <td>
            <Field
              name={`discounts.${component.type}.discount_rate`}
              parse={parseIntField}
            >
              {({ input, meta }) => (
                <InputField
                  input={input}
                  meta={meta}
                  type="number"
                  placeholder={translate('e.g. 15')}
                  min={0}
                  max={100}
                />
              )}
            </Field>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
