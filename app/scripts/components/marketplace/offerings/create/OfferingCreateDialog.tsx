import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FieldError } from '@waldur/form-react';
import { StepsList } from '@waldur/marketplace/common/StepsList';

import { STEPS, OfferingStep } from '../types';
import { ActionButtonsContainer } from './ActionButtonsContainer';
import { OfferingConfigurationContainer } from './OfferingConfigurationContainer';
import { OfferingDescribeStep } from './OfferingDescribeStep';

interface OfferingCreateDialogProps extends InjectedFormProps {
  step: OfferingStep;
  createOffering(): void;
  loadData(): void;
  loading: boolean;
  loaded: boolean;
}

export class OfferingCreateDialog extends React.Component<OfferingCreateDialogProps> {
  componentDidMount() {
    this.props.loadData();
  }

  render() {
    const props = this.props;

    if (props.loading) {
      return <LoadingSpinner/>;
    } else if (props.loaded) {
      return (
        <Row>
          <Col lg={8} lgOffset={1}>
            <form
              onSubmit={props.handleSubmit(props.createOffering)}
              className="form-horizontal">
              <StepsList choices={STEPS} value={props.step}/>
              {props.step === 'Describe' && (
                <OfferingDescribeStep submitting={props.submitting}/>
              )}
              {props.step === 'Configure' && (
                <OfferingConfigurationContainer/>
              )}
              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-9">
                  <FieldError error={props.error}/>
                  <ActionButtonsContainer/>
                </div>
              </div>
            </form>
          </Col>
        </Row>
      );
    }
  }
}
