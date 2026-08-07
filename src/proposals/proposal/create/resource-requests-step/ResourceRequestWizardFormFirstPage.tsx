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
        // Only an offering with a plan can be priced, so only those can be
        // requested. A call can carry accepted offerings without one.
        .filter((opt) => Boolean(opt.plan))
    );
  }, [call]);

  // Distinguish "this call offers nothing" from "it offers things that are not
  // requestable" — the second is a call misconfiguration the applicant cannot
  // act on, and saying only "there are no offerings" sends them hunting.
  const hasPlanlessOfferings = Boolean(
    call?.offerings?.length && options.length === 0,
  );
  const {
    values: { offering },
  } = useFormState({ subscription: { values: true } });
  const { change } = useForm();

  return (
    <WizardForm {...props}>
      <div className="size-lg row">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={refetch} />
        ) : options.length === 0 ? (
          <div className="text-center text-muted">
            <h2 className="text-muted">
              {translate('There are no offerings to request')}
            </h2>
            {hasPlanlessOfferings ? (
              <p className="mb-0">
                {translate(
                  'This call lists offerings, but none of them has a plan, so none can be requested. Ask the call manager to set one.',
                )}
              </p>
            ) : (
              <p className="mb-0">
                {translate('No offerings have been added to this call yet.')}
              </p>
            )}
          </div>
        ) : (
          <Field<any> name="offering" validate={required}>
            {({ input, meta }) => (
              <SelectField
                input={input}
                meta={meta}
                options={options}
                isClearable={true}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.offering_name}
                placeholder={translate('Select offering...')}
                isLoading={isLoading}
                noUpdateOnBlur
                onChange={(value) => {
                  input.onChange(value);
                  if (value?.uuid !== offering?.uuid) {
                    change('plan', value?.plan);
                  }
                }}
              />
            )}
          </Field>
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
