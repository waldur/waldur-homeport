import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';

import { translate } from '@waldur/i18n';

import { PlanAddButton } from './PlanAddButton';
import { PlanPanel } from './PlanPanel';

export const PlansList = props => (
  <div className="form-group">
    <Col smOffset={2} sm={8} className="m-b-sm">
      <p className="form-control-static">
        <strong>{translate('Accounting plans')}</strong>
      </p>
    </Col>

    <Col smOffset={2} sm={8}>
      {props.fields.map((plan, index) => (
        <PlanPanel
          key={index}
          plan={plan}
          index={index}
          onRemove={props.fields.remove}
        />
      ))}
      <PlanAddButton onClick={() => props.fields.push({})} />
    </Col>
  </div>
);
