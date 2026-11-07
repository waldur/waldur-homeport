import { FunctionComponent } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { RoundMeetingNotesPanel } from '@/proposals/round/meeting-notes/RoundMeetingNotesPanel';
import { RoundRankingTable } from '@/proposals/round/ranking/RoundRankingTable';
import { RoundStepsPanel } from '@/proposals/round/steps/RoundStepsPanel';
import { formatRoundCutoff } from '@/proposals/roundCutoff';
import {
  canViewRoundAdoption,
  getEffectiveCompletionRule,
  getRoundLifecycleState,
  undecidedAtCompletionLabel,
} from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface RoundExpandableRowProps {
  // The public call page passes the nested round, without the protected
  // round's adoption record.
  row: Omit<
    ProtectedRound,
    | 'adopted_at'
    | 'adoption_note'
    | 'adoption_document'
    | 'results_forced_reason'
    | 'results_published_by_name'
    | 'proposals'
    | 'url'
    | 'held_decisions_count'
    | 'undecided_at_round_completion'
  > &
    Partial<ProtectedRound>;
  /** Given on the call team's page, where the completion rule is shown. */
  call?: Pick<Call, 'undecided_at_round_completion' | 'publish_results'>;
  /**
   * Given on the call team's page: the round's steps, ranking and meeting
   * notes are shown in tabs beside its details, editable by the call's
   * managers.
   */
  committee?: { canEdit: boolean; callUuid?: string; refetch?(): void };
}

/**
 * The adoption document is served through the media endpoint
 * (`/api/media/<token>/`), which carries no file name, so name it by what it
 * is unless the URL does end in one.
 */
const adoptionDocumentName = (url: string) => {
  const last = url.split('?')[0].split('/').filter(Boolean).pop() ?? '';
  return last.includes('.')
    ? decodeURIComponent(last)
    : translate('Adoption document');
};

const RoundResultsSection: FunctionComponent<RoundExpandableRowProps> = ({
  row,
  call,
}) => {
  const lifecycle = getRoundLifecycleState(row.lifecycle_state);
  if (!lifecycle) return null;
  // A withheld record comes back as nulls, which would read as "not
  // recorded"; leave the section out instead until the viewer may see it.
  const showAdoption =
    row.adopted_at !== undefined && canViewRoundAdoption(row, call);
  return (
    <PropertyList
      as="div"
      variant="summary"
      hideIfEmpty={false}
      className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mt-3"
    >
      <div>
        <h6 className="mb-2.5">{translate('Evaluation and results')}</h6>
        <PropertyList.Section>
          <PropertyItem label={translate('Stage')} value={lifecycle.label} />
          <PropertyItem
            label={translate('Evaluation started')}
            value={propVal.date(row.evaluation_started_at, {
              precision: 'datetime',
            })}
          />
          <PropertyItem
            label={translate('Decision started')}
            value={propVal.date(row.deciding_started_at, {
              precision: 'datetime',
            })}
          />
          <PropertyItem
            label={translate('Results published')}
            value={propVal.date(row.results_published_at, {
              precision: 'datetime',
            })}
          />
          {row.results_published_by_name ? (
            <PropertyItem
              label={translate('Published by')}
              value={row.results_published_by_name}
            />
          ) : null}
          {row.results_forced_reason ? (
            <PropertyItem
              label={translate('Published before all decisions were made')}
              value={row.results_forced_reason}
            />
          ) : null}
          {row.held_decisions_count ? (
            <PropertyItem
              label={translate('Held decisions')}
              value={translate('{count} decision(s) waiting to be released', {
                count: row.held_decisions_count,
              })}
            />
          ) : null}
          <PropertyItem
            label={translate('Closed')}
            value={propVal.date(row.closed_at, { precision: 'datetime' })}
          />
        </PropertyList.Section>
      </div>
      {showAdoption ? (
        <div data-testid="round-adoption">
          <h6 className="mb-2.5">{translate('Adoption')}</h6>
          <PropertyList.Section>
            <PropertyItem
              label={translate('Adopted on')}
              value={propVal.date(row.adopted_at)}
              placeholder={translate('Not recorded')}
            />
            <PropertyItem label={translate('Note')} value={row.adoption_note} />
            <PropertyItem
              label={translate('Document')}
              value={propVal.file(row.adoption_document, {
                fileName: adoptionDocumentName,
                text: translate('Download document'),
              })}
            />
          </PropertyList.Section>
        </div>
      ) : null}
    </PropertyList>
  );
};

const RoundDetails: FunctionComponent<RoundExpandableRowProps> = ({
  row,
  call,
}) => {
  const completionRule = call ? getEffectiveCompletionRule(row, call) : null;
  return (
    <>
      <PropertyList
        as="div"
        variant="summary"
        className="grid grid-cols-1 md:grid-cols-2 gap-x-5"
      >
        <div className="flex flex-col gap-6">
          <div>
            <h6 className="mb-2.5">{translate('Submission settings')}</h6>
            <PropertyList.Section>
              <PropertyItem
                label={translate('Start time')}
                value={propVal.date(row.start_time, { precision: 'datetime' })}
              />
              <PropertyItem
                label={translate('Cutoff time')}
                value={formatRoundCutoff(row)}
              />
            </PropertyList.Section>
          </div>
          <div>
            <h6 className="mb-2.5">{translate('Review settings')}</h6>
            <PropertyList.Section>
              <PropertyItem
                label={translate(
                  'Review duration without a step deadline (days)',
                )}
                value={row.review_duration_in_days}
                hideIfEmpty={false}
              />
            </PropertyList.Section>
          </div>
        </div>
        <div>
          <h6 className="mb-2.5">{translate('Allocation settings')}</h6>
          <PropertyList.Section>
            <PropertyItem
              label={translate('Allocation date')}
              value={propVal.date(row.allocation_date, {
                precision: 'datetime',
              })}
              hideIfEmpty={false}
            />
            {completionRule ? (
              <PropertyItem
                label={translate('Undecided proposals at completion')}
                value={translate('{rule} ({source})', {
                  rule: undecidedAtCompletionLabel(completionRule.rule),
                  source: completionRule.inherited
                    ? translate("the call's setting")
                    : translate('set for this round'),
                })}
              />
            ) : null}
          </PropertyList.Section>
        </div>
      </PropertyList>
      <RoundResultsSection row={row} call={call} />
    </>
  );
};

export const RoundExpandableRow: FunctionComponent<RoundExpandableRowProps> = (
  props,
) => {
  const { row, committee } = props;
  if (!committee) {
    return (
      <ExpandableContainer>
        <RoundDetails {...props} />
      </ExpandableContainer>
    );
  }
  const round = {
    uuid: row.uuid,
    name: row.name,
    slug: row.slug,
    lifecycle_state: row.lifecycle_state,
  };
  return (
    <ExpandableContainer>
      <EmbeddedTabs
        framed
        defaultValue="details"
        tabs={[
          {
            key: 'details',
            title: translate('Details'),
            // Inside the frame, in line with the tab strip's 12px inset.
            content: (
              <div className="p-3">
                <RoundDetails {...props} />
              </div>
            ),
          },
          {
            key: 'steps',
            title: translate('Steps'),
            hidden: !committee.callUuid,
            content: committee.callUuid ? (
              <RoundStepsPanel
                callUuid={committee.callUuid}
                round={row}
                canEdit={committee.canEdit}
                refetch={committee.refetch ?? (() => undefined)}
              />
            ) : null,
          },
          {
            key: 'ranking',
            title: translate('Ranking'),
            content: (
              <RoundRankingTable round={round} canEdit={committee.canEdit} />
            ),
          },
          {
            key: 'meeting-notes',
            title: translate('Meeting notes'),
            content: (
              <RoundMeetingNotesPanel
                round={round}
                canEdit={committee.canEdit}
                onReportChange={committee.refetch}
              />
            ),
          },
        ]}
      />
    </ExpandableContainer>
  );
};
