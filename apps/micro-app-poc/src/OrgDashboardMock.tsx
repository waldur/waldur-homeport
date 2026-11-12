import { useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { AppShell } from 'waldur-shell';
import { Column, Table, useRowsTable } from 'waldur-table';
import {
  Badge,
  BaseButton,
  BreadcrumbTrail,
  Card,
  CardContent,
  CardHeader,
  ModalService,
  ModePickerDialog,
  OrgSwitcher,
  PropertyList,
  SidebarModeCard,
  StatCardGrid,
  WaldurLogo,
} from 'waldur-ui';

import { BillingContactCard } from './BillingContactCard';
import { ModeNav } from './ModeNav';
import { OrgSwitcherMenu } from './OrgSwitcherMenu';
import { ProjectRow, useDashboardData } from './useDashboardData';
import { getModeSubtitle, getWorkspaceModes } from './workspaceModes';

/**
 * A real standalone app composing the Dashboard/* primitives — the thing
 * micro-app-poc exists to prove for every packages/* export. Each
 * primitive still has its own isolated story in packages/ui; this file is
 * composition only: nav item content, the org switcher's data wiring, and
 * the page content. The chrome itself (Sidebar/TopBar layout, the sidebar
 * brand row with its shortcuts button and collapse toggle, the TopBar's
 * right-side Apps/Help/Notifications/UserMenu cluster, current user,
 * theme, language) is entirely waldur-shell's <AppShell> — this file
 * doesn't touch any of those three. It passes the brand row's one
 * app-owned slot, the logo (waldur-ui's WaldurLogo).
 *
 * The sidebar's mode card opens the workspace picker (waldur-ui's
 * ModePickerDialog, filled from workspaceModes.tsx) and really does
 * switch modes: the card, the nav below it (ModeNav.tsx) and this page's
 * breadcrumb all follow the choice, which is what the picker's "a
 * tailored view of Waldur for a specific job" has to mean to be worth
 * showing. The selection is component state — persisting it per user
 * needs a backend field that doesn't exist yet. Individual nav items,
 * though, route nowhere: this app has one page, and a link that silently
 * goes nowhere would be worse than an obviously inert one.
 *
 */

// One array for "no rows", so the table does not start over every render.
const NO_ROWS: ProjectRow[] = [];

export const OrgDashboardMock = () => {
  // Rebuilt every render (not a module-level constant) so its translate()
  // calls re-resolve once the dictionary loads — see the file header
  // comment on why nothing forces an extra render for that on its own.
  const columns: Column<ProjectRow>[] = [
    { id: 'name', title: translate('Project'), render: ({ row }) => row.name },
    {
      id: 'status',
      title: translate('Status'),
      render: ({ row }) => (
        <Badge variant={row.statusTone} shape="pill" tone="outline" hasBullet>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'members',
      title: translate('Members'),
      render: ({ row }) => row.members,
    },
    {
      id: 'monthlySpend',
      title: translate('Monthly spend'),
      render: ({ row }) => row.monthlySpend,
    },
  ];

  const { customers, selectedUuid, selectCustomer, data } = useDashboardData();

  // The mode the sidebar is currently showing. Local state only — a real deployment would
  // persist this per user, which needs a backend field this app has no
  // endpoint for yet.
  const [mode, setMode] = useState('finance-reporting');
  // Rebuilt every render, not memoized: its translate() calls have to
  // re-resolve once the dictionary loads, same reason `columns` above is
  // not a module constant.
  const modes = getWorkspaceModes();
  const currentMode = modes.find((item) => item.key === mode);
  // ModalService rather than useModal(): this component renders AppShell,
  // which mounts the ModalProvider, so it sits above the provider.
  const openPicker = () =>
    ModalService.open(ModePickerDialog, {
      size: 'lg',
      resolve: {
        title: translate('Choose your workspace'),
        description: translate(
          'You have access to multiple modes. Each gives you a tailored view of Waldur for a specific job. You can switch anytime from the sidebar.',
        ),
        modes,
        value: mode,
        onSelect: setMode,
      },
    });

  // Dashes, not mock-number fallbacks, when there's no backend/no
  // customers — see the file header comment. These are stat values and a
  // heading, not table cells, so the table's renderFieldOrDash() does not
  // apply here.
  /* eslint-disable waldur-custom/enforce-render-field-or-dash */
  const orgName = data?.orgName ?? translate('No organisation');
  const projectsCount = data?.projectsCount ?? '—';
  const usersCount = data?.usersCount ?? '—';
  const invoiceTotal = data?.invoiceTotal ?? '—';
  const invoiceHint = data?.invoiceHint ?? '—';
  const workspaceTitle = currentMode?.title ?? '—';
  /* eslint-enable waldur-custom/enforce-render-field-or-dash */
  const rows = data?.rows ?? NO_ROWS;
  const tableProps = useRowsTable<ProjectRow>('poc-projects', rows, rows);

  return (
    <AppShell
      appName="micro-app-poc"
      logo={<WaldurLogo />}
      sidebarHeader={
        <SidebarModeCard
          icon={currentMode?.icon}
          title={currentMode?.title ?? ''}
          subtitle={getModeSubtitle(mode)}
          onClick={openPicker}
        />
      }
      sidebarContent={<ModeNav mode={mode} projectsCount={projectsCount} />}
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
    >
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Breadcrumb/heading track the sidebar: the mode card's own
                title, then whichever nav item is active. The mode crumb
                opens the same picker as the mode card. waldur-ui's trail
                needs no router: without a BreadcrumbsProvider renderLink a
                crumb's `to` is a plain href, and a crumb may instead have,
                as here, an onClick. */}
            <BreadcrumbTrail
              items={[
                {
                  key: 'mode',
                  text: currentMode?.title ?? '',
                  onClick: openPicker,
                },
                { key: 'page', text: translate('Overview'), active: true },
              ]}
            />
            <h1 className="text-2xl font-semibold">{translate('Overview')}</h1>
            <p className="mt-1 text-sm text-quaternary">
              {translate(
                'Invoices and cost analytics for the selected organisation.',
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

        <StatCardGrid
          spaceless
          stats={[
            { label: translate('Projects'), value: projectsCount },
            {
              label: translate('Members'),
              value: usersCount,
              footer: translate('across projects'),
            },
            {
              label: translate('Invoice due'),
              value: invoiceTotal,
              footer: invoiceHint,
            },
            {
              label: translate('Quota health'),
              value: translate('Good'),
              footer: translate(
                'all under 80% (mock — see file header comment)',
              ),
            },
          ]}
        />

        <Card>
          <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
            {translate('Projects')}
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {/* The card around it has the title. */}
            <Table
              {...tableProps}
              columns={columns}
              verboseName={translate('projects')}
              hideTitle
              hasActionBar={false}
              cardBordered={false}
              placeholderHasRetry={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
            {translate('Organisation details')}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <PropertyList detailsMode>
              <PropertyList.Item
                label={translate('Organisation')}
                description={translate(
                  'Legal entity name associated with the billing profile.',
                )}
                value={orgName}
              />
              {selectedUuid && (
                <PropertyList.Item
                  label={translate('UUID')}
                  value={selectedUuid}
                  copyValue={selectedUuid}
                  copyLabel={translate('Copy')}
                  copiedLabel={translate('Copied')}
                />
              )}
              <PropertyList.Item
                label={translate('Active workspace')}
                value={workspaceTitle}
                actions={
                  <BaseButton
                    variant="tertiary"
                    size="sm"
                    label={translate('Switch')}
                    onClick={openPicker}
                  />
                }
              />
            </PropertyList>
          </CardContent>
        </Card>

        <BillingContactCard />
      </div>
    </AppShell>
  );
};
