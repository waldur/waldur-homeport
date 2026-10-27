import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { ServiceProvider } from 'waldur-js-client';

import { useBreadcrumbs } from 'waldur-ui';

import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CountryFlag } from '@/marketplace/common/CountryFlag';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { LayoutSlot } from '@/navigation/slots';
import { useTitle } from '@/navigation/title';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { Field } from '@/resource/summary';

import { getProviderBreadcrumbItems } from '../utils';

import { ProviderCallsTab } from './ProviderCallsTab';
import { ProviderDashboardTab } from './ProviderDashboardTab';
import { ProviderOfferingsTab } from './ProviderOfferingsTab';
import { ProviderOrdersTab } from './ProviderOrdersTab';

import '@/core/CustomCard.scss';

interface ProviderDetailsProps {
  provider: ServiceProvider;
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
      component: () => <ProviderOfferingsTab data={data} />,
    },
    isFeatureVisible(
      MarketplaceFeatures.show_call_management_functionality,
    ) && {
      key: 'calls',
      title: translate('Calls'),
      component: () => (
        <ProviderCallsTab provider_uuid={data.provider.customer_uuid} />
      ),
    },
    !isFeatureVisible(MarketplaceFeatures.catalogue_only) && {
      key: 'orders',
      title: translate('Orders'),
      component: () => <ProviderOrdersTab provider={data.provider} />,
    },
  ].filter(Boolean);
};

const ProviderDetailsHero: FunctionComponent<ProviderDetailsProps> = (data) => {
  return (
    <PublicDashboardHero
      hideQuickSection
      cardBordered
      logo={data.provider.customer_image}
      className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-[1.25rem]')}
      logoAlt={data.provider.customer_name}
      logoTooltip={data.provider.customer_name}
      logoCircle
      title={
        <Stack
          direction="horizontal"
          gap={2}
          className="gap-5 text-quaternary mb-1"
        >
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
    </PublicDashboardHero>
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
  const tabs = useMemo(() => getProviderPageTabs(data), []);
  const { tabSpec } = usePageTabsTransmitter(tabs);
  return (
    <>
      <LayoutSlot name="hero">
        <ProviderDetailsHero {...data} />
      </LayoutSlot>
      {tabSpec?.component ? <tabSpec.component /> : null}
    </>
  );
};
