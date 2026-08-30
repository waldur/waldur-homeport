import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  marketplacePublicOfferingsRetrieve,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME, UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PrepaidMonthsModeProvider } from '@/marketplace/details/plan/prepaidDurationMode';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';
import { PREPAID_DURATION_MONTHS } from '@/proposals/prepaidDuration';
import { WizardForm, WizardFormStepProps } from '@/wizard';

const PREPAID_MONTHS_FIELD = `attributes.${PREPAID_DURATION_MONTHS}`;

export const ResourceRequestWizardFormSecondPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const form = useForm();
  const { offering, mainOffering, plan, limits, attributes } = values;

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
    }),
    [call?.fixed_duration_in_days, call?.max_prepaid_duration_months],
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
    return {
      uuid: offering.offering_uuid || offering.uuid,
      name: offering.offering_name,
      category_title: offering.category_name,
      components: offering.components ?? [],
      plans: offering.plan_details ? [offering.plan_details] : [],
    } as unknown as typeof queryData.data;
  }, [queryData.data, offering]);

  // Store the main offering, so that we can access to it in other steps
  useEffect(() => {
    if (offeringDetails && mainOffering?.uuid !== offeringDetails.uuid) {
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
        <div className="size-lg">
          <p className="mb-2">
            <strong>{translate('Offering')}: </strong>
            {offeringDetails.category_title} / {offeringDetails.name}
          </p>
          {typeof plan === 'object' && (
            <>
              <div className="d-flex gap-6 border-bottom mb-5">
                <div className="flex-grow-1">
                  <p className="mb-0">
                    <strong>{translate('Plan')}: </strong>
                    {plan?.name}
                  </p>
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
        </div>
      ) : queryData.isError ? (
        <LoadingErred loadData={queryData.refetch} />
      ) : null}
    </WizardForm>
  );
};
