import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import {
  composeValidators,
  lessThanOrEqual,
  required,
} from '@/core/validators';
import { FormGroup, NumberField } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';

export const ProjectAllocateCreditField: FC<{
  organizationCredit: number | string;
  isEdit: boolean;
}> = ({ organizationCredit, isEdit }) => {
  const validate = useMemo(
    () =>
      composeValidators(
        required,
        lessThanOrEqual(Number(organizationCredit ?? 0)),
      ),
    [organizationCredit],
  );

  const valueFieldDescriptionData = {
    currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
    credits: organizationCredit ?? 0,
  };
  return (
    <Field
      name="value"
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      description={
        isEdit
          ? translate(
              'Previously saved credit value for this organization: {currency} {credits}',
              valueFieldDescriptionData,
              formatJsxTemplate,
            )
          : translate(
              'Credits available for this organization: {currency} {credits}',
              valueFieldDescriptionData,
              formatJsxTemplate,
            )
      }
      validate={validate}
      required
      component={FormGroup}
    >
      <NumberField
        placeholder="0"
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
        data-testid="value"
      />
    </Field>
  );
};
