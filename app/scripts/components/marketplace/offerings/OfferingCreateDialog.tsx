import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FieldError } from '@waldur/form-react';
import { StepsList } from '@waldur/marketplace/common/StepsList';

import { ActionButtons } from './ActionButtons';
import { OfferingConfigureStep } from './OfferingConfigureStep';
import { OfferingDescribeStep } from './OfferingDescribeStep';
import { STEPS } from './types';

export const OfferingCreateDialog = props => (
  <Row>
    <Col lg={8} lgOffset={1}>
      <form
        onSubmit={props.handleSubmit(props.createOffering)}
        className="form-horizontal">
        <StepsList choices={STEPS} value={props.step}/>
        {props.step === 'Describe' && (
          <OfferingDescribeStep {...props}/>
        )}
        {props.step === 'Configure' && (
          <OfferingConfigureStep {...props}/>
        )}
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-9">
            <FieldError error={props.error}/>
            <ActionButtons step={props.step} {...props}/>
          </div>
        </div>
      </form>
    </Col>
  </Row>
);
