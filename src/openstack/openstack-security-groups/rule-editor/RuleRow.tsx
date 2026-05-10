import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useField } from 'react-final-form';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { CIDRField } from './CIDRField';
import { DescriptionField } from './DescriptionField';
import { DirectionField } from './DirectionField';
import { EtherTypeField } from './EtherTypeField';
import { PortRangeField } from './PortRangeField';
import { ProtocolField } from './ProtocolField';
import { RemoteGroupField } from './RemoteGroupField';

interface RuleRowProps {
  name: string;
  onRemove: () => void;
  remoteSecurityGroups: OpenStackSecurityGroup[];
}

export const RuleRow: FC<RuleRowProps> = ({
  name,
  onRemove,
  remoteSecurityGroups,
}) => {
  const {
    input: { value: ethertype },
  } = useField(`${name}.ethertype`);
  const {
    input: { value: protocol },
  } = useField(`${name}.protocol`);

  return (
    <tr>
      <EtherTypeField name={`${name}.ethertype`} />
      <DirectionField name={`${name}.direction`} />
      <ProtocolField name={`${name}.protocol`} />
      <PortRangeField name={`${name}.port_range`} protocol={protocol} />
      <CIDRField name={`${name}.cidr`} ethertype={ethertype} />
      <RemoteGroupField
        name={`${name}.remote_group`}
        choices={remoteSecurityGroups}
      />
      <DescriptionField name={`${name}.description`} />
      <td>
        <ActionButton
          action={onRemove}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-secondary"
          title={translate('Remove')}
        />
      </td>
    </tr>
  );
};
