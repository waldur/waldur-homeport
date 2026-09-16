import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Tooltip } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CustomerResourcesListPlaceholder } from '@/marketplace/resources/list/CustomerResourcesListPlaceholder';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { MetadataGroupBy } from '@/project/metadata/MetadataGroupBy';
import { TableWithTabs } from '@/table/TableWithTabs';
import { TableTab } from '@/table/types';

import { ProviderOfferingUsersList } from './ProviderOfferingUsersList';

const ProviderAccountsList = lazyComponent(() =>
  import('../accounts/ProviderAccountsList').then((module) => ({
    default: module.ProviderAccountsList,
  })),
);

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

const ProviderOfferingUsersListTab = ({ portal, provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingUsersList provider={provider} portal={portal} />;
};

// The difference between the tabs is told on the tabs themselves, so the card
// header stays free for the toolbar.
const tabTitle = (id: string, title: string, help: string) => (
  <span className="d-inline-flex align-items-center gap-1">
    {title}
    <Tooltip id={id} label={help}>
      <QuestionIcon size={14} weight="bold" className="text-muted" />
    </Tooltip>
  </span>
);

const ProviderAccountsListTab = ({ portal, provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderAccountsList provider={provider} portal={portal} />;
};

export const ProviderOfferingUsersWithTabs = ({ provider }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const showProviderAccounts = isFeatureVisible(
    MarketplaceFeatures.show_provider_accounts,
  );
  const [metadataGroupBy, setMetadataGroupBy] = useState('answer');

  const tabs = useMemo(() => {
    const _tabs: TableTab[] = [
      {
        key: 'users',
        title: tabTitle(
          'offering-users-help',
          translate('Offering users'),
          translate(
            'A person’s account on one offering: one row for each offering the person uses.',
          ),
        ),
        component: ProviderOfferingUsersListTab,
      },
    ];
    if (showProviderAccounts) {
      _tabs.push({
        key: 'provider-accounts',
        title: tabTitle(
          'provider-accounts-help',
          translate('Provider accounts'),
          translate(
            'The one account a person has on all offerings that share accounts, with the same username, POSIX UID and home directory.',
          ),
        ),
        component: ProviderAccountsListTab,
      });
    }
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
  }, [metadataGroupBy, showProviderAccounts]);

  return (
    <TableWithTabs
      title={
        showProviderAccounts ? translate('Users') : translate('Offering users')
      }
      tabs={tabs}
      syncWithUrlKey="tab"
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
