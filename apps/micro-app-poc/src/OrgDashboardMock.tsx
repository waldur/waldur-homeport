import { useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { AppShell } from 'waldur-shell';
import {
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DataTableColumn,
  ModePickerDialog,
  OrgSwitcher,
  SidebarModeCard,
  StatCard,
  StatusPill,
  WaldurLogo,
} from 'waldur-ui';

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

  // The mode the sidebar is currently showing, and whether the picker
  // that switches it is open. Local state only — a real deployment would
  // persist this per user, which needs a backend field this app has no
  // endpoint for yet.
  const [mode, setMode] = useState('finance-reporting');
  const [pickerOpen, setPickerOpen] = useState(false);
  // Rebuilt every render, not memoized: its translate() calls have to
  // re-resolve once the dictionary loads, same reason `columns` above is
  // not a module constant.
  const modes = getWorkspaceModes();
  const currentMode = modes.find((item) => item.key === mode);

  // Dashes, not mock-number fallbacks, when there's no backend/no
  // customers — see the file header comment. renderFieldOrDash() lives in
  // @/table/utils — this app is deliberately decoupled from src/table/*
  // (see DataTable.tsx's header comment), so that convention doesn't
  // apply here.
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
      logo={<WaldurLogo />}
      sidebarHeader={
        <SidebarModeCard
          icon={currentMode?.icon}
          title={currentMode?.title ?? ''}
          subtitle={getModeSubtitle(mode)}
          onClick={() => setPickerOpen(true)}
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
      <ModePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={translate('Choose your workspace')}
        description={translate(
          'You have access to multiple modes. Each gives you a tailored view of Waldur for a specific job. You can switch anytime from the sidebar.',
        )}
        modes={modes}
        value={mode}
        onSelect={(key) => {
          setMode(key);
          setPickerOpen(false);
        }}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Breadcrumb/heading track the sidebar: the mode card's own
                title, then whichever nav item is active. */}
            <div className="text-sm text-[var(--surface-text-muted)]">
              {currentMode?.title} &gt; {translate('Overview')}
            </div>
            <h1 className="text-2xl font-semibold">{translate('Overview')}</h1>
            <p className="mt-1 text-sm text-[var(--surface-text-secondary)]">
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
