import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import {
  WizardFinalForm,
  WizardFinalFormStepProps,
} from '@waldur/form/WizardFinalForm';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const Step3PurchaseOrder: FC<WizardFinalFormStepProps> = (props) => {
  return (
    <WizardFinalForm {...props}>
      <FormGroup
        label={translate('Purchase order reference')}
        description={translate(
          'Enter the PO number or name required by your organization to renew this subscription.',
        )}
      >
        <Row>
          <Col sm={6} md={5} lg={4}>
            <Field
              name="purchase_order_reference"
              component={StringField as any}
            />
          </Col>
        </Row>
      </FormGroup>
    </WizardFinalForm>
  );
};
