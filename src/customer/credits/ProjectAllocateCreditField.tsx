import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import {
  composeValidators,
  lessThanOrEqual,
  required,
} from '@/core/validators';
import { NumberGroup } from '@/form';
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
    <NumberGroup
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
      placeholder="0"
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      data-testid="value"
    />
  );
};
