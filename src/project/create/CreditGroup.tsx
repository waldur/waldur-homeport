import { Customer } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { NumberGroup } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';

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
    <NumberGroup
      name="project_credit"
      label={translate('Allocate credit to the project (optional)')}
      placeholder={defaultCurrency(0)}
      description={translate(
        'Credits available for this organization: {customer_credit}',
        valueFieldDescriptionData,
        formatJsxTemplate,
      )}
      customer={customer}
    />
  );
};
