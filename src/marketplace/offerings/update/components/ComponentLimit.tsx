import { Col, Row } from 'react-bootstrap';
import { formValues } from 'redux-form';
import { BillingTypeEnum } from 'waldur-js-client';

import { ComponentAccountingTypeWrapper } from './ComponentAccountingTypeWrapper';
import { ComponentBooleanDefaultLimitField } from './ComponentBooleanDefaultLimitField';
import { ComponentBooleanLimitField } from './ComponentBooleanLimitField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
import { ComponentLimitEnableField } from './ComponentLimitEnableField';
import {
  ComponentLimitPeriodField,
  LimitPeriodOption,
} from './ComponentLimitPeriodField';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';

interface Values {
  billingType: {
    value: BillingTypeEnum;
  };
  limitPeriod: LimitPeriodOption;
  isBoolean: boolean;
  limitAmount?: number;
}

const enhance = formValues<any, { readOnly?: boolean }>(() => ({
  billingType: 'billing_type',
  limitPeriod: 'limit_period',
  isBoolean: 'is_boolean',
  limitAmount: 'limit_amount',
}));

export const ComponentLimit = enhance(
  (props: Values & { readOnly?: boolean }) => {
    const billingType = props.billingType?.value;
    if (billingType == 'limit') {
      if (props.isBoolean) {
        return (
          <ComponentAccountingTypeWrapper>
            <ComponentBooleanLimitField />
            <ComponentBooleanDefaultLimitField />
          </ComponentAccountingTypeWrapper>
        );
      } else {
        return (
          <ComponentAccountingTypeWrapper>
            <ComponentBooleanLimitField />
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
            </Row>
          </ComponentAccountingTypeWrapper>
        );
      }
    } else if (billingType == 'usage') {
      if (typeof props.limitAmount === 'number') {
        return (
          <ComponentAccountingTypeWrapper>
            <ComponentLimitEnableField />
            <Row className="g-5">
              <Col xs={6}>
                <ComponentLimitPeriodField
                  limitPeriod={props.limitPeriod}
                  readOnly={props.readOnly}
                />
              </Col>
              <Col xs={6}>
                <ComponentLimitAmountField />
              </Col>
            </Row>
          </ComponentAccountingTypeWrapper>
        );
      } else {
        return (
          <ComponentAccountingTypeWrapper>
            <ComponentLimitEnableField />
          </ComponentAccountingTypeWrapper>
        );
      }
    }
    return null;
  },
);
