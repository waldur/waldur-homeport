import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const SecurityGroupRuleHeader: FunctionComponent = () => (
  <>
    <th>{translate('Ethernet type')}</th>
    <th>{translate('Direction')}</th>
    <th>{translate('IP protocol')}</th>
    <th>{translate('Port range')}</th>
    <th>{translate('Remote CIDR')}</th>
    <th>{translate('Remote security group')}</th>
    <th>{translate('Description')}</th>
  </>
);
