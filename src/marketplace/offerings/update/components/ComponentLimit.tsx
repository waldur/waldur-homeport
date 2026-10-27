import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { BillingTypeEnum, ProviderOfferingDetails } from 'waldur-js-client';

import { ComponentAccountingTypeWrapper } from './ComponentAccountingTypeWrapper';
import { ComponentBooleanDefaultLimitField } from './ComponentBooleanDefaultLimitField';
import { ComponentBooleanLimitField } from './ComponentBooleanLimitField';
import { ComponentDecimalPlacesField } from './ComponentDecimalPlacesField';
import { ComponentLegacyUsageLimit } from './ComponentLegacyUsageLimit';
import {
  ComponentLimitPeriodField,
  LimitPeriodOption,
} from './ComponentLimitPeriodField';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';
import { ComponentSpendingLimitPeriodsField } from './ComponentSpendingLimitPeriodsField';

interface Values {
  billing_type?: {
    value: BillingTypeEnum;
  };
  limit_period?: LimitPeriodOption;
  is_boolean?: boolean;
  limit_amount?: number;
}

export const ComponentLimit: FC<{
  readOnly?: boolean;
  offering?: ProviderOfferingDetails;
}> = (props) => {
  const { values } = useFormState<Values>({ subscription: { values: true } });
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
          {/* Min, max and precision are one line of small numbers; the
              period is a select with a long label, and the precision field
              carries a description and may carry a warning. Splitting them
              over two rows stops the description wrapping to four lines in a
              column sized for a two-digit number. */}
          <Row className="g-5">
            <Col xs>
              <ComponentMinValueField />
            </Col>
            <Col xs>
              <ComponentMaxValueField />
            </Col>
            <Col xs={6}>
              <ComponentLimitPeriodField
                limitPeriod={values.limit_period}
                readOnly={props.readOnly}
                spaceless
              />
            </Col>
          </Row>
          <Row className="g-5 mt-1">
            <Col xs={12}>
              <ComponentDecimalPlacesField offering={props.offering} />
            </Col>
          </Row>
        </ComponentAccountingTypeWrapper>
      );
    }
  } else if (billingType == 'usage') {
    // Spending limits replace the usage component's own limit_amount, which
    // was never enforced; one already set is shown so it can be cleared.
    return (
      <ComponentAccountingTypeWrapper>
        {typeof values.limit_amount === 'number' && (
          <ComponentLegacyUsageLimit
            amount={values.limit_amount}
            limitPeriod={values.limit_period}
            readOnly={props.readOnly}
          />
        )}
        <ComponentSpendingLimitPeriodsField />
      </ComponentAccountingTypeWrapper>
    );
  }
  return null;
};
