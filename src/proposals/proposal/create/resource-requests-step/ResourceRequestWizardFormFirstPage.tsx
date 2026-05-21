import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const ResourceRequestWizardFormFirstPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicCall', props.data.call.uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: props.data.call.uuid },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });
  const options = useMemo(() => {
    if (!call) return [];
    return (
      call.offerings
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ options, ...rest }) => ({ ...rest })) // To avoid error on react-select because of group options
        .filter((opt) => Boolean(opt.plan))
    );
  }, [call]);
  const {
    values: { offering },
  } = useFormState({ subscription: { values: true } });
  const { change } = useForm();

  return (
    <WizardForm {...(props as any)}>
      <div className="size-lg row">
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
            getOptionLabel={(option) => option.offering_name}
            placeholder={translate('Select offering...')}
            isLoading={isLoading}
            noUpdateOnBlur
            validate={required}
            onChange={(value) => {
              if (value?.uuid !== offering?.uuid) {
                change('plan', value.plan);
              }
            }}
          />
        )}
        {offering && (
          <p>
            <strong>{translate('Service provider')}: </strong>
            {offering.provider_name}
          </p>
        )}
      </div>
    </WizardForm>
  );
};
