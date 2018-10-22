import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';

import { STEPS, OfferingStep } from '../types';
import { AccountingStepContainer } from './AccountingStepContainer';
import { DescriptionStepContainer } from './DescriptionStepContainer';
import { ManagementStepContainer } from './ManagementStepContainer';
import { OverviewStep } from './OverviewStep';
import { ReviewStep } from './ReviewStep';
import { Wizard } from './Wizard';

const TABS = {
  Overview: OverviewStep,
  Description: DescriptionStepContainer,
  Management: ManagementStepContainer,
  Accounting: AccountingStepContainer,
  Review: ReviewStep,
};

interface OfferingCreateDialogProps extends InjectedFormProps {
  step: OfferingStep;
  createOffering(): void;
  loadData(): void;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  setStep(step: string): void;
  disabled: boolean;
  isLastStep: boolean;
  goBack(): void;
  goNext(): void;
}

export class OfferingCreateDialog extends React.Component<OfferingCreateDialogProps> {
  componentDidMount() {
    if (this.props.disabled) {
      return $state.go('errorPage.notFound');
    }
    this.props.loadData();
  }

  render() {
    const {
      loading,
      loaded,
      erred,
      handleSubmit,
      createOffering,
      ...rest} = this.props;

    if (loading) {
      return <LoadingSpinner/>;
    } else if (erred) {
      return <p>Unable to load data.</p>;
    } else if (loaded) {
      return (
        <Row>
          <Col lg={10} lgOffset={1}>
            <form
              onSubmit={handleSubmit(createOffering)}
              className="form-horizontal">
              <Wizard steps={STEPS} tabs={TABS} {...rest}/>
            </form>
          </Col>
        </Row>
      );
    }
  }
}
