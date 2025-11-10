import { useMemo, useState } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { CustomerResourcesListPlaceholder } from '@waldur/marketplace/resources/list/CustomerResourcesListPlaceholder';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { MetadataGroupBy } from '@waldur/project/metadata/MetadataGroupBy';
import { TableWithTabs } from '@waldur/table/TableWithTabs';
import { TableTab } from '@waldur/table/types';

import { ProviderOfferingUsersListComponent } from './ProviderOfferingUsersList';

const MetadataByAnswer = lazyComponent(() =>
  import('./OfferingsMetadataByAnswer').then((module) => ({
    default: module.OfferingsMetadataByAnswer,
  })),
);

const MetadataByOffering = lazyComponent(() =>
  import('./OfferingsMetadataByOffering').then((module) => ({
    default: module.OfferingsMetadataByOffering,
  })),
);

const ProviderOfferingUsersList = ({ portal, provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <ProviderOfferingUsersListComponent provider={provider} portal={portal} />
  );
};

export const ProviderOfferingUsersWithTabs = ({ provider }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const [metadataGroupBy, setMetadataGroupBy] = useState('answer');

  const tabs = useMemo(() => {
    const _tabs: TableTab[] = [
      {
        key: 'users',
        title: translate('Users'),
        component: ProviderOfferingUsersList,
      },
    ];
    if (showExperimentalUiComponents) {
      if (metadataGroupBy === 'answer') {
        _tabs.push({
          key: 'metadata',
          title: translate('Metadata'),
          component: MetadataByAnswer,
        });
      } else if (metadataGroupBy === 'offering') {
        _tabs.push({
          key: 'metadata',
          title: translate('Metadata'),
          component: MetadataByOffering,
        });
      }
    }
    return _tabs;
  }, [metadataGroupBy]);

  return (
    <TableWithTabs
      title={translate('Offering users')}
      tabs={tabs}
      data={{
        provider,
        hasActionBar: false,
        cardBordered: false,
        fullWidth: true,
      }}
      actions={[
        {
          component: (
            <MetadataGroupBy
              value={metadataGroupBy}
              onChange={setMetadataGroupBy}
              buttons={[
                { value: 'answer', label: translate('Answer') },
                { value: 'offering', label: translate('Offering') },
              ]}
            />
          ),
          activeKeys: ['metadata'],
        },
      ]}
    />
  );
};
