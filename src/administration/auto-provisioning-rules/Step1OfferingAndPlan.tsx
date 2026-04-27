import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Col, FormLabel } from 'react-bootstrap';
import { marketplacePublicOfferingsRetrieve } from 'waldur-js-client';

import { STALE_TIME, UI_STALE_TIME } from '@/core/constants';
import { format } from '@/core/ErrorMessageFormatter';
import { LoadingErred } from '@/core/LoadingErred';
import { FormContainer, SelectField } from '@/form';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@/marketplace/details/plan/PlanSelectField';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';

export const Step1OfferingAndPlan: FC<WizardFormStepProps> = (props) => {
  const categoriesQuery = useQuery({
    queryKey: ['marketplaceCategories'],
    queryFn: getCategories,
    staleTime: STALE_TIME,
  });

  const rule = props.data.rule;

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { category, offering, plan, limits, attributes } =
          wizardProps.formValues;

        const [offeringError, setOfferingError] = useState(null);

        const offeringQuery = useQuery({
          queryKey: ['offering', offering?.uuid],
          queryFn: () =>
            !offering?.uuid
              ? null
              : marketplacePublicOfferingsRetrieve({
                  path: { uuid: offering.uuid },
                })
                  .then((response) => {
                    setOfferingError(null);
                    return response.data;
                  })
                  .catch((er) => {
                    setOfferingError(er);
                    return null;
                  }),
          staleTime: UI_STALE_TIME,
          retry: false,
        });

        useEffect(() => {
          if (offeringQuery.data) {
            wizardProps.change('offering', offeringQuery.data);
          }
        }, [offeringQuery?.data]);

        const plans = useMemo(
          () =>
            offeringQuery.isLoading || !offeringQuery?.data?.plans
              ? []
              : offeringQuery.data.plans.filter(
                  (plan) => plan.archived === false,
                ),
          [offeringQuery],
        );

        // We cannot directly use the 'plan' in edit mode because it lacks plan details when initialized.
        const selectedPlan = useMemo(
          () => (plan ? plans.find((p) => p.url === plan.url) : null),
          [plans, plan],
        );

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            className="size-lg"
            asRow
          >
            <SelectField
              name="category"
              label={translate('Category')}
              options={categoriesQuery.data}
              isClearable={false}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.title}
              isLoading={categoriesQuery.isLoading}
              containerClassName="col-md-6"
              onChange={(v) => {
                if (v.uuid !== category?.uuid) {
                  wizardProps.change('offering', null);
                }
              }}
            />
            <AsyncSelectField
              key={category?.uuid}
              name="offering"
              label={translate('Offering')}
              placeholder={translate('Select offering...')}
              loadOptions={(query, prevOptions, page) =>
                publicOfferingsAutocomplete(
                  { name: query, category_uuid: category.uuid },
                  prevOptions,
                  page,
                  ['uuid', 'name'],
                )
              }
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isLoading={offeringQuery.isRefetching}
              isDisabled={!category}
              containerClassName="col-md-6"
              onChange={(v) => {
                if (v.uuid !== offering?.uuid) {
                  wizardProps.change('plan', null);
                  wizardProps.change('limits', null);
                  if (attributes?.description) {
                    wizardProps.change('attributes', {
                      description: attributes?.description,
                    });
                  } else {
                    wizardProps.change('attributes', null);
                  }
                }
              }}
            />
            {offeringError && !offeringQuery.isRefetching ? (
              <LoadingErred
                loadData={offeringQuery.refetch}
                message={
                  offeringError?.detail
                    ? offeringError.detail
                    : format(offeringError)
                }
              />
            ) : null}
            <Col>
              <FormLabel>{translate('Plan')}</FormLabel>
              <div className="d-flex gap-6 pb-6 border-bottom mb-7">
                <div className="flex-grow-1">
                  <PlanSelectField
                    plans={plans}
                    isLoading={offeringQuery.isLoading}
                    isDisabled={!offering}
                  />
                </div>
                <PlanDescriptionButton formId={props.form} />
              </div>
              {offeringQuery.data && selectedPlan && (
                <TabbedPlanComponents
                  offering={offeringQuery.data}
                  plan={selectedPlan}
                  limits={limits}
                  customer={{ url: rule.customer }}
                />
              )}
            </Col>
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
