import {
  ChartBarIcon,
  CheckSquareOffsetIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PackageIcon,
  TrayIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { ReactElement, useEffect } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { AppShell } from 'waldur-shell';
import {
  EmptyState,
  LinkProvider,
  LoadingSpinner,
  Menu,
  OrgSwitcher,
  SidebarModeCard,
  SidebarNavItem,
  SidebarSection,
  WaldurLogo,
} from 'waldur-ui';

import { initials } from './format';
import { providerOfferingRequestsUrl, providerOrdersUrl } from './links';
import { AwardsPage } from './pages/AwardsPage';
import { DemandPage } from './pages/DemandPage';
import { InboxPage } from './pages/InboxPage';
import { ProposalPage } from './pages/ProposalPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { RequestsPage } from './pages/RequestsPage';
import { TeamWorkPage } from './pages/TeamWorkPage';
import { Provider, useProviders } from './providers';
import {
  useAwardOrders,
  useRequestedOfferings,
  useTaskSummary,
} from './queries';
import {
  isAppHref,
  navigate,
  onLinkClick,
  PageKey,
  pageHref,
  replace,
  withParam,
  useRoute,
} from './router';

const PAGES: Record<PageKey, (props: { provider?: Provider }) => ReactElement> =
  {
    inbox: InboxPage,
    requests: RequestsPage,
    team: TeamWorkPage,
    proposals: ProposalsPage,
    awards: AwardsPage,
    demand: DemandPage,
  };

// LinkProvider contract: an empty link the caller fills (see AppLink.tsx).
// This app's pages navigate client-side; the portal's are plain links.
const renderLink = (to: string) => (
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <a href={to} onClick={isAppHref(to) ? onLinkClick(to) : undefined} />
);

export const App = () => {
  const route = useRoute();
  const providers = useProviders();
  const list = providers.data ?? [];
  const selectedUuid = route.params.get('provider');
  // The first provider until the user picks one: slots and requests carry no
  // provider of their own, so a link into the portal needs one selected.
  const provider =
    list.find((item) => item.uuid === selectedUuid) ?? list[0] ?? undefined;

  // Keep the selection in the URL, so a link to the page shows the same data.
  useEffect(() => {
    if (provider && provider.uuid !== selectedUuid) {
      replace(withParam('provider', provider.uuid));
    }
  }, [provider, selectedUuid]);

  const summary = useTaskSummary(provider?.uuid);
  const waiting = useRequestedOfferings(provider?.uuid, ['requested']);
  const awardsWaiting = useAwardOrders(provider?.uuid, ['pending-provider']);

  const navItem = (
    page: PageKey,
    label: string,
    icon: ReactElement,
    count?: number,
  ) => {
    const href = pageHref(page);
    return (
      <SidebarNavItem
        icon={icon}
        label={label}
        active={route.page === page}
        count={count || undefined}
        onClick={() => navigate(href)}
      />
    );
  };

  const Page = PAGES[route.page];

  return (
    <LinkProvider renderLink={renderLink}>
      <AppShell
        appName="provider-calls"
        logo={<WaldurLogo />}
        sidebarHeader={
          <SidebarModeCard
            icon={<PackageIcon size={22} weight="bold" />}
            title={translate('Service provider')}
            subtitle={translate('Calls for proposals')}
          />
        }
        sidebarContent={
          <>
            <SidebarSection>
              {navItem(
                'inbox',
                translate('Inbox'),
                <TrayIcon size={20} weight="bold" />,
                summary.data?.total,
              )}
            </SidebarSection>
            <SidebarSection label={translate('CALLS')}>
              {navItem(
                'requests',
                translate('Requests'),
                <EnvelopeSimpleIcon size={20} weight="bold" />,
                waiting.data?.length,
              )}
              {navItem(
                'team',
                translate('Team work'),
                <UsersThreeIcon size={20} weight="bold" />,
              )}
              {navItem(
                'proposals',
                translate('Proposals'),
                <FileTextIcon size={20} weight="bold" />,
              )}
              {navItem(
                'awards',
                translate('Awards'),
                <CheckSquareOffsetIcon size={20} weight="bold" />,
                awardsWaiting.data?.length,
              )}
              {navItem(
                'demand',
                translate('Demand'),
                <ChartBarIcon size={20} weight="bold" />,
              )}
            </SidebarSection>
            {provider ? (
              <SidebarSection label={translate('IN THE PORTAL')}>
                <SidebarNavItem
                  label={translate('All offering requests')}
                  href={providerOfferingRequestsUrl(provider.uuid)}
                />
                <SidebarNavItem
                  label={translate('All orders')}
                  href={providerOrdersUrl(provider.uuid)}
                />
              </SidebarSection>
            ) : null}
          </>
        }
        orgSwitcher={
          provider ? (
            <OrgSwitcher badge={initials(provider.name)} name={provider.name}>
              <Menu.Label>{translate('Providers')}</Menu.Label>
              <Menu.RadioGroup
                value={provider.uuid}
                onValueChange={(uuid: string) =>
                  navigate(pageHref(route.page, { provider: uuid }))
                }
              >
                {list.map((item) => (
                  <Menu.RadioItem key={item.uuid} value={item.uuid}>
                    {item.name}
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </OrgSwitcher>
          ) : undefined
        }
      >
        {providers.isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : !provider && route.page !== 'inbox' && route.page !== 'team' ? (
          <div className="p-6">
            <EmptyState
              title={translate('You are not on a provider team')}
              message={translate(
                'This page is for the owners and offering managers of a service provider. Assessments handed to you are in your Inbox.',
              )}
            />
          </div>
        ) : route.page === 'proposals' && route.id ? (
          <ProposalPage
            key={`${route.id}-${provider?.uuid ?? 'none'}`}
            proposalUuid={route.id}
            provider={provider}
          />
        ) : (
          <Page key={provider?.uuid ?? 'none'} provider={provider} />
        )}
      </AppShell>
    </LinkProvider>
  );
};
