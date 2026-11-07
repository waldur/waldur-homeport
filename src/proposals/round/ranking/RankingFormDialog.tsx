import { FC, useEffect, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import {
  ProposalRanking,
  proposalRankingsCreate,
  proposalRankingsPartialUpdate,
  RequestedResource,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { NumberGroup, SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useOfferingAssessments } from '@/proposals/proposal/contributions/queries';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';

import {
  getRecommendedResources,
  proposalRankingKey,
  RecommendedResources,
  roundRankingsKey,
} from './rankings';

interface ProposalOption {
  value: string;
  label: string;
}

interface RankingFormDialogProps {
  resolve: {
    roundUuid: string;
    roundName: string;
    /** A new ranking goes in this round report rather than the overall one. */
    meetingNoteUuid?: string;
    /** Edit this ranking; otherwise a new one for a proposal picked here. */
    ranking?: ProposalRanking;
    /** The round's proposals not ranked yet, for a new ranking. */
    proposalOptions?: ProposalOption[];
    nextRank?: number;
    refetch(): void;
  };
}

interface RankingFormValues {
  proposal?: ProposalOption;
  rank?: number;
  final_score?: number | string | null;
  notes?: string;
  recommended?: Record<string, Record<string, number | string | null>>;
}

/** One requested offering of the proposal, with the components to recommend. */
interface OfferingRequest {
  uuid: string;
  name: string;
  components: { type: string; name: string; unit?: string }[];
  requested: Record<string, number>;
}

const groupRequests = (rows: RequestedResource[]): OfferingRequest[] => {
  const byOffering = new Map<string, OfferingRequest>();
  for (const row of rows) {
    const offering = row.requested_offering;
    if (!offering) continue;
    let entry = byOffering.get(offering.uuid);
    if (!entry) {
      entry = {
        uuid: offering.uuid,
        name: offering.offering_name,
        components: (offering.components ?? []).map((component) => ({
          type: component.type,
          name: component.name || component.type,
          unit: component.measured_unit,
        })),
        requested: {},
      };
      byOffering.set(offering.uuid, entry);
    }
    for (const [component, amount] of Object.entries(row.limits ?? {})) {
      entry.requested[component] = (entry.requested[component] ?? 0) + amount;
    }
  }
  return Array.from(byOffering.values());
};

const RecommendationFields: FC<{ proposalUuid?: string }> = ({
  proposalUuid,
}) => {
  const { data, isLoading } = useProposalResourceRows(proposalUuid ?? '');
  const requests = useMemo(() => groupRequests(data ?? []), [data]);
  // A partition its technical assessment rejected is flagged: whether the
  // committee may still recommend it is theirs to decide.
  const { data: assessments } = useOfferingAssessments(
    proposalUuid ?? '',
    Boolean(proposalUuid),
  );
  const rejectedAt = useMemo(() => {
    const result: Record<string, string> = {};
    for (const assessment of assessments ?? []) {
      if (
        assessment.status === 'submitted' &&
        assessment.outcome === 'rejected'
      ) {
        result[assessment.requested_offering_uuid] = assessment.step_name;
      }
    }
    return result;
  }, [assessments]);
  if (!proposalUuid) {
    return null;
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!requests.length) {
    return (
      <p className="text-quaternary">
        {translate('The proposal requests no resources to recommend.')}
      </p>
    );
  }
  return (
    <>
      <div className="font-medium mb-2.5">
        {translate('Recommended resources')}
      </div>
      {requests.map((request) => (
        <div key={request.uuid} className="mb-3">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-quaternary">{request.name}</span>
            {rejectedAt[request.uuid] && (
              <Badge
                variant="danger"
                size="sm"
                shape="pill"
                tone="outline"
                data-testid="rejected-offering"
              >
                {translate('Rejected at {step}', {
                  step: rejectedAt[request.uuid],
                })}
              </Badge>
            )}
          </div>
          {rejectedAt[request.uuid] && (
            <p className="text-quaternary text-xs mb-1.5">
              {translate(
                'The technical assessment rejected this offering. Leave the amounts empty unless the committee overrides it.',
              )}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            {request.components.map((component) => (
              <div key={component.type}>
                <NumberGroup
                  name={`recommended.${request.uuid}.${component.type}`}
                  label={
                    component.unit
                      ? `${component.name} (${component.unit})`
                      : component.name
                  }
                  min={0}
                  description={translate('Requested: {amount}', {
                    amount: request.requested[component.type] ?? 0,
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const SelectedProposalRecommendation: FC<{ fixedUuid?: string }> = ({
  fixedUuid,
}) => {
  const { values } = useFormState<RankingFormValues>();
  const form = useForm<RankingFormValues>();
  const selected = values.proposal?.value;
  // Amounts entered for one proposal's offerings mean nothing for another's.
  useEffect(() => {
    if (!fixedUuid) {
      form.change('recommended', {});
    }
  }, [fixedUuid, selected, form]);
  return <RecommendationFields proposalUuid={fixedUuid ?? selected} />;
};

/**
 * Rank a proposal of the round, or change its ranking: its place, the
 * committee's final score, the resources recommended per requested offering
 * and component, and notes for the call team.
 */
export const RankingFormDialog: FC<RankingFormDialogProps> = ({
  resolve: {
    roundUuid,
    roundName,
    meetingNoteUuid,
    ranking,
    proposalOptions,
    nextRank,
    refetch,
  },
}) => {
  const proposalUuid = ranking?.proposal_uuid;
  const initialValues = useMemo<RankingFormValues>(
    () =>
      ranking
        ? {
            rank: ranking.rank,
            final_score: ranking.final_score ?? null,
            notes: ranking.notes ?? '',
            recommended: getRecommendedResources(ranking),
          }
        : { rank: nextRank },
    [ranking, nextRank],
  );

  const save = useManagedMutation<any, any, RankingFormValues>({
    mutationFn: (values) => {
      const selectedUuid = proposalUuid ?? values.proposal?.value;
      const recommended = cleanRecommendation(values.recommended);
      const body = {
        rank: Number(values.rank),
        final_score:
          values.final_score === '' ||
          values.final_score === undefined ||
          values.final_score === null
            ? null
            : Number(values.final_score),
        notes: values.notes ?? '',
        recommended_resources: recommended,
      };
      if (ranking) {
        return proposalRankingsPartialUpdate({
          path: { uuid: ranking.uuid },
          body,
        });
      }
      return proposalRankingsCreate({
        body: {
          ...body,
          round: roundUuid,
          proposal: selectedUuid as string,
          ...(meetingNoteUuid ? { meeting_note: meetingNoteUuid } : {}),
        },
      });
    },
    successMessage: ranking
      ? translate('The ranking has been updated.')
      : translate('The proposal has been ranked.'),
    errorMessage: translate('Unable to save the ranking.'),
    refetch,
    invalidateQueries: [
      { queryKey: roundRankingsKey(roundUuid) },
      ...(proposalUuid ? [{ queryKey: proposalRankingKey(proposalUuid) }] : []),
    ],
  });

  return (
    <Form<RankingFormValues>
      onSubmit={(values) => save.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              ranking
                ? translate('Ranking of {proposal}', {
                    proposal: ranking.proposal_name,
                  })
                : translate('Rank a proposal of {round}', { round: roundName })
            }
            subtitle={
              meetingNoteUuid
                ? translate(
                    "Ranks are unique within the report. The round's overall ranking is kept apart.",
                  )
                : translate(
                    "Ranks are unique within the round. The recommendation can prefill the award in the proposal's allocation decision.",
                  )
            }
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Save')}
                />
              </>
            }
          >
            {!ranking ? (
              <SelectGroup
                name="proposal"
                label={translate('Proposal')}
                required
                validate={required}
                options={proposalOptions ?? []}
                placeholder={translate('Select proposal...')}
                description={
                  proposalOptions && !proposalOptions.length
                    ? translate(
                        'Every proposal being evaluated in this round is ranked.',
                      )
                    : undefined
                }
              />
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <div>
                <NumberGroup
                  name="rank"
                  label={translate('Rank')}
                  required
                  validate={required}
                  min={1}
                  step={1}
                />
              </div>
              <div>
                <NumberGroup
                  name="final_score"
                  label={translate('Final score')}
                  step="any"
                />
              </div>
            </div>
            <SelectedProposalRecommendation fixedUuid={proposalUuid} />
            <TextGroup
              name="notes"
              label={translate('Notes')}
              maxLength={2000}
              placeholder={translate(
                'For example, conditions of the recommendation',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};

/** The recommendation as entered, numbers only, empty components left out. */
const cleanRecommendation = (
  recommended: RankingFormValues['recommended'],
): RecommendedResources => {
  const result: RecommendedResources = {};
  for (const [offeringUuid, amounts] of Object.entries(recommended ?? {})) {
    for (const [component, raw] of Object.entries(amounts ?? {})) {
      if (raw === null || raw === undefined || raw === '') continue;
      const amount = Number(raw);
      if (Number.isNaN(amount)) continue;
      (result[offeringUuid] ??= {})[component] = amount;
    }
  }
  return result;
};
