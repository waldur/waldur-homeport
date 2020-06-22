import { useRouter } from '@uirouter/react';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { useTitle } from '@waldur/navigation/title';

import { STEPS, OfferingStep } from '../types';
import { getBreadcrumbs } from '../utils';

import { AccountingStepContainer } from './AccountingStepContainer';
import { DescriptionStepContainer } from './DescriptionStepContainer';
import { ManagementStepContainer } from './ManagementStepContainer';
import { OverviewStep } from './OverviewStep';
import { ReviewStep } from './ReviewStep';
import { Wizard } from './Wizard';

export const TABS = {
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
  setTitle(title: string): void;
  disabled: boolean;
  isLastStep: boolean;
  goBack(): void;
  goNext(): void;
}

export const OfferingCreateDialog: React.FC<OfferingCreateDialogProps> = (
  props,
) => {
  useTitle(translate('Add offering'));

  useBreadcrumbsFn(getBreadcrumbs, []);

  const router = useRouter();

  React.useEffect(() => {
    if (props.disabled) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    props.loadData();
    props.setStep(STEPS[0]);
  }, []);

  const {
    loading,
    loaded,
    erred,
    handleSubmit,
    createOffering,
    ...rest
  } = props;

  if (loading) {
    return <LoadingSpinner />;
  } else if (erred) {
    return <p>{translate('Unable to load data.')}</p>;
  } else if (loaded) {
    return (
      <Row>
        <Col lg={10} lgOffset={1}>
          <form
            onSubmit={handleSubmit(createOffering)}
            className="form-horizontal"
          >
            <Wizard steps={STEPS} tabs={TABS} {...rest} />
          </form>
        </Col>
      </Row>
    );
  }
};
