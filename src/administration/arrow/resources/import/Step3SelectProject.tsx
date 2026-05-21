import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { formatJsxTemplate, translate } from '@/i18n';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step3SelectProject: FC<WizardFormStepProps> = (props) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const customerUuid = values?.customerMapping?.waldur_customer_uuid;
  const customerName = values?.customerMapping?.waldur_customer_name;
  return (
    <WizardForm {...props}>
      <div>
        <p className="text-muted mb-5">
          {translate(
            'Select the project within {customer} where resources will be created.',
            { customer: <strong>{customerName}</strong> },
            formatJsxTemplate,
          )}
        </p>
        <ProjectFilter
          customer_uuid={customerUuid}
          placeholder={translate('Select a project...')}
          validator={required}
        />
      </div>
    </WizardForm>
  );
};
