import { FC } from 'react';
import { useSelector } from 'react-redux';

import { SecurityGroup } from '../types';

import { ActionsField } from './ActionsField';
import { CIDRField } from './CIDRField';
import { DescriptionField } from './DescriptionField';
import { DirectionField } from './DirectionField';
import { EtherTypeField } from './EtherTypeField';
import { FromPortField } from './FromPortField';
import { ProtocolField } from './ProtocolField';
import { RemoteGroupField } from './RemoteGroupField';
import { ToPortField } from './ToPortField';
import { getRuleSelector } from './utils';

interface Props {
  name: string;
  onRemove(): void;
  remoteSecurityGroups: SecurityGroup[];
}

export const RuleRow: FC<Props> = ({
  name,
  onRemove,
  remoteSecurityGroups,
}) => {
  const rule = useSelector(getRuleSelector(name));
  return (
    <tr>
      <EtherTypeField />
      <DirectionField />
      <ProtocolField />
      <FromPortField rule={rule} />
      <ToPortField rule={rule} />
      <CIDRField rule={rule} />
      <RemoteGroupField choices={remoteSecurityGroups} />
      <DescriptionField />
      <ActionsField onRemove={onRemove} />
    </tr>
  );
};
