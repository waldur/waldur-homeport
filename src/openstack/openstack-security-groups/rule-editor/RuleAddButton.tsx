import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { FieldArrayFieldsProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { EthernetType } from '@waldur/openstack/types';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

import { Rule } from './types';

interface RuleAddButtonProps {
  fields: FieldArrayFieldsProps<Rule>;
}

const DEFAULT_RULE = {
  ethertype: 'IPv4' as EthernetType,
  protocol: 'tcp',
  direction: 'ingress',
  port_range: { min: 443, max: 443 },
};

export const RuleAddButton: FC<RuleAddButtonProps> = ({ fields }) => (
  <CompactActionButton
    action={() => fields.push(DEFAULT_RULE)}
    title={translate('Add rule')}
    iconNode={<PlusIcon weight="bold" />}
    variant="primary"
  />
);
