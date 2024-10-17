import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const RancherPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = ({ offering, title, callback }) => {
  return (
    <FormTable.Item
      label={translate('Flavors regex')}
      description={translate('Regular expression to limit flavors list')}
      value={offering.plugin_options?.flavors_regex || 'N/A'}
      actions={
        <FieldEditButton
          title={title}
          scope={offering}
          name="plugin_options.flavors_regex"
          callback={callback}
          fieldComponent={StringField}
        />
      }
    />
  );
};
