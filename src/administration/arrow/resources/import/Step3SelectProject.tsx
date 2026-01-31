import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { required } from '@waldur/core/validators';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';

export const Step3SelectProject: FC<WizardFormStepProps> = (props) => {
  const formValues = useSelector(getFormValues(props.form)) as {
    customerMapping?: {
      waldur_customer_uuid: string;
      waldur_customer_name: string;
    };
  };
  const customerUuid = useMemo(
    () => formValues?.customerMapping?.waldur_customer_uuid,
    [formValues?.customerMapping?.waldur_customer_uuid],
  );
  const customerName = useMemo(
    () => formValues?.customerMapping?.waldur_customer_name,
    [formValues?.customerMapping?.waldur_customer_name],
  );

  return (
    <WizardForm {...props} submitDisabledInvalid>
      {() => (
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
      )}
    </WizardForm>
  );
};
