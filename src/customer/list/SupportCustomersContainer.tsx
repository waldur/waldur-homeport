import * as React from 'react';

import { Panel } from '@waldur/core/Panel';
import { SupportCustomerList } from '@waldur/customer/list/SupportCustomerList';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

export const SupportCustomersContainer = () => {
  useTitle(translate('Organizations'));
  return (
    <Panel>
      <SupportCustomerList />
    </Panel>
  );
};
