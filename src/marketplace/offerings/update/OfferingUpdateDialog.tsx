import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { DescriptionStepContainer } from '../create/DescriptionStepContainer';
import { OverviewStep } from '../create/OverviewStep';
import { Wizard } from '../create/Wizard';
import { STEPS, OfferingStep } from '../types';

interface OfferingUpdateDialogProps extends InjectedFormProps {
  step: OfferingStep;
  updateOffering(): void;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  disabled: boolean;
  isLastStep: boolean;
  goBack(): void;
  goNext(): void;
  loadOffering(offeringUuid: string): void;
}

const TABS = {
  Overview: OverviewStep,
  Description: DescriptionStepContainer,
};

export class OfferingUpdateDialog extends React.Component<OfferingUpdateDialogProps> {
  componentDidMount() {
    if (this.props.disabled) {
      return $state.go('errorPage.notFound');
    }
    this.props.loadOffering($state.params.offering_uuid);
  }

  render() {
    const {
      loading,
      loaded,
      erred,
      handleSubmit,
      updateOffering,
      ...rest} = this.props;

    if (loading) {
      return <LoadingSpinner/>;
    } else if (erred) {
      return <p>{translate('Unable to load data.')}</p>;
    } else if (loaded) {
      return (
        <Row>
          <Col lg={10} lgOffset={1}>
            <form
              onSubmit={handleSubmit(updateOffering)}
              className="form-horizontal">
              <Wizard steps={[STEPS[0], STEPS[1]]} tabs={TABS} {...rest}/>
            </form>
          </Col>
        </Row>
      );
    }
  }
}
