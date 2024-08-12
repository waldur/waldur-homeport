import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { StepCardPlaceholder } from '@waldur/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { formTenantSelector, loadSubnets } from './utils';

export const FormNetworkStep = (props: FormStepProps) => {
  const tenant = useSelector(formTenantSelector);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading } = useQuery(
    ['network-step', tenant],
    () => (tenant ? loadSubnets(tenant) : []),
    { staleTime: 3 * 60 * 1000 },
  );

  useEffect(() => {
    if (data?.length === 1) {
      props.change('attributes.subnet', data[0].value);
    }
  }, [data]);

  return (
    <VStepperFormStepCard
      title={translate('Network')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <Button variant="light" className="text-nowrap" size="sm">
              <span className="svg-icon svg-icon-2">
                <Plus />
              </span>
              {translate('New network')}
            </Button>
          </div>
        ) : null
      }
    >
      {tenant ? (
        <Field
          name="attributes.subnet"
          component={FormGroup}
          label={translate('Subnet')}
          validate={required}
          parse={(subnet) => subnet.value}
          required={true}
        >
          <SelectField
            options={data}
            placeholder={translate('Select subnet') + '...'}
          />
        </Field>
      ) : (
        <StepCardPlaceholder>
          {translate('Please select a tenant first')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
