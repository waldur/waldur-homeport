import {
  BuildingsIcon,
  FolderIcon,
  GaugeIcon,
  GearIcon,
  ListBulletsIcon,
  ReceiptIcon,
  SquaresFourIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import {
  LanguageOption,
  translate,
  useLanguageSelector,
} from 'waldur-i18n-runtime';
import { AppShell, useShellTheme } from 'waldur-shell';
import {
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DataTableColumn,
  OrgSwitcher,
  SidebarModeCard,
  SidebarNavItem,
  SidebarSection,
  StatCard,
  StatusPill,
} from 'waldur-ui';

import { OrgSwitcherMenu } from './OrgSwitcherMenu';
import { useCurrentUser } from './useCurrentUser';
import { ProjectRow, useDashboardData } from './useDashboardData';

/**
 * Moved here from packages/ui's own Storybook (DashboardPreview.stories.tsx)
 * — that composed story validated the Dashboard/* primitives render
 * correctly together in isolation; this validates the same composition in
 * a real standalone app, the thing micro-app-poc exists to prove for every
 * packages/* export. Each individual primitive still has its own story in
 * packages/ui for isolated development — only the full-page composition
 * moved.
 *
 * The chrome (Sidebar/TopBar layout skeleton, the TopBar's right-side
 * Apps/Help/Notifications/UserMenu cluster, theme toggling) is
 * waldur-shell's <AppShell>/useShellTheme() — extracted once a second
 * micro-app made "reusable, not duplicated" matter, the same reasoning
 * UserMenu.tsx documents for its own move into waldur-ui one level in.
 * This file now owns only what's genuinely specific to this dashboard: nav
 * item content, the org switcher's data wiring, and the page content
 * itself.
 *
 * OrgSwitcher is a real Radix DropdownMenu (see waldur-ui's
 * DropdownMenu.tsx), wired to an actual switchable list: useDashboardData()
 * fetches the first page of customers (page_size: 10), and picking one in
 * the menu re-fetches that organisation's projects/invoice — see
 * selectCustomer() below. With no backend/no customers, the menu falls
 * back to a single non-interactive "No organisation" item — an honest
 * placeholder, not an illustrative mock name, since an org switcher
 * showing a fabricated org would look like a real one to pick from.
 *
 * Stat tiles and the Projects table below attempt a real SDK fetch for
 * whichever organisation is currently selected — see useDashboardData().
 * orgName/projectsCount/usersCount come straight off the selected Customer
 * record (no extra fetch, so switching orgs updates them instantly);
 * invoiceTotal/invoiceHint/rows depend on a second, per-organisation fetch
 * that re-runs on switch, so those three briefly show a loading/empty
 * state while it's in flight rather than holding the previous
 * organisation's numbers under the new one's name. None of
 * projectsCount/usersCount/invoiceTotal/invoiceHint fall back to
 * illustrative mock numbers when there's no backend/no customers to show —
 * a dash, same honest "no data" treatment orgName and the Projects table
 * already had (an empty table and a "No organisation" placeholder), not a
 * fabricated number that would look like a real one. "Quota health" is
 * never live: /api/customer-quotas/ returns one row per customer for a
 * single quota_name at a time ({customer_name, value}), no limit to
 * compare against, so it can't honestly produce a Good/Warning verdict the
 * way the mockup implies — computing one anyway would be fabricating data,
 * not surfacing it.
 *
 * Static UI copy below is wrapped in translate() (see App.tsx for
 * LanguageUtilsService wiring) — same shared `waldur/i18n/lang` key and
 * dictionary-lookup mechanism the main app uses, so a language already
 * chosen there applies here too. Like the real app, there's no forced
 * re-render when the dictionary finishes loading (LanguageUtilsService's
 * dictionary is a plain mutable property, not React state) — translated
 * text appears whenever this component next re-renders for any other
 * reason (e.g. useDashboardData()'s own fetches), same eventual-
 * consistency the main app relies on via its own incidental re-renders.
 *
 * The Language row inside AppShell's user menu is a real language
 * switcher — useLanguageSelector() (waldur-i18n-runtime, portable
 * counterpart to the main app's own src/i18n/useLanguageSelector.tsx)
 * lists whatever languageChoices App.tsx's LanguageUtilsService.init() was
 * given. Picking one reloads the page — same as the main app — since
 * there's no other mechanism here that would refresh already-rendered
 * translated text once the new dictionary loads. Hidden entirely with no
 * backend (empty languageChoices), same as OrgSwitcher's own
 * disabled-not-fabricated approach.
 *
 * useCurrentUser()/useDashboardData() and ProjectRow's shape live in their
 * own files (useCurrentUser.ts, useDashboardData.ts) — this file is
 * composition only: read their exported hooks/values, render the page.
 */

export const OrgDashboardMock = () => {
  // Rebuilt every render (not a module-level constant) so its translate()
  // calls re-resolve once the dictionary loads — see the file header
  // comment on why nothing forces an extra render for that on its own.
  const columns: DataTableColumn<ProjectRow>[] = [
    { key: 'name', header: translate('Project'), render: (row) => row.name },
    {
      key: 'status',
      header: translate('Status'),
      render: (row) => <StatusPill label={row.status} tone={row.statusTone} />,
    },
    {
      key: 'members',
      header: translate('Members'),
      render: (row) => row.members,
    },
    {
      key: 'monthlySpend',
      header: translate('Monthly spend'),
      render: (row) => row.monthlySpend,
    },
  ];

  const { customers, selectedUuid, selectCustomer, data } = useDashboardData();
  const currentUser = useCurrentUser();
  const { theme, toggleTheme } = useShellTheme();

  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  const handleLanguageChange = (language: LanguageOption) => {
    setLanguage(language);
    // LanguageUtilsService.dictionary is a plain mutable property, not
    // React state, so nothing re-renders already-translated text once
    // the new dictionary loads — same reload useLanguageSelector.tsx
    // itself uses in the main app.
    window.location.reload();
  };

  // No more mock-number fallbacks here — same honest-"no data" treatment
  // orgName and the Projects table already had (see the file header
  // comment): a dash is what's actually true when there's no backend/no
  // customers, not a fabricated illustrative number that would look like
  // a real one. renderFieldOrDash() lives in @/table/utils — this app is
  // deliberately decoupled from src/table/* (see DataTable.tsx's header
  // comment), so that convention doesn't apply here.
  /* eslint-disable waldur-custom/enforce-render-field-or-dash */
  const orgName = data?.orgName ?? translate('No organisation');
  const projectsCount = data?.projectsCount ?? '—';
  const usersCount = data?.usersCount ?? '—';
  const invoiceTotal = data?.invoiceTotal ?? '—';
  const invoiceHint = data?.invoiceHint ?? '—';
  /* eslint-enable waldur-custom/enforce-render-field-or-dash */
  const rows = data?.rows ?? [];

  return (
    <AppShell
      sidebarHeader={
        <SidebarModeCard
          eyebrow={translate('CURRENT MODE')}
          icon={<BuildingsIcon size={18} weight="bold" />}
          title={translate('Organisation admin')}
          subtitle={translate('Projects, members, invoices')}
        />
      }
      sidebarContent={
        <>
          <SidebarSection label={translate('ORGANISATION')}>
            <SidebarNavItem
              icon={<SquaresFourIcon size={20} weight="bold" />}
              label={translate('Overview')}
            />
            <SidebarNavItem
              icon={<FolderIcon size={20} weight="bold" />}
              label={translate('Projects')}
              count={projectsCount}
              active
            />
            <SidebarNavItem
              icon={<UsersIcon size={20} weight="bold" />}
              label={translate('Members')}
            />
          </SidebarSection>
          <SidebarSection label={translate('FINANCE')}>
            <SidebarNavItem
              icon={<ReceiptIcon size={20} weight="bold" />}
              label={translate('Invoices')}
            />
            <SidebarNavItem
              icon={<GaugeIcon size={20} weight="bold" />}
              label={translate('Quotas')}
            />
          </SidebarSection>
          <SidebarSection label={translate('ADMIN')}>
            <SidebarNavItem
              icon={<GearIcon size={20} weight="bold" />}
              label={translate('Settings')}
            />
            <SidebarNavItem
              icon={<ListBulletsIcon size={20} weight="bold" />}
              label={translate('Audit log')}
            />
          </SidebarSection>
        </>
      }
      orgSwitcher={
        <OrgSwitcher badge="NO" name={orgName}>
          <OrgSwitcherMenu
            customers={customers}
            selectedUuid={selectedUuid}
            onSelect={selectCustomer}
            orgName={orgName}
          />
        </OrgSwitcher>
      }
      currentUser={currentUser}
      theme={theme}
      onToggleTheme={toggleTheme}
      currentLanguage={currentLanguage}
      languageChoices={languageChoices}
      onLanguageChange={handleLanguageChange}
    >
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-[var(--surface-text-muted)]">
              {translate('Organisation admin')} &gt; {translate('Members')}
            </div>
            <h1 className="text-2xl font-semibold">{translate('Members')}</h1>
            <p className="mt-1 text-sm text-[var(--surface-text-secondary)]">
              {translate(
                'For organisation administrators managing projects, members, quotas and invoices.',
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BaseButton
              label={translate('Filter')}
              size="lg"
              variant="tertiary"
            />
            <BaseButton label={translate('New')} size="lg" variant="primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={translate('Projects')} value={projectsCount} />
          <StatCard
            label={translate('Members')}
            value={usersCount}
            hint={translate('across projects')}
          />
          <StatCard
            label={translate('Invoice due')}
            value={invoiceTotal}
            hint={invoiceHint}
          />
          <StatCard
            label={translate('Quota health')}
            value={translate('Good')}
            hint={translate('all under 80% (mock — see file header comment)')}
          />
        </div>

        <Card>
          <CardHeader className="p-4 pb-0 text-sm font-semibold">
            {translate('Projects')}
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(row) => row.uuid}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};
