import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

interface Props {
  components: OfferingComponent[];
}

export const OfferingLimitsTable: React.FC<Props> = props => (
  <div className="form-group">
    <Col smOffset={2} sm={8} className="m-b-sm">
      <p className="form-control-static">
        <strong>{translate('Offering components')}</strong>
      </p>
    </Col>
    <Col smOffset={2} sm={8}>
      <table className="table table-borderless">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th>{translate('Min amount')}</th>
            <th>{translate('Max amount')}</th>
          </tr>
        </thead>
        <tbody>
          {props.components.map((component, index) => (
            <tr key={index}>
              <td>
                <div className="form-control-static">{component.name}</div>
              </td>
              <td>
                <Field
                  component="input"
                  min={0}
                  className="form-control"
                  name={`limits.${component.type}.min`}
                  type="number"
                  parse={parseIntField}
                  format={formatIntField}
                />
              </td>
              <td>
                <Field
                  component="input"
                  min={0}
                  className="form-control"
                  name={`limits.${component.type}.max`}
                  type="number"
                  parse={parseIntField}
                  format={formatIntField}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Col>
  </div>
);
