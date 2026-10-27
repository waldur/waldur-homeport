import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  marketplacePublicOfferingsRetrieve,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { SHORT_STALE_TIME, UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { SelectField, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PrepaidMonthsModeProvider } from '@/marketplace/details/plan/prepaidDurationMode';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';
import { PREPAID_DURATION_MONTHS } from '@/proposals/prepaidDuration';
import { WizardForm, WizardFormStepProps } from '@/wizard';

const PREPAID_MONTHS_FIELD = `attributes.${PREPAID_DURATION_MONTHS}`;

// The stand-ins built from the call offering while the offering itself loads,
// or when it cannot be retrieved. Told apart by reference: their shape is the
// retrieved offering's, minus most of its plans.
const FALLBACK_OFFERINGS = new WeakSet<object>();
const isFallback = (offering: unknown) =>
  Boolean(offering) && FALLBACK_OFFERINGS.has(offering as object);

export const ResourceRequestWizardFormSecondPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const form = useForm();
  const { offering, mainOffering, plan, limits, attributes } = values;
  const isAward = Boolean(props.data?.award);

  // A call that fixes the duration caps the subscription inside it.
  const { data: call } = useQuery({
    queryKey: ['publicCall', props.data.call.uuid],
    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: props.data.call.uuid },
      }).then((r) => r.data),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const prepaidMonthsMode = useMemo(
    () => ({
      name: PREPAID_MONTHS_FIELD,
      maxEndDate: call?.fixed_duration_in_days
        ? DateTime.now().plus({ days: call.fixed_duration_in_days }).toISODate()
        : undefined,
      maxMonths: call?.max_prepaid_duration_months,
      // An award keeps the period its item carries: it is not seeded with one
      // the item never had, and no end date is measured from today — the
      // award is provisioned from its length.
      keepStored: isAward,
    }),
    [call?.fixed_duration_in_days, call?.max_prepaid_duration_months, isAward],
  );

  const queryData = useQuery({
    queryKey: ['offering', offering?.offering_uuid || offering?.uuid],

    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: offering.offering_uuid || offering.uuid },
      }).then((response) => response.data),

    staleTime: UI_STALE_TIME,
    enabled: !!(offering?.offering_uuid || offering?.uuid),
    // Don't retry for 10s or hijack the whole app when the public endpoint can't
    // serve the offering (e.g. an Unavailable offering — still a valid choice in
    // a call): fail fast and fall back to the call data below.
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  // Prefer the freshly retrieved offering, but fall back to the data already
  // carried by the call's requested offering (values.offering) when the public
  // endpoint 404s it. NestedRequestedOfferingSerializer ships plan_details and
  // components, which is enough to render the preview without the retrieve.
  const offeringDetails = useMemo(() => {
    if (queryData.data) return queryData.data;
    if (!offering) return undefined;
    const fallback = {
      uuid: offering.offering_uuid || offering.uuid,
      name: offering.offering_name,
      category_title: offering.category_name,
      components: offering.components ?? [],
      plans: offering.plan_details ? [offering.plan_details] : [],
      // A request being edited carries its offering's options; without them
      // the options step would vanish whenever the retrieve fails.
      options: offering.options,
    } as unknown as typeof queryData.data;
    FALLBACK_OFFERINGS.add(fallback);
    return fallback;
  }, [queryData.data, offering]);

  // Archived plans cannot be awarded; the backend refuses them.
  const planOptions = useMemo(
    () => (offeringDetails?.plans ?? []).filter((p: any) => !p.archived),
    [offeringDetails],
  );

  // Store the main offering, so that we can access to it in other steps.
  // Another offering replaces it, and the retrieved offering replaces the
  // fallback: on a first open the fallback built above is stored while the
  // retrieve is in flight, and the retrieved offering has the same uuid. Kept
  // by uuid alone, the fallback stayed — without options, so a required one
  // such as a QoS could be skipped, and with only the call's plan, so an
  // award's plan URL never resolved. A refetch, or a rebuilt fallback,
  // changes nothing.
  useEffect(() => {
    if (
      offeringDetails &&
      (mainOffering?.uuid !== offeringDetails.uuid ||
        (isFallback(mainOffering) && !isFallback(offeringDetails)))
    ) {
      form.change('mainOffering', offeringDetails);
      // On edit mode, the plan field is an url, so we need to get the plan object from the main offering
      if (offeringDetails.plans) {
        if (typeof plan === 'string') {
          const planUuid = getUUID(plan);
          const planObject = offeringDetails.plans.find(
            (p) => p.uuid === planUuid,
          );
          if (planObject) {
            form.change('plan', planObject);
          }
        } else if (typeof plan !== 'object') {
          form.change('plan', null);
        }
      }
    }
  }, [offeringDetails, mainOffering, plan, form]);
  return (
    <WizardForm {...props}>
      {queryData.isLoading ? (
        <LoadingSpinner />
      ) : offeringDetails ? (
        <div>
          <p className="mb-2">
            <strong>{translate('Offering')}: </strong>
            {offeringDetails.category_title} / {offeringDetails.name}
          </p>
          {isAward && (
            // The award may put an item on another plan of its offering than
            // the one the call offers; the request always takes the call's.
            <Field<any> name="plan">
              {({ input, meta }) => (
                <FormField className="mb-5">
                  <FormLabel>{translate('Plan')}</FormLabel>
                  <SelectField
                    input={input}
                    meta={meta}
                    options={planOptions}
                    getOptionValue={(option) => option.uuid}
                    getOptionLabel={(option) => option.name}
                    placeholder={translate('Select plan...')}
                    noUpdateOnBlur
                  />
                </FormField>
              )}
            </Field>
          )}
          {typeof plan === 'object' && (
            <>
              <div className="flex gap-6 border-b-[1px] border-b-secondary mb-5">
                <div className="grow">
                  {!isAward && (
                    <p className="mb-0">
                      <strong>{translate('Plan')}: </strong>
                      {plan?.name}
                    </p>
                  )}
                </div>
                <PlanDescriptionButton />
              </div>
              <PrepaidMonthsModeProvider value={prepaidMonthsMode}>
                <TabbedPlanComponents
                  offering={offeringDetails}
                  plan={plan}
                  limits={limits}
                  customer={{ url: mainOffering?.customer_uuid }}
                  prepaidDurationMonths={attributes?.[PREPAID_DURATION_MONTHS]}
                />
              </PrepaidMonthsModeProvider>
            </>
          )}
          {isAward && (
            <TextGroup
              name="description"
              label={translate('Description')}
              maxLength={1000}
              placeholder={translate(
                'Optional note on why the award differs from the request',
              )}
            />
          )}
        </div>
      ) : queryData.isError ? (
        <LoadingErred loadData={queryData.refetch} />
      ) : null}
    </WizardForm>
  );
};
