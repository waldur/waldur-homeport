import { useRouter } from '@uirouter/react';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { useSidebarKey } from '@waldur/navigation/context';
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

export const getTabLabel = (tab: string) =>
  ({
    Overview: translate('Overview'),
    Description: translate('Description'),
    Management: translate('Management'),
    Accounting: translate('Accounting'),
    Review: translate('Review'),
  }[tab] || tab);

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
  useSidebarKey('marketplace-services');

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

  const { loading, loaded, erred, handleSubmit, createOffering, ...rest } =
    props;

  if (loading) {
    return <LoadingSpinner />;
  } else if (erred) {
    return <p>{translate('Unable to load data.')}</p>;
  } else if (loaded) {
    return (
      <Row>
        <Col lg={{ span: 10, offset: 1 }}>
          <form onSubmit={handleSubmit(createOffering)}>
            <Wizard
              steps={STEPS}
              tabs={TABS}
              {...rest}
              mountOnEnter={true}
              getTabLabel={getTabLabel}
            />
          </form>
        </Col>
      </Row>
    );
  }
};
