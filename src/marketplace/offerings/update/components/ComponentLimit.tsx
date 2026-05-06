import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
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
  billing_type?: {
    value: BillingTypeEnum;
  };
  limit_period?: LimitPeriodOption;
  is_boolean?: boolean;
  limit_amount?: number;
}

export const ComponentLimit: FC<{ readOnly?: boolean }> = (props) => {
  const { values } = useFormState<Values>();
  const billingType = values.billing_type?.value;

  if (billingType == 'limit') {
    if (values.is_boolean) {
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
                limitPeriod={values.limit_period}
                readOnly={props.readOnly}
                spaceless
              />
            </Col>
          </Row>
        </ComponentAccountingTypeWrapper>
      );
    }
  } else if (billingType == 'usage') {
    if (typeof values.limit_amount === 'number') {
      return (
        <ComponentAccountingTypeWrapper>
          <ComponentLimitEnableField />
          <Row className="g-5">
            <Col xs={6}>
              <ComponentLimitPeriodField
                limitPeriod={values.limit_period}
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
};
