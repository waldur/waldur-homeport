import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { TABS } from '../create/OfferingCreateDialog';
import { Wizard } from '../create/Wizard';
import { STEPS, OfferingStep } from '../types';
import { setStateBreadcrumbs } from '../utils';

interface OfferingUpdateDialogProps extends InjectedFormProps {
  step: OfferingStep;
  updateOffering(): void;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  disabled: boolean;
  isLastStep: boolean;
  setStep(step: string): void;
  goBack(): void;
  goNext(): void;
  loadOffering(offeringUuid: string): void;
}

export class OfferingUpdateDialog extends React.Component<OfferingUpdateDialogProps> {

  constructor(props) {
    super(props);
    setStateBreadcrumbs();
  }

  componentDidMount() {
    if (this.props.disabled) {
      return $state.go('errorPage.notFound');
    }
    this.props.loadOffering($state.params.offering_uuid);
    this.props.setStep(STEPS[0]);
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
              <Wizard steps={STEPS} tabs={TABS} {...rest} submitLabel={translate('Update')}/>
            </form>
          </Col>
        </Row>
      );
    }
  }
}
