import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useEffect } from 'react';
import { marketplacePublicOfferingsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { FormContainer } from '@/form';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';

export const ResourceRequestWizardFormSecondPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { offering, mainOffering, plan, limits } = wizardProps.formValues;

        const queryData = useQuery({
          queryKey: ['offering', offering?.offering_uuid],

          queryFn: () =>
            marketplacePublicOfferingsRetrieve({
              path: { uuid: offering.offering_uuid },
            }).then((response) => response.data),

          staleTime: UI_STALE_TIME,
        });

        // Store the main offering, so that we can access to it in other steps
        useEffect(() => {
          if (mainOffering?.uuid !== queryData.data?.uuid) {
            wizardProps.change('mainOffering', queryData.data);
            // On edit mode, the plan field is an url, so we need to get the plan object from the main offering
            if (queryData?.data?.plans) {
              if (typeof plan === 'string') {
                const planUuid = getUUID(plan);
                const planObject = queryData.data.plans.find(
                  (p) => p.uuid === planUuid,
                );
                if (planObject) {
                  wizardProps.change('plan', planObject);
                }
              } else if (typeof plan !== 'object') {
                wizardProps.change('plan', null);
              }
            }
          }
        }, [queryData.data, mainOffering, plan]);

        return queryData.isLoading ? (
          <LoadingSpinner />
        ) : queryData.isError ? (
          <LoadingErred loadData={queryData.refetch} />
        ) : (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
            className="size-lg"
          >
            <p>
              <strong>{translate('Offering')}: </strong>
              {queryData.data.category_title} / {queryData.data.name}
            </p>
            {typeof plan === 'object' && (
              <>
                <div className="d-flex gap-6 pb-6 border-bottom mb-7">
                  <div className="flex-grow-1">
                    <p>
                      <strong>{translate('Plan')}: </strong>
                      {plan?.name}
                    </p>
                  </div>
                  <PlanDescriptionButton formId={props.form} />
                </div>
                <TabbedPlanComponents
                  offering={queryData.data}
                  plan={plan}
                  limits={limits}
                  customer={{ url: mainOffering?.customer_uuid }}
                />
              </>
            )}
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
