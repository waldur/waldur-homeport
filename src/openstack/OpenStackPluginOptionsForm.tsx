import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { FormContainer, SelectField, NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { pluginOptionsSelector } from '@waldur/marketplace/UserPluginOptionsForm';

import { DYNAMIC_STORAGE_MODE, FIXED_STORAGE_MODE } from './constants';

export const STORAGE_MODE_OPTIONS = [
  {
    label: translate('Fixed — use common storage quota'),
    value: FIXED_STORAGE_MODE,
  },
  {
    label: translate(
      'Dynamic — use separate volume types for tracking pricing',
    ),
    value: DYNAMIC_STORAGE_MODE,
  },
];

export const OpenStackPluginOptionsForm: FunctionComponent<{ container }> = ({
  container,
}) => {
  const pluginOptions = useSelector(pluginOptionsSelector);

  return (
    <FormContainer {...container}>
      <SelectField
        name="storage_mode"
        label={translate('Storage mode')}
        options={STORAGE_MODE_OPTIONS}
        simpleValue={true}
        required={true}
        isClearable={false}
      />
      {pluginOptions && pluginOptions.storage_mode == 'dynamic' && (
        <NumberField
          name="snapshot_size_limit_gb"
          label={translate('Snapshot size limit')}
          unit="GB"
          description={translate(
            'Additional space to apply to storage quota to be used by snapshots.',
          )}
        />
      )}
    </FormContainer>
  );
};
