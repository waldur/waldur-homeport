import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { FieldArrayFieldsProps } from 'redux-form';

import { translate } from '@waldur/i18n';

import { Rule } from './types';

interface Props {
  fields: FieldArrayFieldsProps<Rule>;
}

const DEFAULT_RULE = {
  ethertype: 'IPv4',
  protocol: 'icmp',
  direction: 'ingress',
  from_port: -1,
  to_port: -1,
};

export const RuleAddButton: FC<Props> = ({ fields }) => (
  <Button
    bsStyle="primary"
    bsSize="sm"
    onClick={() => fields.push(DEFAULT_RULE)}
  >
    <i className="fa fa-plus"></i>&nbsp;
    {translate('Add rule')}
  </Button>
);
