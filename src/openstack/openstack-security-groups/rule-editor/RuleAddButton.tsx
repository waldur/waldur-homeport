import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { FieldArrayFieldsProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { EthernetType } from '@waldur/openstack/types';

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
  <Button variant="primary" size="sm" onClick={() => fields.push(DEFAULT_RULE)}>
    <span className="svg-icon svg-icon-2">
      <PlusIcon weight="bold" />
    </span>
    &nbsp;
    {translate('Add rule')}
  </Button>
);
