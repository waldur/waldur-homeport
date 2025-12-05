import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field as FormField } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatDate, parseDate } from '@waldur/core/dateUtils';
import {
  composeValidators,
  greaterThan,
  lessThanOrEqual,
  required,
} from '@waldur/core/validators';
import { NumberField } from '@waldur/form';
import {
  WizardFinalForm,
  WizardFinalFormStepProps,
} from '@waldur/form/WizardFinalForm';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Field } from '@waldur/resource/summary';

const MAX_MONTHS = 10 * 12; // 10 years

export const Step2ExtendDuration: FC<WizardFinalFormStepProps> = (props) => {
  const resources: Resource[] = props.data.resources;
  const isMulti = resources?.length > 1;

  const currentEndDate = useMemo(
    () => (resources[0].end_date ? formatDate(resources[0].end_date) : 'N/A'),
    [resources],
  );

  return (
    <WizardFinalForm {...props}>
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
              greaterThan(0),
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
                <NumberField input={input as any} min={1} max={MAX_MONTHS} />
              </FormGroup>
            )}
          />
        </Col>
      </Row>
    </WizardFinalForm>
  );
};
