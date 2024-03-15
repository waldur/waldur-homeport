import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { ConnectionStatusIndicator } from '@waldur/marketplace/offerings/details/ConnectionStatusIndicator';

const tabs = [
  { key: 'orders', title: translate('Orders') },
  { key: 'resources', title: translate('Resources') },
  { key: 'plans', title: translate('Plans') },
  { key: 'users', title: translate('Users') },
  { key: 'events', title: translate('Events') },
];
export const OfferingDetailsBar: FunctionComponent<any> = (props) => {
  return (
    <PageBarTabs
      tabs={tabs}
      right={
        props.integrationStatus.length > 0 && (
          <ConnectionStatusIndicator status={props.integrationStatus} />
        )
      }
    />
  );
};
