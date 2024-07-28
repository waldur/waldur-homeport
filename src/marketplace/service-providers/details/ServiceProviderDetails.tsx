import { FunctionComponent, useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useTitle } from 'react-use';

import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { Offering, ServiceProvider } from '@waldur/marketplace/types';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';
import { Field } from '@waldur/resource/summary';

import { getProviderBreadcrumbItems } from '../utils';

import { ProviderCallsTab } from './ProviderCallsTab';
import { ProviderDashboardTab } from './ProviderDashboardTab';
import { ProviderOfferingsTab } from './ProviderOfferingsTab';
import '@waldur/core/CustomCard.scss';
import { ProviderOrdersTab } from './ProviderOrdersTab';

interface ProviderDetailsProps {
  provider: ServiceProvider;
  offerings: Offering[];
}

const getProviderPageTabs = (data): PageBarTab[] => {
  return [
    {
      key: 'dashboard',
      title: translate('Dashboard'),
      component: () => <ProviderDashboardTab data={data} />,
    },
    {
      key: 'offerings',
      title: translate('Offerings'),
      component: () => <ProviderOfferingsTab offerings={data.offerings} />,
    },
    {
      key: 'calls',
      title: translate('Calls'),
      component: () => (
        <ProviderCallsTab provider_uuid={data.provider.customer_uuid} />
      ),
    },
    {
      key: 'orders',
      title: translate('Orders'),
      component: () => (
        <ProviderOrdersTab provider_uuid={data.provider.customer_uuid} />
      ),
    },
  ];
};

const ProviderDetailsHero: FunctionComponent<ProviderDetailsProps> = (data) => {
  return (
    <PublicDashboardHero2
      hideQuickSection
      logo={data.provider.customer_image}
      className="container-fluid mb-8 mt-6"
      logoAlt={data.provider.customer_name}
      logoTooltip={data.provider.customer_name}
      title={
        <Stack direction="horizontal" gap={2} className="gap-6 text-muted mb-1">
          {data.provider.customer_country && (
            <CountryFlag countryCode={data.provider.customer_country} />
          )}
          <h2 className="mb-0">{data.provider.customer_name}</h2>
        </Stack>
      }
    >
      <Field
        label={translate('Description')}
        value={data.provider.description}
        isStuck={true}
      />
    </PublicDashboardHero2>
  );
};

export const ServiceProviderDetails: FunctionComponent<ProviderDetailsProps> = (
  data,
) => {
  const breadcrumbItems = useMemo(
    () => getProviderBreadcrumbItems(data.provider),
    [data.provider],
  );
  useBreadcrumbs(breadcrumbItems);
  useTitle(translate('Service provider details'));
  usePageHero(<ProviderDetailsHero {...data} />);
  const tabs = useMemo(() => getProviderPageTabs(data), []);
  const { tabSpec } = usePageTabsTransmitter(tabs);
  return tabSpec?.component ? <tabSpec.component /> : null;
};
