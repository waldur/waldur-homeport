import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { AlertItem, FormField, FormLabel } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { showsCallContext } from '@/proposals/presentation';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { WizardForm, WizardFormStepProps } from '@/wizard';

/** How many requests of the proposal already use each call offering. */
export const countRequestsByOffering = (
  rows: { uuid: string; requested_offering?: { uuid: string } }[] | undefined,
  excludeRequestUuid?: string,
): Map<string, number> => {
  const counts = new Map<string, number>();
  (rows ?? []).forEach((row) => {
    if (row.uuid === excludeRequestUuid) {
      return;
    }
    const key = row.requested_offering?.uuid;
    if (key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });
  return counts;
};

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

  // A second request on an offering the proposal already asks for is allowed
  // (another configuration, another period) and numbered at allocation, but
  // is more often a slip: say so, do not block. Awards and templates are not
  // proposal requests and pass no proposal, which keeps the query off.
  const isEdit = Boolean(props.data?.editingRequestUuid);
  const { data: existingRows } = useProposalResourceRows(
    props.data?.proposalUuid,
  );
  const requestedCounts = useMemo(
    () => countRequestsByOffering(existingRows, props.data?.editingRequestUuid),
    [existingRows, props.data?.editingRequestUuid],
  );
  const repeatCount = offering?.uuid
    ? (requestedCounts.get(offering.uuid) ?? 0)
    : 0;
  const repeatNotice = !repeatCount
    ? null
    : isEdit
      ? translate(
          'Another request in this proposal already asks for {offering}.',
          { offering: offering.offering_name },
        )
      : repeatCount === 1
        ? translate(
            'You already requested {offering} in this proposal. Add it again only if you need a separate request.',
            { offering: offering.offering_name },
          )
        : translate(
            'You already requested {offering} in this proposal {count} times. Add it again only if you need a separate request.',
            { offering: offering.offering_name, count: repeatCount },
          );

  return (
    <WizardForm {...props}>
      <div>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={refetch} />
        ) : options.length === 0 ? (
          <div className="text-center text-quaternary">
            <h2 className="text-quaternary">
              {translate('There are no offerings to request')}
            </h2>
            {hasPlanlessOfferings ? (
              <p className="mb-0">
                {showsCallContext()
                  ? translate(
                      'This call lists offerings, but none of them has a plan, so none can be requested. Ask the call manager to set one.',
                    )
                  : translate(
                      'The offerings here are not priced yet, so none can be requested. Please contact support.',
                    )}
              </p>
            ) : (
              <p className="mb-0">
                {showsCallContext()
                  ? translate('No offerings have been added to this call yet.')
                  : translate('There is nothing available to request yet.')}
              </p>
            )}
          </div>
        ) : (
          <Field<any> name="offering" validate={required}>
            {({ input, meta }) => (
              <FormField>
                <FormLabel>{translate('Offering')}</FormLabel>
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
                      // Amounts and options belong to the offering they were
                      // entered for: carried over, they name components and
                      // options the new offering does not have, and the
                      // backend refuses the lot.
                      change('limits', {});
                      change('attributes', {});
                    }
                  }}
                />
              </FormField>
            )}
          </Field>
        )}
        {repeatNotice && options.length > 0 && (
          <AlertItem
            variant="warning"
            type="floating"
            className="mt-4"
            title={translate('Already requested in this proposal')}
            body={repeatNotice}
          />
        )}
        {offering && (
          <p className="mt-4">
            <strong>{translate('Service provider')}: </strong>
            {offering.provider_name}
          </p>
        )}
      </div>
    </WizardForm>
  );
};
