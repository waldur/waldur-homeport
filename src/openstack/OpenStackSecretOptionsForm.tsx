import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { DefaultOfferingEditPanel } from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditField } from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@/marketplace/offerings/update/integration/types';

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
