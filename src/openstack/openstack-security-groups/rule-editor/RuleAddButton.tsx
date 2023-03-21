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
  protocol: 'tcp',
  direction: 'ingress',
  port_range: { min: 443, max: 443 },
};

export const RuleAddButton: FC<RuleAddButtonProps> = ({ fields }) => (
  <Button variant="primary" size="sm" onClick={() => fields.push(DEFAULT_RULE)}>
    <i className="fa fa-plus"></i>&nbsp;
    {translate('Add rule')}
  </Button>
);
