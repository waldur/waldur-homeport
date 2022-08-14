import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { RootState } from '@waldur/store/reducers';

import { PlanAddButton } from './PlanAddButton';
import { PlanPanel } from './PlanPanel';

const PlansListComponent: FunctionComponent<any> = (props) => {
  return (
    <Form.Group>
      <Col className="mb-2">
        <p>
          <strong>{translate('Accounting plans')}</strong>
        </p>
      </Col>

      <Col>
        {props.fields.map((plan, index) => (
          <PlanPanel
            key={index}
            plan={plan}
            index={index}
            onRemove={props.fields.remove}
          />
        ))}

        {!hidePlanAddButton(props.selectedProvider.value, props.fields) && (
          <PlanAddButton onClick={() => props.fields.push({})} />
        )}
      </Col>
    </Form.Group>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectedProvider: state.form.marketplaceOfferingCreate.values.type,
});

export const PlansList = connect(mapStateToProps, null)(PlansListComponent);
