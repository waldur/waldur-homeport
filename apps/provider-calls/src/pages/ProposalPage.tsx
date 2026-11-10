import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  ProposalWorkflowStepInstance,
  proposalProposalsRetrieve,
  proposalRequestedResourcesList,
  ProviderRequestedResource,
  StepContribution,
  usersMeRetrieve,
} from 'waldur-js-client';
import {
  ContributionCard,
  fetchProposalWorkflowStates,
  latestInstanceOfEachStep,
  proposalWorkflowStatesKey,
  useProposalContributions,
} from 'waldur-proposals';
import {
  AppLink,
  Badge,
  BreadcrumbTrail,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingSpinner,
  PropertyList,
} from 'waldur-ui';

import { DASH, formatAmount, formatDate, proposalStateBadge } from '../format';
import { offeringTeamProposalUrl } from '../links';
import { Provider } from '../providers';
import { navigate, pageHref } from '../router';

const STEP_STATUS_BADGES: Record<
  string,
  { label: () => string; variant: 'neutral' | 'blue' | 'success' | 'warning' }
> = {
  pending: { label: () => translate('Not started'), variant: 'neutral' },
  active: { label: () => translate('Running'), variant: 'blue' },
  completed: { label: () => translate('Done'), variant: 'success' },
  skipped: { label: () => translate('Skipped'), variant: 'neutral' },
  expired: { label: () => translate('Expired'), variant: 'warning' },
  withdrawn: { label: () => translate('Withdrawn'), variant: 'neutral' },
};

const PHASE_LABELS: Record<string, () => string> = {
  extension: () => translate('Extension'),
  closing: () => translate('Closing'),
};

/** Where the portal's proposal page shows a step's contributions. */
const stepSection = (step: ProposalWorkflowStepInstance) =>
  `step-contributions-${step.call_step_uuid}`;

const useMe = () =>
  useQuery({
    queryKey: ['provider-calls', 'me'],
    queryFn: async () => (await usersMeRetrieve()).data,
    staleTime: 5 * 60_000,
  });

/** What the proposal asks of the provider's offerings, one row per request. */
const useOwnRequests = (proposalUuid: string, providerUuid?: string) =>
  useQuery({
    queryKey: [
      'provider-calls',
      'proposal-requests',
      proposalUuid,
      providerUuid,
    ],
    queryFn: async () =>
      ((
        await proposalRequestedResourcesList({
          query: {
            proposal_uuid: proposalUuid,
            ...(providerUuid ? { provider_uuid: providerUuid } : {}),
            page_size: 100,
          },
        })
      ).data ?? []) as ProviderRequestedResource[],
  });

const RequestedLimits = ({ rows }: { rows: ProviderRequestedResource[] }) => {
  const lines = rows.flatMap((row) =>
    Object.entries(row.limits ?? {}).map(([key, value]) => ({
      key: `${row.uuid}-${key}`,
      label: key,
      value,
    })),
  );
  if (!lines.length) {
    return null;
  }
  return (
    <div>
      <div className="font-semibold">{translate('Requested')}</div>
      <ul className="mb-0">
        {lines.map((line) => (
          <li key={line.key}>
            <span className="text-quaternary">{line.label}: </span>
            {formatAmount(line.value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * One proposal as the provider's offering team sees it: what it asks of the
 * provider's offerings, the steps it walks, and the team's contributions,
 * which are submitted, handed on and accepted here. The step's form and
 * the rest of the proposal are on the portal's page, linked.
 */
export const ProposalPage = ({
  proposalUuid,
  provider,
}: {
  proposalUuid: string;
  provider?: Provider;
}) => {
  const me = useMe();
  const proposal = useQuery({
    queryKey: ['provider-calls', 'proposal', proposalUuid],
    queryFn: async () =>
      (await proposalProposalsRetrieve({ path: { uuid: proposalUuid } })).data,
  });
  const states = useQuery({
    queryKey: proposalWorkflowStatesKey(proposalUuid),
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
  });
  const contributions = useProposalContributions(proposalUuid);
  const requests = useOwnRequests(proposalUuid, provider?.uuid);

  const steps = useMemo(
    () => latestInstanceOfEachStep(states.data ?? []),
    [states.data],
  );
  // The contributions the backend lets this viewer read, by step: for an
  // offering team, its own offerings' slots.
  const byStep = useMemo(() => {
    const map = new Map<string, StepContribution[]>();
    for (const contribution of contributions.data ?? []) {
      const list = map.get(contribution.proposal_step_uuid) ?? [];
      list.push(contribution);
      map.set(contribution.proposal_step_uuid, list);
    }
    return map;
  }, [contributions.data]);
  const requestsByOffering = useMemo(() => {
    const map = new Map<string, ProviderRequestedResource[]>();
    for (const row of requests.data ?? []) {
      const key = row.requested_offering?.uuid;
      if (key) {
        map.set(key, [...(map.get(key) ?? []), row]);
      }
    }
    return map;
  }, [requests.data]);

  const portalUrl = provider
    ? offeringTeamProposalUrl(provider.uuid, proposalUuid)
    : null;
  const refetch = () => {
    states.refetch();
    contributions.refetch();
  };

  if (proposal.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }
  if (!proposal.data) {
    return (
      <div className="p-6">
        <EmptyState
          title={translate('Proposal not found')}
          message={translate(
            'It does not exist, or it requests none of your offerings.',
          )}
        />
      </div>
    );
  }

  const data = proposal.data;
  const state = proposalStateBadge(data.state);
  const stepsWithWork = steps.filter((step) => byStep.has(step.uuid));
  // Formatted here: the portal's typed date formatter (propVal.date) is not
  // in a package this app can use yet.
  const submitted = data.submitted_at ? formatDate(data.submitted_at) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BreadcrumbTrail
            items={[
              {
                key: 'app',
                text: translate('Calls'),
                onClick: () => navigate(pageHref('inbox')),
              },
              {
                key: 'proposals',
                text: translate('Proposals'),
                onClick: () => navigate(pageHref('proposals')),
              },
              { key: 'page', text: data.slug || data.name, active: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{data.name}</h1>
            <Badge variant={state.variant} shape="pill" hasBullet>
              {state.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-quaternary">
            {provider
              ? translate(
                  'You see this proposal as the offering team of {provider}: what it asks of your offerings and the steps your team works on.',
                  { provider: provider.name },
                )
              : null}
          </p>
        </div>
        {portalUrl ? (
          <AppLink to={portalUrl} className="text-brand hover:underline">
            {translate('Open the full proposal in the portal')}
          </AppLink>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
              {translate('Your team’s work')}
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4">
              {contributions.isLoading || states.isLoading ? (
                <LoadingSpinner />
              ) : stepsWithWork.length === 0 ? (
                <EmptyState
                  message={translate(
                    'No step of this proposal asks anything of your team yet.',
                  )}
                />
              ) : (
                stepsWithWork.map((step) => (
                  <section
                    key={step.uuid}
                    id={stepSection(step)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">
                        {step.step_name}
                      </h2>
                      {PHASE_LABELS[step.phase] ? (
                        <Badge variant="purple" shape="pill">
                          {PHASE_LABELS[step.phase]()}
                        </Badge>
                      ) : null}
                      {step.deadline ? (
                        <span className="text-xs text-quaternary">
                          {translate('Step due {date}', {
                            date: formatDate(step.deadline),
                          })}
                        </span>
                      ) : null}
                    </div>
                    {(byStep.get(step.uuid) ?? []).map((contribution) => (
                      <ContributionCard
                        key={contribution.uuid}
                        proposal={data}
                        step={step}
                        contribution={contribution}
                        currentUserUuid={me.data?.uuid}
                        formHref={
                          provider
                            ? offeringTeamProposalUrl(
                                provider.uuid,
                                proposalUuid,
                                stepSection(step),
                              )
                            : undefined
                        }
                        refetch={refetch}
                      >
                        {contribution.requested_offering_uuid ? (
                          <RequestedLimits
                            rows={
                              requestsByOffering.get(
                                contribution.requested_offering_uuid,
                              ) ?? []
                            }
                          />
                        ) : null}
                      </ContributionCard>
                    ))}
                  </section>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
              {translate('Project summary')}
            </CardHeader>
            <CardContent className="p-4">
              <p className="mb-0 whitespace-pre-line">
                {data.project_summary || DASH}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
              {translate('Details')}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <PropertyList variant="summary">
                <PropertyList.Item
                  label={translate('Call')}
                  value={data.call_name}
                />
                <PropertyList.Item
                  label={translate('Round')}
                  value={data.round?.name}
                />
                <PropertyList.Item
                  label={translate('Applicant')}
                  value={data.created_by_name}
                />
                <PropertyList.Item
                  label={translate('Science domain')}
                  value={data.science_domain_name}
                />
                <PropertyList.Item
                  label={translate('Submitted')}
                  value={submitted}
                />
                <PropertyList.Item
                  label={translate('Duration')}
                  value={
                    data.requested_duration_months
                      ? translate('{count} months', {
                          count: data.requested_duration_months,
                        })
                      : null
                  }
                />
              </PropertyList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0 text-sm font-semibold text-primary">
              {translate('Steps')}
            </CardHeader>
            <CardContent className="p-4">
              <ol className="mb-0 flex flex-col gap-2">
                {steps.map((step) => {
                  const badge = STEP_STATUS_BADGES[step.status] ?? {
                    label: () => step.status,
                    variant: 'neutral' as const,
                  };
                  return (
                    <li
                      key={step.uuid}
                      className="flex items-center justify-between gap-2"
                    >
                      <span
                        className={
                          byStep.has(step.uuid) ? 'font-semibold' : undefined
                        }
                      >
                        {step.status_label || step.step_name}
                      </span>
                      <Badge variant={badge.variant} shape="pill">
                        {badge.label()}
                      </Badge>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
