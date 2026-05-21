import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { marketplacePublicOfferingsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@/marketplace/details/plan/PlanSelectField';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values } = useFormState({
    subscription: { values: true },
  });

  const { offering, plan, limits } = values;
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
        <div className="size-lg">
          <p>
            <strong>{translate('Offering')}: </strong>
            {queryData.data.category_title} / {queryData.data.name}
          </p>
          {plans.length && (
            <>
              <div className="d-flex gap-6 pb-6 border-bottom mb-7">
                <div className="flex-grow-1">
                  <PlanSelectField plans={plans} />
                </div>
                <PlanDescriptionButton />
              </div>
              <TabbedPlanComponents
                offering={queryData.data}
                plan={plan}
                limits={limits}
              />
            </>
          )}
        </div>
      )}
    </WizardForm>
  );
};
