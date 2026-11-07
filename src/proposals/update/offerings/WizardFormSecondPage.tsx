import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { marketplacePublicOfferingsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@/marketplace/details/plan/PlanSelectField';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values } = useFormState({
    subscription: { values: true },
  });

  const { offering } = values;
  const queryData = useQuery({
    queryKey: ['offering', offering?.uuid],

    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: offering.uuid },
      }).then((response) => response.data),

    staleTime: UI_STALE_TIME,
  });

  const plans = useMemo(
    () =>
      queryData.data?.plans
        ? queryData.data.plans.filter((plan) => plan.archived === false)
        : [],
    [queryData.data],
  );
  return (
    <WizardForm {...props}>
      {queryData.isLoading ? (
        <LoadingSpinner />
      ) : queryData.isError ? (
        <LoadingErred loadData={queryData.refetch} />
      ) : (
        <div>
          <p>
            <strong>{translate('Offering')}: </strong>
            {queryData.data.category_title} / {queryData.data.name}
          </p>
          {plans.length && (
            <>
              <div className="flex gap-5 pb-5 border-b border-b-secondary mb-5.5">
                <div className="grow">
                  <PlanSelectField plans={plans} offering={queryData.data} />
                </div>
                <PlanDescriptionButton />
              </div>
              <p className="text-quaternary mb-0">
                {translate(
                  'What a proposal may request of each component is set on the offering, on the Resources tab, once it is added.',
                )}
              </p>
            </>
          )}
        </div>
      )}
    </WizardForm>
  );
};
