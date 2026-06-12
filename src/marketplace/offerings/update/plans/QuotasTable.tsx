import { FC } from 'react';
import { Field } from 'react-final-form';
import { OfferingComponent } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  validateNonNegative,
  parseIntField,
  formatIntField,
} from '@/marketplace/common/utils';

interface QuotasTableProps {
  components: OfferingComponent[];
}

export const QuotasTable: FC<QuotasTableProps> = (props) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{translate('Name')}</th>
        <th>{translate('Amount')}</th>
        <th>{translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component: OfferingComponent, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">{component.name}</div>
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`quotas.${component.type}`}
              type="number"
              validate={validateNonNegative}
              inputMode="numeric"
              parse={parseIntField}
              format={formatIntField}
            />
          </td>
          <td>
            <div className="form-control-static">{component.measured_unit}</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
