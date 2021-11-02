import { FC } from 'react';
import { useSelector } from 'react-redux';

import { SecurityGroup } from '../types';

import { ActionsField } from './ActionsField';
import { CIDRField } from './CIDRField';
import { DescriptionField } from './DescriptionField';
import { DirectionField } from './DirectionField';
import { EtherTypeField } from './EtherTypeField';
import { PortRangeField } from './PortRangeField';
import { ProtocolField } from './ProtocolField';
import { RemoteGroupField } from './RemoteGroupField';
import { getRuleSelector } from './utils';

interface RuleRowProps {
  formName: string;
  ruleName: string;
  onRemove(): void;
  remoteSecurityGroups: SecurityGroup[];
}

export const RuleRow: FC<RuleRowProps> = ({
  formName,
  ruleName,
  onRemove,
  remoteSecurityGroups,
}) => {
  const rule = useSelector(getRuleSelector(formName, ruleName));
  return (
    <tr>
      <EtherTypeField />
      <DirectionField />
      <ProtocolField />
      <PortRangeField rule={rule} />
      <CIDRField rule={rule} />
      <RemoteGroupField choices={remoteSecurityGroups} />
      <DescriptionField />
      <ActionsField onRemove={onRemove} />
    </tr>
  );
};
