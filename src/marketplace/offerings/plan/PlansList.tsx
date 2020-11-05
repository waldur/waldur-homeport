import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { connect } from 'react-redux';
import { WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';

import { offeringFormValueSelector } from '../store/selectors';

import { PlanAddButton } from './PlanAddButton';
import { PlanPanel } from './PlanPanel';

const PlansListComponent = (
  props: WrappedFieldArrayProps & { canAddPlan: boolean },
) => (
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

      {props.canAddPlan && (
        <PlanAddButton onClick={() => props.fields.push({})} />
      )}
    </Col>
  </div>
);

const mapStateToProps = (state, ownProps) => ({
  canAddPlan: !hidePlanAddButton(
    offeringFormValueSelector(state, 'type')?.value,
    ownProps.fields,
  ),
});

export const PlansList = connect(mapStateToProps, null)(PlansListComponent);
