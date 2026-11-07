import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import {
  proposalProposalsList,
  proposalProtectedCallsWorkflowStepsList,
  WorkflowCheck,
  WorkflowDescription,
} from 'waldur-js-client';

import { HelpIcon, SegmentedControl, Select, Switch } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { Call } from '@/proposals/types';
import { StepFormPage } from '@/proposals/update/workflow-steps/stepForm';
import { WorkflowStepConfigDialog } from '@/proposals/update/workflow-steps/WorkflowStepConfigDialog';
import { canUpdateCall } from '@/proposals/utils';
import { summaryText } from '@/proposals/workflow-check/findings';
import {
  changesViews,
  WorkflowChangesSection,
} from '@/proposals/workflow-check/WorkflowChangesSection';
import {
  checkVerdict,
  useOpenValidationTab,
  WorkflowCheckPanel,
} from '@/proposals/workflow-check/WorkflowCheckPanel';
import { useUser } from '@/workspace/hooks';
import { isStaff } from '@/workspace/selectors';

import { DryRunPanel } from './dry-run/DryRunPanel';
import {
  notificationTabIntro,
  useNotificationTabs,
} from './NotificationMatrix';
import { PanelHeaderSlotProvider } from './PanelHeaderControls';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
  callWorkflowHistoryKey,
  useCallWorkflowCheck,
  useCallWorkflowDescription,
  useCallWorkflowVersions,
} from './queries';
import { RoleMatrix, RoleMatrixLegend } from './RoleMatrix';
import { useCallScenarios } from './scenarios/queries';
import { widthOfLongest } from './selectWidth';
import { actorTitle } from './summary';
import {
  useValidationExport,
  ValidationExportProvider,
} from './validationExport';

// Drawn on demand: the check and the matrices are what most visits read.
const WorkflowDiagramPanel = lazyComponent(() =>
  import('./diagram/WorkflowDiagramPanel').then((module) => ({
    default: module.WorkflowDiagramPanel,
  })),
);
const WorkflowTimelinePanel = lazyComponent(() =>
  import('./diagram/WorkflowTimelinePanel').then((module) => ({
    default: module.WorkflowTimelinePanel,
  })),
);
const CallScenariosPanel = lazyComponent(() =>
  import('./scenarios/ChecksPanels').then((module) => ({
    default: module.CallScenariosPanel,
  })),
);
const WorkflowPathsPanel = lazyComponent(() =>
  import('./diagram/WorkflowPathsPanel').then((module) => ({
    default: module.WorkflowPathsPanel,
  })),
);

/**
 * A section of the page on its panel, as the sections of the Manage and
 * Edit pages are: its name, its own controls beside it and the Export last,
 * then its content.
 */
const ValidationPanel: FC<{
  title: string;
  /** What the section shows, in a line, and anything that explains it. */
  subtitle: ReactNode;
  actions?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
}> = ({ title, subtitle, actions, bodyClassName, children }) => {
  const { call } = useValidation();
  const exportSlot = useValidationExport(call);
  // Where the view's own controls go (PanelHeaderControls), before Export.
  const [controlsSlot, setControlsSlot] = useState<HTMLDivElement | null>(null);
  return (
    <Panel
      cardBordered
      title={title}
      subtitle={subtitle}
      subtitleClassName="font-normal"
      bodyClassName={bodyClassName}
      actions={
        <div className="flex flex-wrap items-center gap-3 font-normal">
          {actions}
          <div ref={setControlsSlot} className="contents" />
          {exportSlot.button}
        </div>
      }
    >
      <PanelHeaderSlotProvider value={{ slot: controlsSlot }}>
        <ValidationExportProvider value={exportSlot.slot}>
          {children}
        </ValidationExportProvider>
      </PanelHeaderSlotProvider>
    </Panel>
  );
};

/**
 * The step dialog, opened on the page of a field: what a finding's menu, a
 * mark of the role matrix or a diagram node opens. Null for those who may
 * not change the call.
 */
const useOpenStep = (call: Call, enabled: boolean) => {
  const { data: steps, refetch } = useQuery({
    queryKey: ['CallValidationSteps', call.uuid],
    queryFn: () =>
      proposalProtectedCallsWorkflowStepsList({
        path: { uuid: call.uuid },
      }).then((response) => response.data),
    enabled,
    refetchOnWindowFocus: false,
  });
  const queryClient = useQueryClient();
  const { openDialog } = useModal();
  const openStep = useCallback(
    (stepKey: string, page: StepFormPage, field?: string) => {
      const step = steps?.find((row) => row.key === stepKey);
      if (!step) return;
      openDialog(WorkflowStepConfigDialog, {
        resolve: {
          call,
          step,
          refetch: () => {
            refetch();
            for (const queryKey of [
              callWorkflowDescriptionKey(call.uuid),
              callWorkflowCheckKey(call.uuid),
              callWorkflowHistoryKey(call.uuid),
            ]) {
              queryClient.invalidateQueries({ queryKey });
            }
          },
          initialPage: page,
          initialField: field,
        },
        size: 'lg',
      });
    },
    [steps, openDialog, call, refetch, queryClient],
  );
  return enabled && steps ? openStep : undefined;
};

const RolesTab: FC<{
  description: WorkflowDescription;
  hideDisabled: boolean;
  hideDisabledSwitch: ReactNode;
  onOpenStep?: (stepKey: string, page: StepFormPage) => void;
}> = ({ description, hideDisabled, hideDisabledSwitch, onOpenStep }) => {
  const [actorKey, setActorKey] = useState<string | null>(null);
  const actorOptions = useMemo(
    () => [
      { value: null, label: translate('All roles') },
      ...description.actors.map((actor) => ({
        value: actor.key,
        label: actorTitle(actor),
      })),
    ],
    [description],
  );
  return (
    <ValidationPanel
      title={translate('Roles')}
      bodyClassName="pt-0"
      subtitle={translate(
        'Who sees, reads, contributes to, completes and is told about each step.',
      )}
      actions={
        <>
          {hideDisabledSwitch}
          <div style={{ width: widthOfLongest(actorOptions) }}>
            <Select
              aria-label={translate('Role')}
              options={actorOptions}
              value={actorOptions.find((option) => option.value === actorKey)}
              onChange={(option: any) => setActorKey(option?.value ?? null)}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        </>
      }
    >
      {!actorKey && (
        // The marks' meaning, between the header and the table, set off by
        // the border the table's own header row uses.
        <div className="border-b border-b-secondary py-2.5 text-sm text-quaternary">
          <RoleMatrixLegend />
        </div>
      )}
      <RoleMatrix
        key={`${hideDisabled}-${actorKey}`}
        description={description}
        hideDisabled={hideDisabled}
        actorKey={actorKey}
        onOpenStep={onOpenStep}
      />
    </ValidationPanel>
  );
};

/** What every sub-tab of the Validation page reads. */
interface ValidationContextValue {
  call: Call;
  description: WorkflowDescription;
  check?: WorkflowCheck;
  canConfigure: boolean;
  onOpenStep?: (stepKey: string, page: StepFormPage, field?: string) => void;
  hint: ReactNode;
  hideDisabled: boolean;
  setHideDisabled(value: boolean): void;
}

const ValidationContext = createContext<ValidationContextValue>(null);

const useValidation = () => useContext(ValidationContext);

const ShowDisabledSwitch: FC = () => {
  const { hideDisabled, setHideDisabled } = useValidation();
  return (
    <Switch
      label={translate('Show disabled steps')}
      checked={!hideDisabled}
      onCheckedChange={(show) => setHideDisabled(!show)}
    />
  );
};

const CheckTab: FC = () => {
  const { check, onOpenStep, hint } = useValidation();
  const openValidationTab = useOpenValidationTab();
  const [showNotes, setShowNotes] = useState(false);
  return (
    <ValidationPanel
      title={translate('Check')}
      // The findings table starts right under the header, as on a table card.
      bodyClassName={hint ? undefined : 'pt-0'}
      subtitle={
        check
          ? checkVerdict(check)
          : translate('What would stop the workflow working, worst first.')
      }
      actions={
        check?.summary.info > 0 && (
          <Switch
            label={translate('Show notes ({count})', {
              count: check.summary.info,
            })}
            checked={showNotes}
            onCheckedChange={setShowNotes}
          />
        )
      }
    >
      {check ? (
        <WorkflowCheckPanel
          check={check}
          showNotes={showNotes}
          onOpenStep={onOpenStep}
          onOpenNotifications={() => openValidationTab('notifications')}
          hint={hint}
        />
      ) : (
        <LoadingSpinner />
      )}
    </ValidationPanel>
  );
};

const RolesSubTab: FC = () => {
  const { description, hideDisabled, onOpenStep } = useValidation();
  return (
    <RolesTab
      description={description}
      hideDisabled={hideDisabled}
      hideDisabledSwitch={<ShowDisabledSwitch />}
      onOpenStep={onOpenStep}
    />
  );
};

const NotificationsPanel: FC<{ hideDisabled: boolean }> = ({
  hideDisabled,
}) => {
  const { description } = useValidation();
  const items = useNotificationTabs({ description, hideDisabled }).filter(
    (item) => !item.hidden,
  );
  const [tab, setTab] = useState('rules');
  return (
    // The view switcher sits in the panel's header, sized like its Export.
    <ValidationPanel
      title={translate('Notifications')}
      subtitle={notificationTabIntro(tab)}
      bodyClassName="pt-0"
      actions={
        <>
          <ShowDisabledSwitch />
          <SegmentedControl<string>
            aria-label={translate('Notifications')}
            size="lg"
            options={items.map((item) => ({
              value: item.value,
              label: item.title,
            }))}
            value={tab}
            onValueChange={setTab}
          />
        </>
      }
    >
      {items.find((item) => item.value === tab)?.content}
    </ValidationPanel>
  );
};

const NotificationsTab: FC = () => {
  const { hideDisabled } = useValidation();
  return (
    <NotificationsPanel
      key={String(hideDisabled)}
      hideDisabled={hideDisabled}
    />
  );
};

const DiagramTab: FC = () => {
  const { description, call, hideDisabled, onOpenStep } = useValidation();
  return (
    <ValidationPanel
      title={translate('Diagram')}
      subtitle={translate('Each step by who acts on it, and what leads where.')}
      actions={<ShowDisabledSwitch />}
    >
      <WorkflowDiagramPanel
        description={description}
        name={call.name}
        callUuid={call.uuid}
        onOpenStep={onOpenStep}
        showDisabled={!hideDisabled}
      />
    </ValidationPanel>
  );
};

const TimelineTab: FC = () => {
  const { description, call } = useValidation();
  return (
    <ValidationPanel
      title={translate('Timeline')}
      subtitle={translate(
        "How long the workflow takes against the round's dates.",
      )}
    >
      <WorkflowTimelinePanel description={description} name={call.name} />
    </ValidationPanel>
  );
};

const PathsTab: FC = () => {
  const { description, call } = useValidation();
  return (
    <ValidationPanel
      title={translate('Paths')}
      bodyClassName="pt-0"
      subtitle={translate(
        'The routes proposals have taken through the workflow.',
      )}
    >
      <WorkflowPathsPanel description={description} callUuid={call.uuid} />
    </ValidationPanel>
  );
};

const DryRunTab: FC = () => {
  const { description, call, hideDisabled } = useValidation();
  return (
    <ValidationPanel
      title={translate('Dry run')}
      subtitle={
        <>
          {translate('A pretend proposal walked through the workflow.')}{' '}
          {translate('Nothing is sent or kept.')}
          <HelpIcon
            className="ms-1"
            label={translate(
              'Every click replays the whole path from the submission.',
            )}
          />
        </>
      }
      actions={<ShowDisabledSwitch />}
    >
      <DryRunPanel
        call={call}
        description={description}
        hideDisabled={hideDisabled}
      />
    </ValidationPanel>
  );
};

const ScenariosTab: FC = () => {
  const { description, call, canConfigure, onOpenStep } = useValidation();
  return (
    <ValidationPanel
      title={translate('Scenarios')}
      subtitle={translate('Saved paths the workflow must keep passing.')}
    >
      <CallScenariosPanel
        callUuid={call.uuid}
        description={description}
        canRun={canConfigure}
        onOpenStep={onOpenStep}
      />
    </ValidationPanel>
  );
};

const ChangesTab: FC = () => {
  const { call } = useValidation();
  const views = changesViews(call);
  const [view, setView] = useState(views[0].value);
  return (
    <ValidationPanel
      title={translate('Changes')}
      // The history table starts right under the header; the other views
      // open with text.
      bodyClassName={view === 'history' ? 'pt-0' : undefined}
      subtitle={views.find((candidate) => candidate.value === view)?.intro}
      actions={
        <SegmentedControl<string>
          aria-label={translate('Changes')}
          size="lg"
          options={views.map(({ value, label }) => ({ value, label }))}
          value={view}
          onValueChange={setView}
        />
      }
    >
      <WorkflowChangesSection call={call} view={view} />
    </ValidationPanel>
  );
};

/**
 * The Validation page of a call, between Manage and Edit: whether the
 * call's workflow works as intended before proposals go through it. Its
 * sections -- the check, who takes part in each step and who is told what,
 * the workflow drawn and scheduled, the paths its proposals took, a dry
 * run, the scenarios, and the workflow's changes --
 * are the tabs of the page's bar; those with nothing to show are left out.
 * Read-only; the findings and matrix marks open a step's dialog for those
 * who may change the call.
 */
export const CallValidationBody: FC<{ call: Call }> = ({ call }) => {
  const user = useUser();
  const canConfigure = call.state !== 'archived' && canUpdateCall(user, call);
  const description = useCallWorkflowDescription(call.uuid);
  const { data: check } = useCallWorkflowCheck(call.uuid);
  const onOpenStep = useOpenStep(call, canConfigure);
  const [hideDisabled, setHideDisabled] = useState(true);

  // Sections with nothing to show are left out: scenarios need scenarios,
  // paths need proposals and changes a saved version. The queries are the sections' own, so
  // opening one fetches nothing again.
  const scenarios = useCallScenarios(call.uuid);
  const versions = useCallWorkflowVersions(call.uuid);
  const { data: proposalsCount } = useQuery({
    queryKey: ['callProposalsCount', call.uuid],
    queryFn: () =>
      proposalProposalsList({
        query: { call_uuid: call.uuid, page: 1, page_size: 1 },
      }).then(fetchResultCount),
    refetchOnWindowFocus: false,
  });
  const showScenarios = Boolean(
    scenarios.data?.scenarios.length || scenarios.data?.results.length,
  );
  const showPaths = Boolean(proposalsCount);
  const showChanges = Boolean(versions.data?.length);

  // For staff, why the scenarios are missing: a call set up by hand has no
  // template to bring them.
  const staff = useSelector(isStaff);
  const hint =
    staff && scenarios.data && !showScenarios
      ? call.template_uuid
        ? translate(
            "This call's template has no saved scenarios, so their tab is not shown.",
          )
        : translate(
            'This call was not created from a template, so it has no saved scenarios to check.',
          )
      : null;

  const flagged =
    description.data?.notifications.flags.filter(
      (flag) => flag.severity === 'warning',
    ).length ?? 0;
  const blocking = check ? check.summary.error + check.summary.warning : 0;

  const tabs = useMemo<PageBarTab[]>(
    () => [
      {
        key: 'check',
        title: translate('Check'),
        count: blocking || undefined,
        countVariant: check?.summary.error ? 'danger' : 'warning',
        // "2 errors, 5 warnings": the number alone does not say which.
        countLabel: check ? summaryText(check.summary) : undefined,
        component: CheckTab,
      },
      { key: 'roles', title: translate('Roles'), component: RolesSubTab },
      {
        key: 'notifications',
        title: translate('Notifications'),
        count: flagged || undefined,
        countVariant: 'warning',
        countLabel:
          flagged === 1
            ? translate('1 warning')
            : translate('{count} warnings', { count: flagged }),
        component: NotificationsTab,
      },
      { key: 'diagram', title: translate('Diagram'), component: DiagramTab },
      { key: 'timeline', title: translate('Timeline'), component: TimelineTab },
      {
        key: 'paths',
        title: translate('Paths'),
        component: PathsTab,
        visible: showPaths,
      },
      {
        key: 'dry-run',
        title: translate('Dry run'),
        component: DryRunTab,
        visible: canConfigure,
      },
      {
        key: 'scenarios',
        title: translate('Scenarios'),
        component: ScenariosTab,
        visible: showScenarios,
      },
      {
        key: 'changes',
        title: translate('Changes'),
        component: ChangesTab,
        visible: showChanges,
      },
    ],
    [
      blocking,
      check,
      flagged,
      showPaths,
      canConfigure,
      showScenarios,
      showChanges,
    ],
  );
  const {
    tabSpec: { component: Component, key: activeKey },
  } = usePageTabsTransmitter(tabs);
  // A link to a section that is hidden here lands on the check instead,
  // once it is known which sections there are.
  const hidden = tabs.find((tab) => tab.key === activeKey)?.visible === false;
  const settled =
    !scenarios.isLoading && !versions.isLoading && proposalsCount !== undefined;
  const router = useRouter();
  useEffect(() => {
    if (settled && hidden) {
      router.stateService.go('.', { tab: 'check' }, { location: 'replace' });
    }
  }, [settled, hidden, router]);

  const context = useMemo<ValidationContextValue>(
    () =>
      description.data
        ? {
            call,
            description: description.data,
            check,
            canConfigure,
            onOpenStep,
            hint,
            hideDisabled,
            setHideDisabled,
          }
        : null,
    [
      call,
      description.data,
      check,
      canConfigure,
      onOpenStep,
      hint,
      hideDisabled,
    ],
  );

  return (
    <section data-testid="workflow-validation">
      {description.isLoading ? (
        <LoadingSpinner />
      ) : description.error || !context ? (
        <LoadingErred loadData={description.refetch} />
      ) : (
        <ValidationContext.Provider value={context}>
          {hidden ? <CheckTab /> : <Component />}
        </ValidationContext.Provider>
      )}
    </section>
  );
};
