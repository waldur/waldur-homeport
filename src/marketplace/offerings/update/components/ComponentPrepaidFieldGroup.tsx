import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import {
  BillingTypeEnum,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { BooleanGroup, NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';

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
      <BooleanGroup
        name="is_prepaid"
        label={translate('Pre-paid component')}
        alignMiddle
        space={5}
      />
      {isPrepaid ? (
        <>
          <Row className="g-5 mb-5">
            <Col xs>
              <NumberGroup
                name="min_prepaid_duration"
                label={translate('Min duration')}
                spaceless
              />
            </Col>
            <Col xs>
              <NumberGroup
                name="max_prepaid_duration"
                label={translate('Max duration')}
                spaceless
              />
            </Col>
            <Col xs>
              <NumberGroup
                name="prepaid_duration_step"
                label={translate('Duration step')}
                spaceless
              />
            </Col>
            <Col xs={4}>
              <SelectGroup
                name="overage_component"
                options={props.offering.components.filter(
                  (component) => component.billing_type == 'usage',
                )}
                getOptionValue={(option: OfferingComponent) => option.uuid}
                getOptionLabel={(option: OfferingComponent) => option.name}
                simpleValue
                label={translate('Overage component')}
                spaceless
              />
            </Col>
          </Row>
          <Row className="g-5">
            <Col xs>
              <NumberGroup
                name="min_renewal_duration"
                label={translate('Min renewal duration')}
                spaceless
              />
            </Col>
            <Col xs>
              <NumberGroup
                name="max_renewal_duration"
                label={translate('Max renewal duration')}
                spaceless
              />
            </Col>
            <Col xs>
              <NumberGroup
                name="renewal_duration_step"
                label={translate('Renewal duration step')}
                spaceless
              />
            </Col>
          </Row>
        </>
      ) : null}
    </ComponentAccountingTypeWrapper>
  ) : null;
};
