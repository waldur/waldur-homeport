import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ProtectedRound } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import {
  canViewRoundAdoption,
  getEffectiveCompletionRule,
  getRoundLifecycleState,
  undecidedAtCompletionLabel,
} from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

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
}

const formatTimestamp = (value: string | null | undefined) =>
  value ? formatDateTime(value) : renderFieldOrDash(null);

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
    <Row className="mt-4">
      <Col md={6}>
        <SectionTitle title={translate('Evaluation and results')} />
        <Field label={translate('Stage')} value={lifecycle.label} />
        <Field
          label={translate('Evaluation started')}
          value={formatTimestamp(row.evaluation_started_at)}
        />
        <Field
          label={translate('Decision started')}
          value={formatTimestamp(row.deciding_started_at)}
        />
        <Field
          label={translate('Results published')}
          value={formatTimestamp(row.results_published_at)}
        />
        {row.results_published_by_name ? (
          <Field
            label={translate('Published by')}
            value={row.results_published_by_name}
          />
        ) : null}
        {row.results_forced_reason ? (
          <Field
            label={translate('Published before all decisions were made')}
            value={row.results_forced_reason}
          />
        ) : null}
        {row.held_decisions_count ? (
          <Field
            label={translate('Held decisions')}
            value={translate('{count} decision(s) waiting to be released', {
              count: row.held_decisions_count,
            })}
          />
        ) : null}
        <Field
          label={translate('Closed')}
          value={formatTimestamp(row.closed_at)}
        />
      </Col>
      {showAdoption ? (
        <Col md={6} data-testid="round-adoption">
          <SectionTitle title={translate('Adoption')} />
          <Field
            label={translate('Adopted on')}
            value={
              row.adopted_at
                ? formatDate(row.adopted_at)
                : translate('Not recorded')
            }
          />
          <Field
            label={translate('Note')}
            value={renderFieldOrDash(row.adoption_note)}
          />
          <Field
            label={translate('Document')}
            value={
              row.adoption_document ? (
                <FileDownloader
                  url={row.adoption_document}
                  name={adoptionDocumentName(row.adoption_document)}
                  className="text-btn text-hover-primary d-inline-flex align-items-center"
                >
                  <DownloadSimpleIcon weight="bold" className="me-1" />
                  {translate('Download document')}
                </FileDownloader>
              ) : (
                renderFieldOrDash(null)
              )
            }
          />
        </Col>
      ) : null}
    </Row>
  );
};

const SectionTitle: FunctionComponent<{
  title: string;
  className?: string;
}> = ({ title, className }) => (
  <div className={`fw-bold text-muted mb-3 ${className || ''}`}>{title}</div>
);

export const RoundExpandableRow: FunctionComponent<RoundExpandableRowProps> = ({
  row,
  call,
}) => {
  const completionRule = call ? getEffectiveCompletionRule(row, call) : null;
  return (
    <ExpandableContainer>
      <Row>
        <Col md={6}>
          <SectionTitle title={translate('Submission settings')} />
          <Field
            label={translate('Start time')}
            value={formatDateTime(row.start_time)}
          />
          <Field
            label={translate('Cutoff time')}
            value={formatDateTime(row.cutoff_time)}
          />
          <SectionTitle title={translate('Review settings')} className="mt-4" />
          <Field
            label={translate('Review duration in days')}
            value={renderFieldOrDash(row.review_duration_in_days)}
          />
        </Col>
        <Col md={6}>
          <SectionTitle title={translate('Allocation settings')} />
          <Field
            label={translate('Allocation date')}
            value={
              row.allocation_date
                ? formatDateTime(row.allocation_date)
                : renderFieldOrDash(null)
            }
          />
          {completionRule ? (
            <Field
              label={translate('Undecided proposals at completion')}
              value={translate('{rule} ({source})', {
                rule: undecidedAtCompletionLabel(completionRule.rule),
                source: completionRule.inherited
                  ? translate("the call's setting")
                  : translate('set for this round'),
              })}
            />
          ) : null}
        </Col>
      </Row>
      <RoundResultsSection row={row} call={call} />
    </ExpandableContainer>
  );
};
