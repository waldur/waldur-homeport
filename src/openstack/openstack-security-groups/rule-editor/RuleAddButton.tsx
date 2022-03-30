import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { FieldArrayFieldsProps } from 'redux-form';

import { translate } from '@waldur/i18n';

import { Rule } from './types';

interface RuleAddButtonProps {
  fields: FieldArrayFieldsProps<Rule>;
}

const DEFAULT_RULE = {
  ethertype: 'IPv4',
  protocol: 'icmp',
  direction: 'ingress',
  port_range: { min: -1, max: -1 },
};

export const RuleAddButton: FC<RuleAddButtonProps> = ({ fields }) => (
  <Button variant="primary" size="sm" onClick={() => fields.push(DEFAULT_RULE)}>
    <i className="fa fa-plus"></i>&nbsp;
    {translate('Add rule')}
  </Button>
);
