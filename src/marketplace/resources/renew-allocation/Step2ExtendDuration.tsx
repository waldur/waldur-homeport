import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field as FormField, useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatDate, parseDate } from '@waldur/core/dateUtils';
import {
  composeValidators,
  greaterThanOrEqual,
  lessThanOrEqual,
  required,
} from '@waldur/core/validators';
import { NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Field } from '@waldur/resource/summary';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { RenewalCostBreakdown } from './RenewalCostBreakdown';
import { RenewAllocationFormData } from './types';

const multipleOfStep = (step: number, base: number) => (value: number) =>
  step > 1 && (value - base) % step !== 0
    ? translate(
        'Must be a multiple of {step} starting from {base} (e.g. {example}).',
        { step, base, example: base + step },
      )
    : undefined;

export const Step2ExtendDuration: FC<WizardStepProps> = (props) => {
  const resources: Resource[] = props.data.resources;
  const isMulti = resources?.length > 1;
  const { values } = useFormState<RenewAllocationFormData>();

  const currentEndDate = useMemo(
    () => (resources[0].end_date ? formatDate(resources[0].end_date) : 'N/A'),
    [resources],
  );

  const prepaidComponent = useMemo(
    () => resources[0].offering_components?.find((c) => c.is_prepaid),
    [resources],
  );

  const minMonths = prepaidComponent?.min_renewal_duration ?? 1;
  const maxMonths = prepaidComponent?.max_renewal_duration ?? 60;
  const step = prepaidComponent?.renewal_duration_step ?? 1;

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
              greaterThanOrEqual(minMonths),
              lessThanOrEqual(maxMonths),
              multipleOfStep(step, minMonths),
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
                <NumberField
                  input={input as any}
                  min={minMonths}
                  max={maxMonths}
                  step={step}
                />
              </FormGroup>
            )}
          />
        </Col>
      </Row>
      {!isMulti && (
        <RenewalCostBreakdown
          resource={resources[0]}
          extensionMonths={values.extension_months || 0}
        />
      )}
    </WizardModal>
  );
};
