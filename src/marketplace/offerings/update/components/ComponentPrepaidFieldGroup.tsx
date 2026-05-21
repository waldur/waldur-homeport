import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';
import {
  BillingTypeEnum,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { NumberField, SelectField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { ComponentAccountingTypeWrapper } from './ComponentAccountingTypeWrapper';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';

interface Values {
  billing_type?: {
    value: BillingTypeEnum;
  };
  is_prepaid?: boolean;
}

export const ComponentPrepaidFieldGroup: FC<{
  offering: ProviderOfferingDetails;
}> = (props) => {
  const { values } = useFormState<Values>();
  const billingType = values.billing_type?.value;
  const isPrepaid = values.is_prepaid;

  return billingType == 'one' ? (
    <ComponentAccountingTypeWrapper>
      <Row className="g-5 mb-5">
        <Col xs>
          <ComponentMinValueField />
        </Col>
        <Col xs>
          <ComponentMaxValueField />
        </Col>
      </Row>
      <FormGroup space={5}>
        <Field
          name="is_prepaid"
          component={AwesomeCheckboxField}
          label={translate('Pre-paid component')}
          alignMiddle
        />
      </FormGroup>
      {isPrepaid ? (
        <>
          <Row className="g-5 mb-5">
            <Col xs>
              <FormGroup label={translate('Min duration')} spaceless>
                <Field name="min_prepaid_duration" component={NumberField} />
              </FormGroup>
            </Col>
            <Col xs>
              <FormGroup label={translate('Max duration')} spaceless>
                <Field name="max_prepaid_duration" component={NumberField} />
              </FormGroup>
            </Col>
            <Col xs>
              <FormGroup label={translate('Duration step')} spaceless>
                <Field name="prepaid_duration_step" component={NumberField} />
              </FormGroup>
            </Col>
            <Col xs={4}>
              <FormGroup label={translate('Overage component')} spaceless>
                <Field
                  name="overage_component"
                  component={SelectField}
                  options={props.offering.components.filter(
                    (component) => component.billing_type == 'usage',
                  )}
                  getOptionValue={(option: OfferingComponent) => option.uuid}
                  getOptionLabel={(option: OfferingComponent) => option.name}
                  simpleValue
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className="g-5">
            <Col xs>
              <FormGroup label={translate('Min renewal duration')} spaceless>
                <Field name="min_renewal_duration" component={NumberField} />
              </FormGroup>
            </Col>
            <Col xs>
              <FormGroup label={translate('Max renewal duration')} spaceless>
                <Field name="max_renewal_duration" component={NumberField} />
              </FormGroup>
            </Col>
            <Col xs>
              <FormGroup label={translate('Renewal duration step')} spaceless>
                <Field name="renewal_duration_step" component={NumberField} />
              </FormGroup>
            </Col>
          </Row>
        </>
      ) : null}
    </ComponentAccountingTypeWrapper>
  ) : null;
};
