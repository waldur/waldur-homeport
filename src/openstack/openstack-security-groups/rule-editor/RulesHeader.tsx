import { FC } from 'react';

import { translate } from '@waldur/i18n';

export const RulesHeader: FC = () => (
  <tr>
    <th>{translate('Ethernet type')}</th>
    <th>{translate('Direction')}</th>
    <th>{translate('IP protocol')}</th>
    <th>{translate('From port')}</th>
    <th>{translate('To port')}</th>
    <th>{translate('Remote CIDR')}</th>
    <th>{translate('Remote security group')}</th>
    <th>{translate('Description')}</th>
    <th>{translate('Actions')}</th>
  </tr>
);
