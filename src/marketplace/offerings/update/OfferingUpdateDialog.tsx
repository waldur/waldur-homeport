import { useRouter, useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormFieldsContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { getTabLabel, TABS } from '../create/OfferingCreateDialog';
import { Wizard } from '../create/Wizard';
import { STEPS, OfferingStep } from '../types';
import { getBreadcrumbs } from '../utils';

interface OfferingUpdateDialogProps
  extends InjectedFormProps<{ name: string }> {
  step: OfferingStep;
  updateOffering(): void;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  disabled: boolean;
  readOnlyFields: Array<string>;
  isLastStep: boolean;
  setStep(step: string): void;
  goBack(): void;
  goNext(): void;
  loadOffering(offeringUuid: string): void;
  setIsUpdatingOffering(state: boolean): void;
}

export const OfferingUpdateDialog: React.FC<OfferingUpdateDialogProps> = (
  props,
) => {
  useTitle(
    translate('Updating offering {name}', {
      name: props.initialValues.name,
    }),
  );

  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  React.useEffect(() => {
    if (props.disabled) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    props.loadOffering(offering_uuid);
    props.setIsUpdatingOffering(true);
    props.setStep(STEPS[0]);
    getBreadcrumbs();
  }, [offering_uuid, router]);

  const {
    loading,
    loaded,
    erred,
    handleSubmit,
    updateOffering,
    readOnlyFields,
    ...rest
  } = props;

  if (loading) {
    return <LoadingSpinner />;
  } else if (erred) {
    return <p>{translate('Unable to load data.')}</p>;
  } else if (loaded) {
    return (
      <FormFieldsContext.Provider value={{ readOnlyFields }}>
        <Row>
          <Col lg={10} lgOffset={1}>
            <form onSubmit={handleSubmit(updateOffering)}>
              <Wizard
                steps={STEPS}
                tabs={TABS}
                {...rest}
                submitLabel={translate('Update')}
                mountOnEnter={true}
                getTabLabel={getTabLabel}
              />
            </form>
          </Col>
        </Row>
      </FormFieldsContext.Provider>
    );
  }
};
