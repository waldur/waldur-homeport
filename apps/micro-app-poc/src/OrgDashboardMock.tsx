import {
  BellIcon,
  BuildingsIcon,
  CheckIcon,
  FolderIcon,
  GaugeIcon,
  GearIcon,
  GlobeIcon,
  ListBulletsIcon,
  MoonIcon,
  QuestionIcon,
  ReceiptIcon,
  SquaresFourIcon,
  SunIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { fetchResultCount } from 'waldur-api-client';
import {
  applyTheme,
  getInitialTheme,
  setStoredTheme,
  ThemeName,
} from 'waldur-design-tokens';
import {
  LanguageOption,
  translate,
  useLanguageSelector,
} from 'waldur-i18n-runtime';
// waldur-js-client is deliberately absent from this app's own package.json
// — same reasoning as packages/api-client/src/requestHelpers.ts and
// packages/auth-core/src/client.ts: resolving it via workspace hoisting
// means this always sees root's exact pinned/linked SDK build, not a
// second, potentially-drifted copy declared here.
import {
  Customer,
  customersList,
  invoicesList,
  projectsList,
  projectsListUsersCount,
} from 'waldur-js-client';
import {
  Avatar,
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DataTableColumn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  IconButton,
  OrgSwitcher,
  SearchField,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarModeCard,
  SidebarNavItem,
  SidebarProvider,
  SidebarSection,
  SidebarTrigger,
  StatCard,
  StatusPill,
  StatusTone,
  TopBar,
} from 'waldur-ui';

/**
 * Moved here from packages/ui's own Storybook (DashboardPreview.stories.tsx)
 * — that composed story validated the Dashboard/* primitives render
 * correctly together in isolation; this validates the same composition in
 * a real standalone app, the thing micro-app-poc exists to prove for every
 * packages/* export. Each individual primitive still has its own story in
 * packages/ui for isolated development — only the full-page composition
 * moved.
 *
 * Needs waldur-design-tokens/surfaceColors.css (see tailwind.css). The
 * mockup this reproduces is dark, but surfaceColors.css/colors.css/
 * buttonColors.css all define a light variant too — this reads/writes the
 * same shared `waldur/theme/name` localStorage key and data-theme
 * attribute the main app's own src/theme/ThemeStorage.ts and
 * src/theme/utils.ts's loadTheme() use (see waldur-design-tokens/theme.ts),
 * so a theme choice made in either app carries over to the other, and
 * falls back to prefers-color-scheme when neither app has set one yet.
 *
 * Sidebar is now the real shadcn Sidebar (see Sidebar.tsx) — collapsible,
 * has a real mobile Sheet drawer, and Cmd/Ctrl+B toggles it — so this
 * needs a SidebarProvider wrapping both Sidebar and SidebarInset, and the
 * old inert "Toggle sidebar" IconButton is now a real SidebarTrigger.
 *
 * OrgSwitcher is now a real Radix DropdownMenu (see DropdownMenu.tsx),
 * wired to an actual switchable list: useDashboardData() fetches the
 * first page of customers (page_size: 10), and picking one in the menu
 * re-fetches that organisation's projects/invoice — see selectCustomer()
 * below. With no backend/no customers, the menu falls back to a single
 * non-interactive "No organisation" item — an honest placeholder, not an
 * illustrative mock name, since an org switcher showing a fabricated org
 * would look like a real one to pick from. Every IconButton in the
 * TopBar now shows its label in a real Tooltip on hover, not just via
 * aria-label. SearchField stays presentational — no cmdk/Command palette
 * added, ⌘K doesn't actually open anything.
 *
 * Stat tiles and the Projects table below now attempt a real SDK fetch
 * for whichever organisation is currently selected — see
 * useDashboardData(). orgName/projectsCount/usersCount come straight off
 * the selected Customer record (no extra fetch, so switching orgs
 * updates them instantly); invoiceTotal/invoiceHint/rows depend on a
 * second, per-organisation fetch that re-runs on switch, so those three
 * briefly show a loading/empty state while it's in flight rather than
 * holding the previous organisation's numbers under the new one's name.
 * projectsCount/usersCount/invoiceTotal/invoiceHint still fall back to
 * the original mockup's illustrative numbers when there's no backend/no
 * customers to show; orgName and the Projects table don't — an empty
 * table and a "No organisation" placeholder are honest "no data", where
 * a fabricated org name or four fabricated projects would look like real
 * ones. "Quota health" is never
 * live: /api/customer-quotas/ returns one row per customer for a single
 * quota_name at a time ({customer_name, value}), no limit to compare
 * against, so it can't honestly produce a Good/Warning verdict the way
 * the mockup implies — computing one anyway would be fabricating data,
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
 * Mock/illustrative data values (MOCK_INVOICE_DUE's fake date, project
 * names, org names) are left untranslated — they're fake data, not UI
 * chrome, the same reasoning MOCK_ORG_NAME being dropped rested on.
 *
 * The Globe IconButton in the TopBar is a real language switcher —
 * useLanguageSelector() (waldur-i18n-runtime, portable counterpart to
 * the main app's own src/i18n/useLanguageSelector.tsx) lists whatever
 * languageChoices App.tsx's LanguageUtilsService.init() was given.
 * Picking one reloads the page — same as the main app — since there's
 * no other mechanism here that would refresh already-rendered
 * translated text once the new dictionary loads. Hidden entirely with
 * no backend (empty languageChoices), same as OrgSwitcher's own
 * disabled-not-fabricated approach.
 */

interface ProjectRow {
  uuid: string;
  name: string;
  status: string;
  statusTone: StatusTone;
  members: number | string;
  monthlySpend: string;
}

const MOCK_PROJECTS_COUNT = 12;
const MOCK_USERS_COUNT = 48;
const MOCK_INVOICE_TOTAL = '€4,284';
const MOCK_INVOICE_DUE = 'pays May 30';

interface DashboardData {
  orgName: string;
  projectsCount: number;
  usersCount: number;
  invoiceTotal: string;
  invoiceHint: string;
  rows: ProjectRow[];
}

interface OrgProjectData {
  invoiceTotal: string;
  invoiceHint: string;
  rows: ProjectRow[];
}

/** Real fetch/derive from status, not the mockup's status vocabulary — the
 * API has no plain status enum on Project (see ProjectLifecycleBadge.tsx
 * for the fuller real model); this is an honest two-state approximation
 * from actual fields, not an invented value. */
function deriveProjectStatus(project: { end_date?: string | null }): {
  status: string;
  tone: StatusTone;
} {
  const isPast = project.end_date
    ? new Date(project.end_date).getTime() < Date.now()
    : false;
  return isPast
    ? { status: translate('Closed'), tone: 'neutral' }
    : { status: translate('Active'), tone: 'success' };
}

// waldur-auth-core's error interceptor spreads the thrown Error into a
// plain object, losing its non-enumerable .message, so a network/HTTP
// failure here surfaces only a possible .response.
function describeFetchError(thrown: unknown): string {
  const withResponse = thrown as { response?: Response };
  return thrown instanceof Error
    ? thrown.message
    : withResponse.response
      ? withResponse.response.status === 401
        ? 'HTTP 401 — not authenticated (log into a real Waldur instance on this same origin first)'
        : `HTTP ${withResponse.response.status}`
      : `no response — is a backend running at ${document.querySelector<HTMLMetaElement>('meta[name="api-url"]')?.content}?`;
}

function useDashboardData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<OrgProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // First page of organisations — populates OrgSwitcher's menu and picks
  // the first one as the initial selection.
  useEffect(() => {
    let cancelled = false;

    customersList({ query: { page_size: 10 } })
      .then((result) => {
        if (cancelled) return;
        const orgs = result.data ?? [];
        if (orgs.length === 0) {
          throw new Error('no customers found on this backend');
        }
        setCustomers(orgs);
        setSelectedUuid(orgs[0].uuid);
      })
      .catch((thrown) => {
        if (!cancelled) {
          setError(describeFetchError(thrown));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Whichever organisation is currently selected — its projects and most
  // recent invoice. Re-runs on every switch; clears the previous
  // selection's rows first so a switch never shows stale data under the
  // new organisation's name.
  useEffect(() => {
    if (!selectedUuid) return;
    let cancelled = false;
    setLoading(true);
    setProjectData(null);

    (async () => {
      try {
        const [invoicesResult, projectsResult] = await Promise.all([
          invoicesList({
            query: {
              customer_uuid: selectedUuid,
              page_size: 1,
              o: ['-created'],
            },
          }),
          projectsList({
            query: { customer: [selectedUuid], page_size: 10 },
          }),
        ]);

        const rows: ProjectRow[] = await Promise.all(
          (projectsResult.data ?? []).map(async (project) => {
            const { status, tone } = deriveProjectStatus(project);
            let members: number | string = '—';
            try {
              const countResult = await projectsListUsersCount({
                path: { uuid: project.uuid },
              });
              members = fetchResultCount(countResult as never);
            } catch {
              members = '—';
            }
            return {
              uuid: project.uuid,
              name: project.name,
              status,
              statusTone: tone,
              members,
              monthlySpend: project.billing_price_estimate?.total
                ? `€${project.billing_price_estimate.total}`
                : '—',
            };
          }),
        );

        const invoice = invoicesResult.data?.[0];

        if (!cancelled) {
          setProjectData({
            invoiceTotal: invoice ? `€${invoice.total}` : '—',
            invoiceHint: invoice
              ? translate('due {date}', { date: invoice.due_date })
              : translate('no invoices yet'),
            rows,
          });
        }
      } catch (thrown) {
        if (!cancelled) {
          setError(describeFetchError(thrown));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUuid]);

  const selectedCustomer =
    customers.find((customer) => customer.uuid === selectedUuid) ?? null;

  const data: DashboardData | null = selectedCustomer
    ? {
        orgName: selectedCustomer.name,
        projectsCount: selectedCustomer.projects_count,
        usersCount: selectedCustomer.users_count,
        // renderFieldOrDash() lives in @/table/utils — this app is
        // deliberately decoupled from src/table/* (see DataTable.tsx's
        // header comment), so that convention doesn't apply here.
        // eslint-disable-next-line waldur-custom/enforce-render-field-or-dash
        invoiceTotal: projectData?.invoiceTotal ?? '—',
        invoiceHint:
          projectData?.invoiceHint ??
          (loading ? translate('loading…') : translate('no invoices')),
        rows: projectData?.rows ?? [],
      }
    : null;

  return {
    customers,
    selectedUuid,
    selectCustomer: setSelectedUuid,
    data,
    error,
    loading,
  };
}

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
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: ThemeName = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
  };

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

  const orgName = data?.orgName ?? translate('No organisation');
  const projectsCount = data?.projectsCount ?? MOCK_PROJECTS_COUNT;
  const usersCount = data?.usersCount ?? MOCK_USERS_COUNT;
  const invoiceTotal = data?.invoiceTotal ?? MOCK_INVOICE_TOTAL;
  const invoiceHint = data?.invoiceHint ?? MOCK_INVOICE_DUE;
  const rows = data?.rows ?? [];

  return (
    <SidebarProvider
      className="h-svh w-full text-[var(--surface-text-primary)]"
      style={{ backgroundColor: 'var(--surface-page-bg)' }}
    >
      <Sidebar>
        <SidebarHeader>
          <SidebarModeCard
            eyebrow={translate('CURRENT MODE')}
            icon={<BuildingsIcon size={18} weight="bold" />}
            title={translate('Organisation admin')}
            subtitle={translate('Projects, members, invoices')}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label={translate('ORGANISATION')}>
            <SidebarNavItem
              icon={<SquaresFourIcon size={16} weight="bold" />}
              label={translate('Overview')}
            />
            <SidebarNavItem
              icon={<FolderIcon size={16} weight="bold" />}
              label={translate('Projects')}
              count={projectsCount}
            />
            <SidebarNavItem
              icon={<UsersIcon size={16} weight="bold" />}
              label={translate('Members')}
              active
            />
          </SidebarSection>
          <SidebarSection label={translate('FINANCE')}>
            <SidebarNavItem
              icon={<ReceiptIcon size={16} weight="bold" />}
              label={translate('Invoices')}
            />
            <SidebarNavItem
              icon={<GaugeIcon size={16} weight="bold" />}
              label={translate('Quotas')}
            />
          </SidebarSection>
          <SidebarSection label={translate('ADMIN')}>
            <SidebarNavItem
              icon={<GearIcon size={16} weight="bold" />}
              label={translate('Settings')}
            />
            <SidebarNavItem
              icon={<ListBulletsIcon size={16} weight="bold" />}
              label={translate('Audit log')}
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0">
        <TopBar
          left={
            <>
              <SidebarTrigger />
              <OrgSwitcher badge="NO" name={orgName}>
                <DropdownMenuLabel>
                  {translate('Organisations')}
                </DropdownMenuLabel>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <DropdownMenuItem
                      key={customer.uuid}
                      onClick={() => selectCustomer(customer.uuid)}
                    >
                      <CheckIcon
                        size={16}
                        weight="bold"
                        className={
                          customer.uuid === selectedUuid
                            ? undefined
                            : 'invisible'
                        }
                      />
                      {customer.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>
                    <CheckIcon size={16} weight="bold" />
                    {orgName}
                  </DropdownMenuItem>
                )}
              </OrgSwitcher>
            </>
          }
          center={
            // Hidden below md — with the sidebar's own mobile breakpoint at
            // 768px too, there's no width left for a center search slot
            // once the org switcher and the right-side icon cluster (both
            // fixed-size, see TopBar.tsx) already claim their share.
            <SearchField
              placeholder={translate('Search')}
              shortcutHint="⌘K"
              className="hidden md:flex"
            />
          }
          right={
            <>
              <IconButton
                icon={<SquaresFourIcon size={18} weight="bold" />}
                label={translate('Apps')}
                className="hidden sm:flex"
              />
              <IconButton
                icon={<QuestionIcon size={18} weight="bold" />}
                label={translate('Help')}
                className="hidden sm:flex"
              />
              <IconButton
                icon={<BellIcon size={18} weight="bold" />}
                label={translate('Notifications')}
                hasIndicator
              />
              {languageChoices.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      icon={<GlobeIcon size={18} weight="bold" />}
                      label={translate('Language')}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {translate('Language')}
                    </DropdownMenuLabel>
                    {languageChoices.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                      >
                        <CheckIcon
                          size={16}
                          weight="bold"
                          className={
                            currentLanguage?.code === language.code
                              ? undefined
                              : 'invisible'
                          }
                        />
                        {language.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <IconButton
                icon={
                  theme === 'dark' ? (
                    <SunIcon size={18} weight="bold" />
                  ) : (
                    <MoonIcon size={18} weight="bold" />
                  )
                }
                label={
                  theme === 'dark'
                    ? translate('Switch to light mode')
                    : translate('Switch to dark mode')
                }
                onClick={toggleTheme}
              />
              <Avatar initials="MS" />
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
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
              <BaseButton
                label={translate('New')}
                size="lg"
                variant="primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={translate('Projects')}
              value={projectsCount}
              hint={data ? undefined : translate('this quarter')}
              trend={data ? undefined : { label: '+2', tone: 'success' }}
            />
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
      </SidebarInset>
    </SidebarProvider>
  );
};
