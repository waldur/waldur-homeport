import { QueryClientProvider, QueryKey } from '@tanstack/react-query';
import {
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  SyntheticEvent,
  useMemo,
  useState,
} from 'react';
import { Provider, useStore } from 'react-redux';
import { createStore } from 'redux';
import {
  DryRunViewAsResult,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { Badge, HelpIcon } from 'waldur-ui';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { StepContributionsSection } from '@/proposals/proposal/contributions/StepContributionsSection';
import {
  stepsReadByApplicantElsewhere,
  stepsShowingInputs,
} from '@/proposals/proposal/inputs/queries';
import { ReleasedReportsSection } from '@/proposals/proposal/inputs/ReleasedReportsSection';
import { StepInputsSection } from '@/proposals/proposal/inputs/StepInputsSection';
import { ProposalDetails } from '@/proposals/proposal/ProposalDetails';
import { ProposalStateBadge } from '@/proposals/proposal/ProposalStateBadge';
import {
  ProposalView,
  ProposalViewOverride,
} from '@/proposals/proposal/proposalView';
import { WorkflowTimeline } from '@/proposals/proposal/WorkflowTimeline';
import { Proposal, ProposalReview } from '@/proposals/types';
import { latestInstanceOfEachStep } from '@/proposals/workflow/queries';
import { rootReducer } from '@/store/reducers';

import { createPreviewClient } from './previewClient';
import { previewFacts } from './previewFacts';

interface DryRunPreviewProps {
  view: DryRunViewAsResult;
  /** "Example reviewer 1 (an assigned reviewer)" */
  roleLabel: string;
  /** "Technical assessment completed"; none for a proposal as it stands. */
  pointLabel?: string;
  /** The whole proposal page as the role has it -- its summary, requests,
   * documents, team and reviews -- not only the workflow's parts: for a
   * real proposal, whose content is what the role reads. */
  page?: boolean;
}

/** The page's view a role of the workflow opens the proposal in: an
 * evaluator, a panel member, works on the plain proposal page. */
const pageViewOf = (role: string): ProposalView =>
  role === 'call_manager' || role === 'offering_team' || role === 'reviewer'
    ? role
    : 'applicant';

const noop = () => undefined;

const CONTROLS =
  'button, a, input, select, textarea, label, [role="button"], [role="combobox"], [role="option"], [role="menuitem"], [role="tab"], [tabindex]:not([tabindex="-1"]), [aria-expanded]';

/**
 * What a click or key may reach in a preview: what only shows more of what
 * was read -- a card's open/fold toggle, a tab, a table row that expands
 * (its body renders the row's own data). Every other control would act on
 * the real API, or fetch with the signed-in user's own session.
 */
export const isReadOnlyControl = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  const control = target.closest(CONTROLS);
  if (!control) {
    return Boolean(
      target.closest('tr')?.querySelector('[data-testid="row-expander"]'),
    );
  }
  if (control.getAttribute('role') === 'tab') return control.tagName !== 'A';
  return (
    control.hasAttribute('aria-expanded') &&
    control.hasAttribute('aria-controls')
  );
};

/**
 * A link to a section of the page ("On this page"): taken within the
 * preview -- the section opened and scrolled to -- and not by the router,
 * which would scroll the real page behind it. Whether it was.
 */
export const jumpWithinPreview = (
  target: EventTarget | null,
  container: HTMLElement,
) => {
  const link = target instanceof Element ? target.closest('a[href]') : null;
  const id = link?.getAttribute('href')?.split('#')[1];
  if (!id) return false;
  const section = container.querySelector(
    `[id="${CSS.escape(decodeURIComponent(id))}"]`,
  );
  if (!section) return false;
  const toggle = section.querySelector('[aria-controls]');
  if (
    toggle instanceof HTMLElement &&
    toggle.getAttribute('aria-expanded') === 'false'
  ) {
    toggle.click();
  }
  section.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  return true;
};

const stop = (event: SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const blockUnlessReadOnly = (event: SyntheticEvent) => {
  if (!isReadOnlyControl(event.target)) stop(event);
};

const readOnlyHandlers = {
  onClickCapture: (event: MouseEvent<HTMLElement>) => {
    if (jumpWithinPreview(event.target, event.currentTarget)) stop(event);
    else blockUnlessReadOnly(event);
  },
  onMouseDownCapture: blockUnlessReadOnly,
  onPointerDownCapture: blockUnlessReadOnly,
  // Moving focus is harmless; every other key would type or act.
  onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') blockUnlessReadOnly(event);
  },
  onSubmitCapture: blockUnlessReadOnly,
  onChangeCapture: blockUnlessReadOnly,
};

/** Whether a query the preview has no answer for is spelled out: in
 * development and in tests, so that a component asking for something the
 * dry run does not read is caught where it is written. */
const reportsMissing = () => Boolean(import.meta.env.DEV);

const keyLabel = (key: QueryKey) => JSON.stringify(key);

/**
 * One part of the page, read through a client of its own. A part asking for
 * a query the preview did not read is replaced by a neutral note rather
 * than the error the component would show for a failed fetch: the data is
 * not missing, it is outside what the preview reads. In development the
 * note names the query, and a warning says which part asked for it.
 */
const PreviewSection: FC<{
  view: DryRunViewAsResult;
  name: string;
  children: ReactNode;
  /** A whole page: what the preview did not read fails on its own card,
   * and the rest of the page is still shown. */
  partial?: boolean;
}> = ({ view, name, children, partial }) => {
  const [missing, setMissing] = useState<string[]>([]);
  const client = useMemo(
    () =>
      createPreviewClient(view, (key) => {
        const label = keyLabel(key);
        if (reportsMissing()) {
          // eslint-disable-next-line no-console
          console.warn(
            `Dry run preview: "${name}" asked for ${label}, which the dry run does not read.`,
          );
        }
        setMissing((current) =>
          current.includes(label) ? current : [...current, label],
        );
      }),
    [view, name],
  );
  if (partial) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  if (missing.length) {
    return (
      <div
        className="flex flex-wrap items-center gap-1.5 text-quaternary text-xs"
        data-testid="dry-run-not-previewed"
      >
        {translate('{part}: not part of the preview.', { part: name })}
        {reportsMissing() &&
          missing.map((label) => (
            <Badge key={label} variant="neutral" size="sm" tone="outline">
              {label}
            </Badge>
          ))}
      </div>
    );
  }
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

// A preview is read through clients made for it: another preview, of
// another synthetic proposal, starts the parts afresh, since a mounted
// query keeps the client it was first read through.
const previewIds = new WeakMap<DryRunViewAsResult, number>();
let lastPreviewId = 0;
const previewId = (view: DryRunViewAsResult) => {
  if (!previewIds.has(view)) previewIds.set(view, ++lastPreviewId);
  return previewIds.get(view);
};

/**
 * The proposal as a role of the workflow would read it, through the real
 * proposal components. Everything they read comes from the dry run's own
 * responses, fetched as a synthetic holder of the role; nothing is fetched
 * here, and nothing can be clicked.
 */
export const DryRunPreview: FC<DryRunPreviewProps> = ({
  view,
  roleLabel,
  pointLabel,
  page,
}) => {
  // The components read the signed-in user from the store: here, the
  // synthetic viewer, as the portal's own "me" endpoint answered for them.
  const realStore = useStore<any>();
  const me = view.responses.me?.data ?? view.viewer;
  const store = useMemo(() => {
    const state = realStore.getState();
    // A store of its own, with the app's reducers: a row expanded or a
    // table paged in the preview stays in the preview.
    return createStore(rootReducer, {
      ...state,
      workspace: { ...state.workspace, user: me },
    });
  }, [realStore, me]);

  const proposal =
    view.responses.proposal?.status === 200
      ? (view.responses.proposal.data as Proposal)
      : null;
  // As the page's own query keeps them: the latest run of each step.
  const states = useMemo(
    () =>
      latestInstanceOfEachStep(
        (view.responses.workflow_states?.status === 200
          ? view.responses.workflow_states.data
          : []) as unknown as ProposalWorkflowStepInstance[],
      ),
    [view],
  );
  const facts = useMemo(() => previewFacts(view), [view]);
  const isApplicant = view.role === 'applicant';
  // As the page lists them: the reviews handed in.
  const reviews = useMemo(
    () =>
      (
        (view.responses.reviews?.status === 200
          ? view.responses.reviews.data
          : []) as unknown as ProposalReview[]
      ).filter((review) => ['submitted', 'rejected'].includes(review.state)),
    [view],
  );

  return (
    // A bordered block of its own, as What happened above it.
    <Panel
      cardBordered
      className="mb-0"
      title={
        <>
          {translate('Preview as {who}', { who: roleLabel })}
          {/* The proposal's status as this role reads it; its name is the
              placeholder's, so it is left out. */}
          {proposal && (
            <span className="ms-1.5 inline-flex align-middle">
              <ProposalStateBadge row={proposal as any} />
            </span>
          )}
          {/* What this role sees differently from you, on demand; with
              nothing to show, the body says it instead. */}
          {proposal && facts.length > 0 && (
            <HelpIcon
              className="ms-1"
              aria-label={translate('Different from your view')}
              label={
                <div className="text-start" data-testid="dry-run-preview-facts">
                  <div className="font-semibold">
                    {translate('Different from your view')}
                  </div>
                  {facts.map((fact) => (
                    <div key={fact}>{fact}</div>
                  ))}
                </div>
              }
            />
          )}
        </>
      }
      // A panel inside the Dry run panel: a smaller title, as nested
      // panels have (RestrictionsInfoCard, FormNetworkSecurityStep).
      titleClassName="text-sm"
      subtitle={
        pointLabel
          ? translate('After: {point}', { point: pointLabel })
          : undefined
      }
      subtitleClassName="font-normal"
    >
      <div className="flex flex-col gap-3" data-testid="dry-run-preview">
        {/* With nothing to show, why: said in the body, not in a tooltip. */}
        {!proposal &&
          facts.map((fact) => (
            <p key={fact} className="text-quaternary mb-0">
              {fact}
            </p>
          ))}
        {proposal && (
          <Provider store={store}>
            {/* Read-only: the cards' own buttons would act on the real API.
              Only opening and folding a card gets through. */}
            <div
              {...readOnlyHandlers}
              className="flex flex-col gap-3 [&_a]:cursor-not-allowed [&_button:not([aria-controls])]:cursor-not-allowed"
              data-testid="dry-run-preview-page"
              key={previewId(view)}
            >
              <PreviewSection view={view} name={translate('Workflow progress')}>
                {/* Inside the preview's own border: the stepper's card drops
                    its frame rather than doubling it. */}
                <div className="[&>.card]:border-0! [&>.card]:shadow-none!">
                  <WorkflowTimeline
                    proposal={proposal}
                    // As their own views show it: the call team and an
                    // offering's team follow the real steps.
                    showDetails={
                      view.role === 'call_manager' ||
                      view.role === 'offering_team'
                    }
                  />
                </div>
              </PreviewSection>
              {page ? (
                <PreviewSection
                  view={view}
                  name={translate('Proposal page')}
                  partial
                >
                  <ProposalViewOverride.Provider value={pageViewOf(view.role)}>
                    {/* Lined up with the steps: without the page's side frame. */}
                    <div className="[&>div]:px-[0px]">
                      <ProposalDetails
                        proposal={proposal}
                        reviews={reviews}
                        refetch={noop}
                      />
                    </div>
                  </ProposalViewOverride.Provider>
                </PreviewSection>
              ) : (
                <>
                  <PreviewSection
                    view={view}
                    name={translate('Feedback to the applicant')}
                  >
                    <ReleasedReportsSection
                      proposal={proposal}
                      releasable={[]}
                    />
                  </PreviewSection>
                  <PreviewSection view={view} name={translate('Step inputs')}>
                    <StepInputsSection
                      proposal={proposal}
                      steps={stepsShowingInputs(states)}
                      isApplicant={isApplicant}
                    />
                  </PreviewSection>
                  <PreviewSection view={view} name={translate('Contributions')}>
                    <StepContributionsSection
                      proposal={proposal}
                      workflowStates={states}
                      hiddenStepUuids={
                        isApplicant ? stepsReadByApplicantElsewhere(states) : []
                      }
                    />
                  </PreviewSection>
                </>
              )}
            </div>
          </Provider>
        )}
      </div>
    </Panel>
  );
};
