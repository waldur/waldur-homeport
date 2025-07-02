import { FunctionComponent, useMemo } from 'react';

import { NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const OpenStackPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const fields = useMemo(
    () =>
      (
        [
          {
            label: translate('Default internal network MTU'),
            key: 'plugin_options.default_internal_network_mtu',
            component: NumberField,
          },
          props.offering.plugin_options?.storage_mode == 'dynamic' && {
            label: translate('Snapshot size limit'),
            key: 'plugin_options.snapshot_size_limit_gb',
            component: NumberField,
            description: translate(
              'Additional space to apply to storage quota to be used by snapshots.',
            ),
            fieldProps: { unit: 'GB' },
          },
          {
            label: translate('Maximum number of instances in a single tenant'),
            key: 'plugin_options.max_instances',
            component: NumberField,
          },
          {
            label: translate('Maximum number of volumes in a single tenant'),
            key: 'plugin_options.max_volumes',
            component: NumberField,
          },
        ] satisfies OfferingEditField[]
      ).filter(Boolean),
    [props],
  );

  return <DefaultOfferingEditPanel fields={fields} {...props} />;
};
