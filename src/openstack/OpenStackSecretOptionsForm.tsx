import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { DefaultOfferingEditPanel } from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditField } from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

import { OpenStackExternalIpsField } from './OpenStackExternalIpsField';

const fields: OfferingEditField[] = [
  {
    label: translate('Mapping of floating to external IPs'),
    key: 'secret_options.ipv4_external_ip_mapping',
    component: OpenStackExternalIpsField,
    value: (value) =>
      value ? (
        <div className="text-pre">
          {value
            .map((item) => `${item.floating_ip}: ${item.external_ip}`)
            .join('\n')}
        </div>
      ) : (
        'N/A'
      ),
  },
];

export const OpenStackSecretOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
