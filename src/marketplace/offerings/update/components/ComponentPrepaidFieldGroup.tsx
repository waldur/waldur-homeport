import { Col, Row } from 'react-bootstrap';
import { Field, formValues } from 'redux-form';
import {
  BillingTypeEnum,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { NumberField, SelectField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { ComponentAccountingTypeWrapper } from './ComponentAccountingTypeWrapper';

const enhance = formValues<any, { readOnly?: boolean }>(() => ({
  billingType: 'billing_type',
  isPrepaid: 'is_prepaid',
}));

export const ComponentPrepaidFieldGroup = enhance(
  (props: {
    offering: ProviderOfferingDetails;
    billingType: { value: BillingTypeEnum };
    isPrepaid: boolean;
  }) =>
    props.billingType?.value == 'one' ? (
      <ComponentAccountingTypeWrapper>
        <FormGroup space={5}>
          <Field
            name="is_prepaid"
            validate={required}
            component={AwesomeCheckboxField}
            label={translate('Pre-paid component')}
            alignMiddle
          />
        </FormGroup>
        {props.isPrepaid ? (
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
        ) : // <>
        //   <FormGroup label={translate('Minimal prepaid duration')} space={5}>
        //     <Field name="min_prepaid_duration" component={NumberField} />
        //   </FormGroup>
        //   <FormGroup label={translate('Maximal prepaid duration')} space={5}>
        //     <Field name="max_prepaid_duration" component={NumberField} />
        //   </FormGroup>
        //   <FormGroup label={translate('Overage component')} space={5}>
        //     <Field
        //       name="overage_component"
        //       component={SelectField}
        //       options={props.offering.components.filter(
        //         (component) => component.billing_type == 'usage',
        //       )}
        //       getOptionValue={(option: OfferingComponent) => option.uuid}
        //       getOptionLabel={(option: OfferingComponent) => option.name}
        //       simpleValue
        //     />
        //   </FormGroup>
        // </>
        null}
        {/* <ComponentBooleanLimitField />
        <Row className="g-5">
          <Col xs>
            <ComponentMinValueField />
          </Col>
          <Col xs>
            <ComponentMaxValueField />
          </Col>
          <Col xs={5}>
            <ComponentLimitPeriodField
              limitPeriod={props.limitPeriod}
              readOnly={props.readOnly}
              spaceless
            />
          </Col>
        </Row> */}
      </ComponentAccountingTypeWrapper>
    ) : null,
);
