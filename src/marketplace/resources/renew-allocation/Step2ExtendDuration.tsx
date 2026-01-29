import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Field as FormField, useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatDate, parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import {
  composeValidators,
  greaterThanOrEqual,
  lessThanOrEqual,
  required,
} from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { filterOfferingComponents } from '@waldur/marketplace/common/registry';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Field } from '@waldur/resource/summary';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { loadData } from '../change-limits/utils';

import { RenewAllocationFormData } from './types';

const MAX_MONTHS = 60; // 5 years

const getUuid = (resource) =>
  resource.marketplace_resource_uuid || resource.uuid;

// Calculate renewal cost for one-time prepaid components
const RenewalCostEstimate: FC<{
  resource: Resource;
  extensionMonths: number;
}> = ({ resource, extensionMonths }) => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  // Use cached data from Step1
  const { data } = useQuery({
    queryKey: ['ChangeLimitsData', getUuid(resource)],
    queryFn: () => loadData(getUuid(resource)),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const renewalCost = useMemo(() => {
    if (!data?.offering || !data?.plan || !extensionMonths) return null;

    const components = filterOfferingComponents(data.offering);
    const oneTimeComponents = components.filter(
      (c) =>
        (c.billing_type === 'one' || c.billing_type === 'few') && c.is_prepaid,
    );

    if (oneTimeComponents.length === 0) return null;

    // Calculate total cost based on extension months
    let total = 0;
    oneTimeComponents.forEach((component) => {
      const price = data.plan.prices[component.type] || 0;
      // For prepaid components, multiply price by extension months
      total += price * extensionMonths;
    });

    return total;
  }, [data, extensionMonths]);

  if (shouldConcealPrices || renewalCost === null || renewalCost === 0) {
    return null;
  }

  return (
    <Alert variant="info" className="mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <span>{translate('Estimated renewal cost:')}</span>
        <strong className="fs-5">{defaultCurrency(renewalCost)}</strong>
      </div>
      {extensionMonths > 1 && (
        <small className="text-muted">
          {translate('For {months} months extension', {
            months: extensionMonths,
          })}
        </small>
      )}
    </Alert>
  );
};

export const Step2ExtendDuration: FC<WizardStepProps> = (props) => {
  const resources: Resource[] = props.data.resources;
  const isMulti = resources?.length > 1;
  const { values } = useFormState<RenewAllocationFormData>();

  const currentEndDate = useMemo(
    () => (resources[0].end_date ? formatDate(resources[0].end_date) : 'N/A'),
    [resources],
  );

  return (
    <WizardModal {...props}>
      <Row>
        <Col sm={6} md={5} lg={4}>
          {!isMulti && (
            <Field
              label={translate('Current end date')}
              value={currentEndDate}
              labelCol="auto"
              valueCol="auto"
              valueClass="ms-auto"
              className="mb-5"
              xs="auto"
            />
          )}
          <FormField
            name="extension_months"
            validate={composeValidators(
              required,
              greaterThanOrEqual(12),
              lessThanOrEqual(MAX_MONTHS),
            )}
            render={({ input, meta }) => (
              <FormGroup
                label={translate('Extension (months)')}
                description={
                  isMulti
                    ? translate(
                        'New end dates will be calculated automatically for all resources.',
                      )
                    : translate('New end date: {date}', {
                        date: input.value
                          ? formatDate(
                              parseDate(resources[0].end_date).plus({
                                months: Number(input.value),
                              }),
                            )
                          : currentEndDate,
                      })
                }
                meta={meta}
              >
                <NumberField input={input as any} min={12} max={MAX_MONTHS} />
              </FormGroup>
            )}
          />
          {!isMulti && (
            <RenewalCostEstimate
              resource={resources[0]}
              extensionMonths={values.extension_months || 0}
            />
          )}
        </Col>
      </Row>
    </WizardModal>
  );
};
