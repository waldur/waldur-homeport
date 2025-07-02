import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { NumberField } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const CreditGroup = ({ customer }: { customer: Customer }) => {
  if (
    !isFeatureVisible(ProjectFeatures.show_credit_in_create_dialog) ||
    !customer?.customer_unallocated_credit
  ) {
    return null;
  }

  const valueFieldDescriptionData = {
    currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
    customer_credit: defaultCurrency(customer?.customer_unallocated_credit),
  };

  return (
    <FormGroup
      label={translate('Allocate credit to the project (optional)')}
      controlId="project_credit"
    >
      <Field
        component={NumberField as any}
        name="project_credit"
        placeholder={defaultCurrency(0)}
        customer={customer}
      />

      <Form.Text className="text-muted">
        {translate(
          'Credits available for this organization: {customer_credit}',
          valueFieldDescriptionData,
          formatJsxTemplate,
        )}
      </Form.Text>
    </FormGroup>
  );
};
