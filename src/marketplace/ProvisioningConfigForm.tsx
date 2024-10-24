import { FC } from 'react';

import { TextField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

export const ProvisioningConfigForm: FC<OfferingEditPanelFormProps> = (
  props,
) => (
  <FormTable.Item
    label={translate('Confirmation notification template')}
    value={
      props.offering.secret_options?.template_confirmation_comment || 'N/A'
    }
    actions={
      <FieldEditButton
        title={props.title}
        scope={props.offering}
        name="secret_options.template_confirmation_comment"
        callback={props.callback}
        fieldComponent={TextField}
      />
    }
  />
);
