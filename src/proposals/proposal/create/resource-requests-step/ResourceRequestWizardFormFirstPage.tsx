import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Field } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getPublicCall } from '@waldur/proposals/api';

export const ResourceRequestWizardFormFirstPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['publicCall', props.data.call.uuid],
    () => getPublicCall(props.data.call.uuid),
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );
  const options = useMemo(() => {
    if (!call) return [];
    return call.offerings
      .map((item) => ({
        requested_offering_uuid: item.uuid,
        uuid: item.offering_uuid,
        name: item.offering_name,
        url: item.offering,
        customer_name: item.provider_name,
        attributes: item.attributes,
        plan: item.plan,
      }))
      .filter((opt) => Boolean(opt.plan));
  }, [call]);

  return (
    <WizardForm {...(props as any)} submitDisabled={options.length === 0}>
      {(wizardProps) => {
        const { offering } = wizardProps.formValues;
        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
            className="size-lg row"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred loadData={refetch} />
            ) : options.length === 0 ? (
              <h2 className="text-center text-muted">
                {translate('There are no offerings')}
              </h2>
            ) : (
              <Field<any>
                name="offering"
                options={options}
                isClearable={true}
                component={SelectField}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                placeholder={translate('Select offering') + '...'}
                isLoading={isLoading}
                noUpdateOnBlur
                validate={required}
                onChange={(value) => {
                  if (value?.uuid !== offering?.uuid) {
                    wizardProps.change('plan', value.plan);
                  }
                }}
              />
            )}
            {offering && (
              <p>
                <strong>{translate('Service provider')}: </strong>
                {offering.customer_name}
              </p>
            )}
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
