import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { parseIntField } from '@/marketplace/common/utils';
import { OfferingComponent } from '@/marketplace/types';

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
              component={InputField}
              type="number"
              placeholder={translate('e.g. 100')}
              min={0}
              parse={parseIntField}
            />
          </td>
          <td>
            <Field
              name={`discounts.${component.type}.discount_rate`}
              component={InputField}
              type="number"
              placeholder={translate('e.g. 15')}
              min={0}
              max={100}
              parse={parseIntField}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
