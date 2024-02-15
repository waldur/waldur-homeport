import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormContainer } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getPublicOffering } from '@waldur/marketplace/common/api';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable2 } from '@waldur/marketplace/details/plan/PlanDetailsTable2';
import { PlanSelectField } from '@waldur/marketplace/details/plan/PlanSelectField';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { offering, plan, limits } = wizardProps.formValues;

        const queryData = useQuery(
          ['offering', offering?.uuid],
          () => getPublicOffering(offering.uuid),
          {
            staleTime: 3 * 60 * 1000,
          },
        );

        const plans = useMemo(
          () =>
            queryData.data?.plans
              ? queryData.data.plans.filter((plan) => plan.archived === false)
              : [],
          [queryData.data],
        );

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
            {plans.length && (
              <>
                <div className="d-flex gap-6 pb-6 border-bottom mb-7">
                  <div className="flex-grow-1">
                    <PlanSelectField plans={plans} />
                  </div>
                  <PlanDescriptionButton formId={props.form} />
                </div>
                <PlanDetailsTable2
                  offering={queryData.data}
                  plan={plan}
                  limits={limits}
                />
              </>
            )}
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
